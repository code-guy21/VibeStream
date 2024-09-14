# image

FROM node:18.16-alpine

# working directory 

WORKDIR /app

# copy package.json and install dependencies

COPY package.json package-lock.json ./

RUN npm install

# copy rest

COPY . .

# export port

EXPOSE 3000

# run command

CMD ["npm", "start"]