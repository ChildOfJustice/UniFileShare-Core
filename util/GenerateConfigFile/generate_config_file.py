import os
import sys
import json
import subprocess

# CONFIGURATION:
maxUserStorageSize_MB = '1.0'
aws_region = 'eu-central-1'
bucket_name = 'sardor-test-app'
bucket_region = 'eu-central-1'
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

result_file = open("./util/config.ts", 'a')

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
"        password: 'uijknm',\n"
"        email: 'izzvms@gmail.com',\n"
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
"        name: 'dflgepe0gp719',\n"
"        username: 'postgres',\n"
"        password: '9173cde5f031d32690ef1af6af48216d6623016b2ecbb311cf',\n"
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
