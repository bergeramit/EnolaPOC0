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

## To generate all needed PWA logos
```
npx pwa-asset-generator --background "#000000" .\src\public\img\logo@2x.png .\icons
```
the copy everything to the manifest.json and index.html and the icon folder