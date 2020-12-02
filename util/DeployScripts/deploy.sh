#!/bin/bash
#echo 'export PATH="/home/sardor/.ebcli-virtual-env/executables:$PATH"' >> ~/.bashrc
echo "generating config file...";
sh ./util/GenerateConfigFile/generateConfigScript.sh;

echo "creating artifact...";
sh ./util/DeployScripts/dist.sh;

echo "executing elastic beanstalk create command...";
eb create --single;

echo "waiting app to create the database tables...";
sleep 10;

echo "publishing rest database infrastructure...";
sh ./util/SqlScripts/publish.sh

