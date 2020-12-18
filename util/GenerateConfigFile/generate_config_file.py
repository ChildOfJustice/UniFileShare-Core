import os
import sys
import json
import subprocess

# CONFIGURATION:
maxUserStorageSize_MB = '1.0'
aws_region = 'aws_region'
bucket_name = 'bucket_name'
bucket_region = aws_region
port = '8080'

#



#stack_description_json = sys.argv[1]

stack_description_json_file = open('./util/GenerateConfigFile/stack_description.json',mode='r')
stack_description_json = stack_description_json_file.read()
stack_description_json_file.close()
os.remove('./util/GenerateConfigFile/stack_description.json')


stack_description_dictionary = json.loads(stack_description_json)

command = 'aws cognito-idp describe-user-pool-client --user-pool-id '+ stack_description_dictionary['Stacks'][0]['Outputs'][1]['OutputValue'] + ' --client-id ' + stack_description_dictionary['Stacks'][0]['Outputs'][0]['OutputValue'] + ' > ./util/GenerateConfigFile/userpool_description.json'
os.system(command)

secret_data_json_file = open('./util/GenerateConfigFile/userpool_description.json',mode='r')
secret_data_json = secret_data_json_file.read()
secret_data_json_file.close()
os.remove('./util/GenerateConfigFile/userpool_description.json')

secret_data_dictionary = json.loads(secret_data_json)

result_file = open("./util/config.ts", 'w')

output_string = ("export default {\n"
"    AppConfig: {\n"
"        RolesIds: {\n"
"            admin: 1,\n"
"            user: 2\n"
"        },\n"
"\n"
"        maxUserStorageSize_MB: " + maxUserStorageSize_MB + "\n"
"    },\n"
"\n"
"    AWS: {\n"
"        region: '"+ aws_region +"',\n"
"        S3: {\n"
"            bucketName: '"+ bucket_name +"',\n"
"            bucketRegion: '"+ bucket_region +"'\n"
"        },\n"
"        IdentityPool: {\n"
"            IdentityPoolId: '"+ stack_description_dictionary['Stacks'][0]['Outputs'][3]['OutputValue'] + "'\n"
"        },\n"
"\n"
"    },\n"
"\n"
"    AdminConfig: {\n"
"        username: 'ADMIN',\n"
"        password: 'ADMIN_PASSWORD',\n"
"        email: 'email@gmail.com',\n"
"        id: 'fe3a5d01-a476-4f83-a527-cfce6574304d'\n"
"    },\n"
"\n"
"    server: {\n"
"        port: "+ port +"\n"
"    },\n"
"    userPoolId: '"+ stack_description_dictionary['Stacks'][0]['Outputs'][1]['OutputValue'] +"',\n"
"    userPoolRegion: '"+ aws_region +"',\n"
"    clientId: '"+ stack_description_dictionary['Stacks'][0]['Outputs'][0]['OutputValue'] +"',\n"
"    secretHash: '"+ secret_data_dictionary['UserPoolClient']['ClientSecret'] +"',\n"
"\n"
"    db: {\n"
"        name: 'dbname',\n"
"        username: 'postgres',\n"
"        password: 'SECRET',\n"
"        host: '"+ stack_description_dictionary['Stacks'][0]['Outputs'][4]['OutputValue'] +"',\n"
"        port: 5432,\n"
"    }\n"
"}")
result_file.write(output_string)

# result_file.write(stack_description_dictionary['Stacks'][0]['Outputs'][1]['OutputValue'] + '\n')
# result_file.write(stack_description_dictionary['Stacks'][0]['Outputs'][0]['OutputValue'] + '\n')
# result_file.write(secret_data_dictionary['UserPoolClient']['ClientSecret'] + '\n')
# result_file.write(stack_description_dictionary['Stacks'][0]['Outputs'][2]['OutputValue'] + '\n')
# result_file.write(stack_description_dictionary['Stacks'][0]['Outputs'][3]['OutputValue'] + '\n')
result_file.close()

os.remove('./util/SqlScripts/publish.sh')
publish_database_file = open("./util/SqlScripts/publish.sh", 'a')
output_string = ("#!/bin/bash\n"
"export PGPASSWORD=SECRET\n"
"psql -U postgres -h "+ stack_description_dictionary['Stacks'][0]['Outputs'][4]['OutputValue'] +" -d dbname -f ./util/SqlScripts/init.sql\n"
"psql -U postgres -h "+ stack_description_dictionary['Stacks'][0]['Outputs'][4]['OutputValue'] +" -d dbname -f ./util/SqlScripts/test.sql\n"
#psql -U fhsqtmbxgitotv -h ec2-107-20-15-85.compute-1.amazonaws.com -d dflgepe0gp719 -f test.sql
)
publish_database_file.write(output_string)
publish_database_file.close()