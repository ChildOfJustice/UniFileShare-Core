# UniFileShare application
Web application for storing and sharing your files in the cloud.
## Install:
1. Clone this repository.
2. Install all dependencies.
```bash
$ npm install
``` 
3. Install eb (Elastic Beanstalk) CLI: https://github.com/aws/aws-elastic-beanstalk-cli-setup.
4. Configure your AWS CLI


## Deploy (To a new Elastoc Beanstalk Environment):
Run these scripts from `package.json`:
* run `cloudformation-deploy` - initialize all cloud infrastructure.
* `wait!` until the CloudFormation stack is ready.
* run `deploy`. This will generate a file with all configuration (ids, database endpoint, passwords, etc), then build project, create an artifact and upload it to the Elastic Beanstalk environment. After, the script will publish rest of the database infrastructure. 

Other scripts:
* `start-dev` - run development server with `nodemon`.
* `start` - run production server.
* `test` - run all tests in `tests` directories.
* `watch` - run webpack with watch mode.
* `lint` - run eslint.

## Project description
**Project architecture**:
![](images/projectArchitecture.png)

**AWS platform project infrastructure<br>(CloudFormation template)**
![](images/awsArchitecture.png)

**Database schema**
![](images/databaseSchema.png)