/* eslint-env jest */

const IssueReporter = require('../index');

const sampleRepo = { owner: 'owner', repo: 'repo' };

function mockCreateIssue(params) {
  // Return just the title and the body for now...
  return {
    data: {
      title: params.title,
      body: params.body,
    },
  };
}

const simpleIssueList = [{ title: 'new issue' }, { title: 'default title' }];
const longIssueList = [...Array(234)].map((x, i) => ({ title: `issue ${i}` }));
const listWithPullRequest = [{ title: 'An error has occurred in the app', pull_request: {} }, { title: 'second issue' }];

function mockPaginatingIssueList(params, issueList) {
  const startIndex = (params.page - 1) * params.per_page;
  const endIndex = params.page * params.per_page;
  const list = issueList.slice(startIndex, endIndex);
  return Promise.resolve({ data: list });
}

function mockContext(createIssue, getAllIssues) {
  return {
    repo(params) {
      return Object.assign(sampleRepo, params);
    },

    github: {
      issues: { // todo check octokit result formats
        async create(params) {
          return createIssue(params);
        },
        async getForRepo(params, issueListMock) {
          return getAllIssues(params, issueListMock);
        },
      },
    },
  };
}

test('Should create an issue on the repo with provided title and body', async () => {
  expect.assertions(3);

  const issueText = {
    title: 'default title',
    body: 'An error occured loading the config',
    error: 'incomplete explicit mapping pair; a key node is missed',
    footer: 'default footer',
  };

  const spy = jest.fn().mockImplementation(params => mockCreateIssue(params));
  const getSpy = jest.fn().mockImplementation(params => mockPaginatingIssueList(params, []));

  const reporter = new IssueReporter();
  const result = await reporter.createIssue(mockContext(spy, getSpy), issueText);

  const expectedIssue = {
    title: issueText.title,
    body: `${issueText.body}\n\n\`\`\`\n${issueText.error}\n\`\`\`\n\n${issueText.footer}`,
  };
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith(Object.assign(expectedIssue, sampleRepo));
  expect({ data: expectedIssue }).toMatchObject(result);
});

test('Should not create duplicated issues (with same title)', async () => {
  expect.assertions(2);

  const issueText = {
    title: 'default title',
  };
  const mockImplementation = jest.fn().mockImplementation(params => mockCreateIssue(params));
  const getSpy =
    jest.fn().mockImplementation(params => mockPaginatingIssueList(params, simpleIssueList));

  const reporter = new IssueReporter();
  await reporter.createIssue(mockContext(mockImplementation, getSpy), issueText);

  // Should make the call to get all issues
  expect(getSpy).toHaveBeenCalledTimes(1);
  // But not the call to create
  expect(mockImplementation).toHaveBeenCalledTimes(0);
});

test('Should iterate correctly on issues pages', async () => {
  expect.assertions(2);
  const spy =
    jest.fn().mockImplementation(params => mockPaginatingIssueList(params, longIssueList));
  const result = await IssueReporter.checkOpenIssues(mockContext(null, spy), 'any title, just want to iterate all the list');

  // Should make 3 requests to github api
  expect(spy).toHaveBeenCalledTimes(3);
  expect(result).toBeFalsy();
});

test('Should disregard pull requests', async () => {
  expect.assertions(1);
  const spy =
    jest.fn().mockImplementation(params => mockPaginatingIssueList(params, listWithPullRequest));
  const result = await IssueReporter.checkOpenIssues(mockContext(null, spy), 'An error has occurred in the app');

  expect(result).toBeFalsy();
});

test('Should create an issue body using the default values if none is provided', async () => {
  expect.assertions(1);

  const defaults = {
    title: 'default title',
    body: 'An error occured loading the config',
    error: 'Should we have a default error?',
    footer: 'default footer',
  };

  const reporter = new IssueReporter(defaults);
  const body = reporter.createIssueBody();
  expect(body).toBe(`${defaults.body}\n\n\`\`\`\n${defaults.error}\n\`\`\`\n\n${defaults.footer}`);
});

test('Should throw when trying to create an issue without title', async () => {
  expect.assertions(1);

  const defaults = {
    footer: 'default footer',
  };

  const reporter = new IssueReporter(defaults);

  try {
    await reporter.createIssue();
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
  }
});
