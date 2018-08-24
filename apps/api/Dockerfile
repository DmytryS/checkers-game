#Base image with formula-converter-api source only
FROM node:8-alpine AS base
WORKDIR /usr/src/app
COPY src src
COPY config config
COPY package.json package.json

#Image for building and installing dependencies
FROM base AS dependencies
RUN apk add --no-cache make gcc g++ python
RUN npm install --production --quiet

#Relase image for running api
FROM base AS release
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
RUN rm -f package-lock.json
CMD ["npm", "start"]