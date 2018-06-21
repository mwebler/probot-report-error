<a name="IssueReporter"></a>

## IssueReporter
A github configuration issue reporter

It creates an issue in the repository like:

**{Title} - Error loading app configuration**

{body} - An error occurred loading your configuration.

{Error} - ```YAMLException: bad indentation```

{Footer} - Check the sintax of your config file. More information available at app.com/config

**Kind**: global class  

* [IssueReporter](#IssueReporter)
    * [new IssueReporter(defaults)](#new_IssueReporter_new)
    * _instance_
        * [.createIssue(config, texts)](#IssueReporter+createIssue) ⇒ <code>Object</code>
        * [.createIssueBody([body], [error], [footer])](#IssueReporter+createIssueBody) ⇒ <code>string</code>
    * _static_
        * [.checkOpenIssues(config, title)](#IssueReporter.checkOpenIssues) ⇒ <code>boolean</code>

<a name="new_IssueReporter_new"></a>

### new IssueReporter(defaults)

| Param | Type | Description |
| --- | --- | --- |
| defaults | <code>Object</code> | The default texts to be used when creating an issue |
| [defaults.title] | <code>string</code> | Default issue title |
| [defaults.body] | <code>string</code> | Default issue body |
| [defaults.error] | <code>string</code> | Default error to be reported |
| [defaults.footer] | <code>string</code> | Default footer information |

<a name="IssueReporter+createIssue"></a>

### issueReporter.createIssue(config, texts) ⇒ <code>Object</code>
Create an issue in the repository with the defined title and body

**Kind**: instance method of [<code>IssueReporter</code>](#IssueReporter)  
**Returns**: <code>Object</code> - Issue creation result or null, if it wasn't created  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Github context and config |
| config.github | <code>Object</code> | An octokit object |
| config.owner | <code>Object</code> | Repository owner |
| config.repo | <code>Object</code> | Repository |
| texts | <code>Object</code> | The texts to be used in the issue.    If not provided, the defaults are used. |
| [texts.title] | <code>string</code> | Issue title.    If not provided and no default exists an error will be thrown |
| [texts.body] | <code>string</code> | Issue body |
| [texts.error] | <code>string</code> | Error to be reported |
| [texts.footer] | <code>string</code> | Footer information |

<a name="IssueReporter+createIssueBody"></a>

### issueReporter.createIssueBody([body], [error], [footer]) ⇒ <code>string</code>
Create an issue body with body message, error and a footer

**Kind**: instance method of [<code>IssueReporter</code>](#IssueReporter)  
**Returns**: <code>string</code> - An issue body in the specified format  

| Param | Type | Description |
| --- | --- | --- |
| [body] | <code>string</code> | Issue body |
| [error] | <code>string</code> | Error to be reported |
| [footer] | <code>string</code> | Footer information |

<a name="IssueReporter.checkOpenIssues"></a>

### IssueReporter.checkOpenIssues(config, title) ⇒ <code>boolean</code>
Check if an issue already exists with same title

**Kind**: static method of [<code>IssueReporter</code>](#IssueReporter)  
**Returns**: <code>boolean</code> - True if an issue with same title was found  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Github context and config |
| config.github | <code>Object</code> | An octokit object |
| config.owner | <code>Object</code> | Repository owner |
| config.repo | <code>Object</code> | Repository |
| title | <code>string</code> | The title of the issue to find |

