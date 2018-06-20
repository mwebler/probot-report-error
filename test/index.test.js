/* eslint-env jest */

const IssueReporter = require('../index');

const sampleRepo = { owner: 'owner', repo: 'repo' };

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
        async getAll(params) {
          return getAllIssues(params);
        },
      },
    },
  };
}

function mockCreateIssue(params) {
  return params;
}

function emptyIssueListMock() {
  return [];
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

  expect.assertions(2);
  const spy = jest.fn().mockImplementationOnce(params => mockCreateIssue(params));
  await reporter.createIssue(mockContext(spy, emptyIssueListMock), issueText);
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith(Object.assign({
    title: issueText.title,
    body: `${issueText.comment}\n\n\`\`\`\n${issueText.error}\n\`\`\`\n\n${issueText.footer}`,
  }, sampleRepo));
});

test('Should not create duplicated issues (with same title)', async () => {
  const issueText = {
    title: 'default title',
    comment: 'An error occured loading the config',
    error: yamlError.message,
    footer: 'default footer',
  };

  const reporter = new IssueReporter();

  expect.assertions(2);
  const createSpy = jest.fn().mockImplementation(params => mockCreateIssue(params));
  const getSpy = jest.fn().mockImplementation(() => [{ title: 'issue 1' }, { title: 'default title' }]);
  await reporter.createIssue(mockContext(createSpy, getSpy), issueText);

  // Should make the call to get all issues
  expect(getSpy).toHaveBeenCalledTimes(1);
  // But not the call to create
  expect(createSpy).toHaveBeenCalledTimes(0);
});
