# build stage
FROM node:14-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# production stage
FROM nginx:stable-alpine

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Copy the template Nginx configuration
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

# Replace environment variables and start Nginx

CMD ["/bin/sh", "-c", "envsubst '${SERVER_NAME} ${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
