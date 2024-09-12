#image

FROM node:18.16-alpine

# working directory

WORKDIR /app

# copy package.json and install dependencies

COPY package.json package-lock.json ./
RUN npm install --production

# copy rest

COPY . .

# set enviroment to production

ENV NODE_ENV=production

# expose port 3001

EXPOSE 3001

# run server in production mode

CMD ["npm", "start"]