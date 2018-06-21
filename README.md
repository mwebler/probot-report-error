# Probot: error reporter
> A [Probot](https://github.com/probot/probot) extension to report configuration errors for the end user of the app

The module has a pre defined configuration issue template with a body message, an error (formated as code in markdown) and a footer:
<img width="790" alt="issue reported by the module" src="https://user-images.githubusercontent.com/4449285/41708260-ee67b866-74f4-11e8-8db7-0b50b6bc9766.png">

## Usage
Install the module: `npm i mwebler/probot-report-error`

Instantiating a new issue reporter with **optional** default texts
```js
const IssueReporter = require('probot-report-error')
const configIssueReporter = new IssueReporter({
  title: 'A default title',
  body: `A default body message`,
  footer: 'A default footer',
});
```

Create a new issue with **optional** body, error or footer:
```js
	try{
		config = await getConfig(context, 'config.yml') // Trying to load config file
	} catch(error){
		const result =
				await configIssueReporter.createIssue(context.repo({github: context.github}), {error});
		if(result){
			console.log('Issue created!');
		}
		else {
			console.log('Issue already exists on repo')
		}
	}
```


### A note on parameters
For both `constructor` and `createIssue` methods you can specify the issue title, body, error and footer texts. 

Only the **title is required** to be set either in the constructor with a default value or when creating an issue.

If the other texts (body, error and footer) are not present, nothing is added to the issue comment.


For more information on the API, check the [docs](DOCS.md)

### Development
```
# Install dependencies
npm install

# Run test
npm run test
```

The project uses eslint for auto-formatting and jest as testing framework
