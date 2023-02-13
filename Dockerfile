FROM node:14 as base

WORKDIR /home/node/app

COPY package*.json ./

RUN yarn install

COPY . .

FROM base as production

ENV NODE_PATH=./build

RUN yarn build