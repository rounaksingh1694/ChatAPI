FROM node
WORKDIR /app
COPY package.json .
RUN npm install

ARG NODE_ENV
RUN npm install

COPY . ./
ENV PORT 5000
EXPOSE $PORT
CMD ["npm", "start"]