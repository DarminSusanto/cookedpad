FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG REACT_APP_API_AUTH=http://localhost:3001
ARG REACT_APP_API_USERS=http://localhost:3002
ARG REACT_APP_API_RECIPES=http://localhost:3003
ARG REACT_APP_API_COMMENTS=http://localhost:3004

ENV REACT_APP_API_AUTH=${REACT_APP_API_AUTH}
ENV REACT_APP_API_USERS=${REACT_APP_API_USERS}
ENV REACT_APP_API_RECIPES=${REACT_APP_API_RECIPES}
ENV REACT_APP_API_COMMENTS=${REACT_APP_API_COMMENTS}

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]