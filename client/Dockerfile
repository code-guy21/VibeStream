# serve with Nginx

FROM nginx:alpine

# Copy the pre-built React app from the local machine to the Nginx web root

COPY ./build /usr/share/nginx/html

# Copy custom NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# expose port 80 for HTTP

EXPOSE 80

# run Nginx to server React app

USER nginx

CMD ["nginx", "-g", "daemon off;"]