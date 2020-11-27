echo 'export PATH="/home/sardor/.ebcli-virtual-env/executables:$PATH"' >> ~/.bash_profile && source ~/.bash_profile
#./util/GenerateConfigFile/generateConfigScript.sh
sh ./util/DeployScripts/dist.sh
eb create --single