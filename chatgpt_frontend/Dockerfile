FROM node:19-alpine3.16 as build-deps
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM nginx:1.23.3-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-deps /usr/src/app/build /usr/share/nginx/html
COPY nginx/default_nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
