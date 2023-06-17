# Running The project

## Run nakama server

```
cd src/server/gameServer
# to check compilation you can also - npm install && npx tsc
docker compose up --build nakama
```

## Run the web app

```
cd src/server/networkServer
npm install
node app.js # or if you use PM2 then pm2 start app.js
```

## Project URL

```
http://localhost:3000/
```