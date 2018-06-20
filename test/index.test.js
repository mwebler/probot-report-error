/* eslint-env jest */

const IssueReporter = require('../index');

const sampleRepo = { owner: 'owner', repo: 'repo' };

function mockContext(createIssue) {
  return {
    repo(params) {
      return Object.assign(sampleRepo, params);
    },

    github: {
      issues: {
        async create(params) {
          return createIssue(params); // todo check octokit result format
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

function mockCreateIssue(params) {
  return params;
}


test('throws on error', async () => {
  const issueText = {
    title: 'default title',
    comment: 'An error occured loading the config',
    error: yamlError.message,
    footer: 'default footer',
  };

  const reporter = new IssueReporter();

  expect.assertions(2);
  const spy = jest.fn().mockImplementationOnce(params => mockCreateIssue(params));
  await reporter.createIssue(mockContext(spy), issueText);
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith(Object.assign({
    title: issueText.title,
    body: `${issueText.comment}\n\n\`\`\`\n${issueText.error}\n\`\`\`\n\n${issueText.footer}`,
  }, sampleRepo));
});
