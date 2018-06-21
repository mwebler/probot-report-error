const GENERIC_TITLE = 'Error loading the app';

/** A github configuration issue reporter
 * It creates an issue in the repository like:
 *
 * **{Title} - Error loading app configuration**
 *
 * {Comment} - An error occurred loading your configuration.
 *
 * {Error} - ```YAMLException: bad indentation```
 *
 * {Footer} - Check the sintax of your config file. More information available at app.com/config
 */
class IssueReporter {
  /**
   * @param {Object} defaults - The default texts to be used when creating an issue
   * @param {string=} defaults.title - Default issue title
   * @param {string=} defaults.comment - Default issue comment
   * @param {string=} defaults.error - Default error to be reported
   * @param {string=} defaults.footer - Default footer information
  */
  constructor(defaults) {
    this.defaults = Object.assign({}, defaults);
  }

  /**
   * @param {Context} context A Probot context
   * @param {Object} texts - The texts to be used in the issue.
   *    If not provided, the defaults are used.
   * @param {string=} texts.title - Issue title.
   *    If not provided and no default exists, use a generic title
   * @param {string=} texts.comment - Issue comment
   * @param {string=} texts.error - Error to be reported
   * @param {string=} texts.footer - Footer information
   * @async
  */
  async createIssue(context, {
    title, comment, error, footer,
  }) {
    const issueTexts = {
      title: title || this.defaults.title || GENERIC_TITLE,
      body: this.createIssueBody(comment, error, footer),
    };
    const issue = context.repo(issueTexts);

    // Just create a new issue if there is not an open issue with same title
    const issueExists = await IssueReporter.checkOpenIssues(context, issueTexts.title);
    if (!issueExists) {
      return context.github.issues.create(issue);
    }
    return null;
  }

  createIssueBody(comment, error, footer) {
    const bodyLines = [];
    if (comment || this.defaults.comment) {
      bodyLines.push(comment || this.defaults.comment);
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

  static async checkOpenIssues(context, title) {
    let currentPage = 1;
    let lastPage = false;
    while (!lastPage) {
      const result = await context.github.issues.getForRepo(context.repo({
        state: 'open', per_page: 100, page: currentPage,
      }));
      const issues = result.data;

      // For now, compare just the title
      const issue = issues.find(i => i.title === title);
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
