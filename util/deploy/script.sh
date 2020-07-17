PATH="/root/.nvm/versions/node/v12.18.2/bin:$PATH"

sudo git init

FILE=./main-app
if [ -d "$FILE" ]; then
    sudo git pull https://github.com/swimmwatch/main-app.git
else 
    sudo git clone https://github.com/swimmwatch/main-app.git
fi

cd main-app

npm install && npm run build && npm run start
