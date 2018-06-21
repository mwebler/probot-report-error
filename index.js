/** A github configuration issue reporter
 * It creates an issue in the repository like:
 *
 * **{Title} - Error loading app configuration**
 *
 * {body} - An error occurred loading your configuration.
 *
 * {Error} - ```YAMLException: bad indentation```
 *
 * {Footer} - Check the sintax of your config file. More information available at app.com/config
 */
class IssueReporter {
  /**
   * @param {Object} defaults - The default texts to be used when creating an issue
   * @param {string=} defaults.title - Default issue title
   * @param {string=} defaults.body - Default issue body
   * @param {string=} defaults.error - Default error to be reported
   * @param {string=} defaults.footer - Default footer information
  */
  constructor(defaults) {
    this.defaults = Object.assign({}, defaults);
  }

  /**
   * Create an issue in the repository with the defined title and body
   * @param {Context} context A Probot context
   * @param {Object} texts - The texts to be used in the issue.
   *    If not provided, the defaults are used.
   * @param {string=} texts.title - Issue title.
   *    If not provided and no default exists an error will be thrown
   * @param {string=} texts.body - Issue body
   * @param {string=} texts.error - Error to be reported
   * @param {string=} texts.footer - Footer information
   * @returns {Object} Issue creation result or null, if it wasn't created
   * @async
  */
  async createIssue(context, {
    title, body, error, footer,
  } = {}) {
    const issueTexts = {
      title: title || this.defaults.title,
      body: this.createIssueBody(body, error, footer),
    };

    if (!issueTexts.title) {
      throw new Error('A title is required for creating an issue');
    }

    const issue = context.repo(issueTexts);

    // Just create a new issue if there is not an open issue with same title
    const issueExists = await IssueReporter.checkOpenIssues(context, issueTexts.title);
    if (!issueExists) {
      return context.github.issues.create(issue);
    }
    return null;
  }

  /**
   * Create an issue body with body message, error and a footer
   * @param {string=} body - Issue body
   * @param {string=} error - Error to be reported
   * @param {string=} footer - Footer information
   * @returns {string} An issue body in the specified format
  */
  createIssueBody(body, error, footer) {
    const bodyLines = [];
    if (body || this.defaults.body) {
      bodyLines.push(body || this.defaults.body);
    }
    if (error || this.defaults.error) {
      // Format the error in markdown with ```
      bodyLines.push(`\`\`\`\n${error || this.defaults.error}\n\`\`\``);
    }
    if (footer || this.defaults.footer) {
      bodyLines.push(footer || this.defaults.footer);
    }

    return bodyLines.join('\n\n');
  }

  /**
   * Check if an issue already exists with same title
   * @param {Object} context - A Probot context
   * @param {string} title - The title of the issue to find
   * @returns {boolean} True if an issue with same title was found
   * @async
  */
  static async checkOpenIssues(context, title) {
    let currentPage = 1;
    let lastPage = false;
    while (!lastPage) {
      const result = await context.github.issues.getForRepo(context.repo({
        state: 'open', per_page: 100, page: currentPage,
      }));
      const issues = result.data;

      // For now, compare just the title and ignore pull requests
      const issue = issues.find(i => (i.title === title && !i.pull_request));
      if (typeof issue !== 'undefined') {
        return true;
      }

      if (issues.length < 100) {
        lastPage = true;
      }

      currentPage += 1;
    }
    return false;
  }
}

module.exports = IssueReporter;
