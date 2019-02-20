FROM node:alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY package*.json ./
USER node

RUN npm install
COPY --chown=node:node . .

RUN cd ressources && apk add python make g++ && npm install && npm run build

EXPOSE 3000
CMD [ "node", "index" ]