FROM node:alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app && apk add python make g++
WORKDIR /home/node/app

COPY package*.json ./
USER node

RUN yarn
COPY --chown=node:node . .

RUN cd ressources && yarn install && yarn build

EXPOSE 3000
CMD [ "node", "index" ]