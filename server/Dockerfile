# runtime

FROM node:18.16-alpine

# set working directory

WORKDIR /app

# copy package.json file and install dependencies

COPY package.json package-lock.json ./

RUN npm install

# copy rest

COPY . .

# expose port

EXPOSE 3001

# start server

CMD ["npm", "run", "dev"]