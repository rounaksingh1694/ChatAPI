FROM node
WORKDIR /app
COPY package.json .
RUN npm install

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
        then npm install; \
        else npm install --only=production; \
        fi
RUN chown -R node /app/node_modules

COPY . ./
ENV PORT 5000
EXPOSE $PORT
CMD ["npm", "run", "dev"]