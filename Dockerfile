FROM node:latest AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

### STAGE 2: Setup ###
FROM nginx
## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
## From build stage copy over the artifacts in dist folder to default nginx public folder
#COPY --from=build /app/dist/integrax-frontend-gcl/browser /usr/share/nginx/html
COPY --from=build /app/dist/integrax-frontend-gcl/browser/ /var/www/html/
COPY /nginx.conf  /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]


#FROM nginx:stable
#RUN rm /etc/nginx/conf.d/default.conf
#COPY --from=build /app/dist/integrax-frontend-gcl /usr/share/nginx/html
#COPY --from=build /nginx.conf /etc/nginx/conf.d/default.conf
