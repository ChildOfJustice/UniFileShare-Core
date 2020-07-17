scp -i ec2-key.pem script.sh ubuntu@54.93.227.96:
ssh -i ec2-key.pem ubuntu@54.93.227.96 'sudo chown root:root script.sh; sudo chmod 755 script.sh; sudo ./script.sh'
