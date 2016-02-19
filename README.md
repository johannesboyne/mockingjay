# NOTHING HERE, WORK IN PROGRESS

- *WARNING*: No tests, maybe wrong assumptions, ...

### Mockingjay

A simple local development setup to simulate AWS Lambda, S3, and DynamoDB executions.

**AWS internal API Workaround**

One has to edit its host env, e.g.: `127.0.0.1 test.localhost`.

### Do you need this?

... and want to have more information? Send me a p.m.


### Configuration / Usage

I'm using apex for the lambda deployment and thus it is heavily opinioated
towards apx.

```
// Folder Setup

project.json
functions
└── bar
    ├── function.json
    └── index.js
mockingjay
├── responses
│   ├── dynamodb/
│   └── s3/
├── awsapigateway.js => Local AWS API Gateway (executes lambdas through mockingjay)
├── awsservices.js   => Local AWS API (DynamoDB, S3, Lambda)
├── lambdarunner.js  => loads and executes the real-lambdas from a top functions folder
├── mock.json        => API Gateway config
└── mockingjay.js    => uses the lambdarunner as execution-runner

```
