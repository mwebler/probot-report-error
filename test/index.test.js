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

const yamlError = {
  name: 'YAMLException',
  reason: 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulatedempty line',
  mark: {
    name: null,
    buffer: 'welcome: [invalid]: yaml\n\u0000',
    position: 18,
    line: 0,
    column: 18,
  },
  message: 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line at line 1, column 19:\n    welcome: [invalid]: yaml\n                      ^',
};

test('Should create an issue on the repo with provided title comment', async () => {
  const issueText = {
    title: 'default title',
    comment: 'An error occured loading the config',
    error: yamlError.message,
    footer: 'default footer',
  };

  const reporter = new IssueReporter();

  expect.assertions(3);
  const spy = jest.fn().mockImplementation(params => mockCreateIssue(params));
  const getSpy = jest.fn().mockImplementation(params => mockPaginatingIssueList(params, []));
  const result = await reporter.createIssue(mockContext(spy, getSpy), issueText);
  const expectedIssue = {
    title: issueText.title,
    body: `${issueText.comment}\n\n\`\`\`\n${issueText.error}\n\`\`\`\n\n${issueText.footer}`,
  };
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith(Object.assign(expectedIssue, sampleRepo));
  expect({ data: expectedIssue }).toMatchObject(result);
});

test('Should not create duplicated issues (with same title)', async () => {
  const issueText = {
    title: 'default title',
  };

  const reporter = new IssueReporter();

  expect.assertions(2);
  const mockImplementation = jest.fn().mockImplementation(params => mockCreateIssue(params));
  const getSpy =
    jest.fn().mockImplementation(params => mockPaginatingIssueList(params, simpleIssueList));
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
