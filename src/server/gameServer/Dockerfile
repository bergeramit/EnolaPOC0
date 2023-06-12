FROM node:alpine AS node-builder

WORKDIR /backend

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .
RUN npx tsc

FROM registry.heroiclabs.com/heroiclabs/nakama:3.16.0

COPY --from=node-builder /backend/build/*.js /nakama/data/modules/build/
COPY --from=node-builder /backend/local.yml /nakama/data/