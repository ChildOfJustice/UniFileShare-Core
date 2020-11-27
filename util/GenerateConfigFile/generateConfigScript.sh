#!/bin/bash
rm "./util/config.ts"
cat "./util/GenerateConfigFile/StackName.info" | xargs -I {} aws cloudformation describe-stacks --stack-name {} > "./util/GenerateConfigFile/stack_description.json" ; python3 ./util/GenerateConfigFile/generate_config_file.py
