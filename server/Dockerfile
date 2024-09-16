#image

FROM node:14-alpine

# working directory

WORKDIR /usr/src/app

# copy package.json and package-lock.json

COPY package*.json ./

# install server dependencies

RUN npm install

# copy rest of server code

COPY . .

# expose port

EXPOSE 3001

# start server

CMD ["npm", "start"]
