FROM node:22.12.0

WORKDIR /app

COPY package.json package-lock.json nest-cli.json ./

RUN npm i

COPY ./ ./

RUN npm run build

CMD ["npm", "start"]