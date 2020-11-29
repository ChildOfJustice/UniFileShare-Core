# UniFileShare application
## How to install:
1. Clone this repository.
2. Install all dependencies.
```bash
$ npm install
``` 

## How to start:
Run these scripts from `package.json`:
* run `cloudformation-deploy` - initialize all cloud infrastructure.
* `wait!` until CloudFormation stack is ready.
* run `generate-config-file` - create connection file with all secret information (ids, passwords and etc).
* update scripts in ./util/SqlScripts with a new database endpoint.
* run `build` - build whole project and save it to `build` directory.
* run `package` - create a new deploy artifact for ElasticBeanstalk in `dist` directory.
* install eb CLI: https://github.com/aws/aws-elastic-beanstalk-cli-setup.
* open terminal in root dir and run `echo 'export PATH="/home/sardor/.ebcli-virtual-env/executables:$PATH"' >> ~/.bash_profile && source ~/.bash_profile`.
* run `eb init`.
* run `eb create --single`.
* `add to default security group a new inboud rule for PostgreSQL` OR add to default security group new inboud rule, which accepts all traffic from elasticBeanstalk's security group. (The one, that was created with Elastic Beanstalk environment, after previous command).
* run `publish_db` to add manually integrated parts of database.

Other scripts:
* `start-dev` - run development server with `nodemon`.
* `start` - run production server.
* `test` - run all tests in `tests` directories.
* `watch` - run webpack with watch mode.
* `lint` - run eslint.