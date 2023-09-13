FROM node:16

# Create app directory
#RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /app

COPY package*.json ./
COPY 87ca6778-6d9d-11e9-b6bc-be2dba81101c ./
#USER node
RUN npm install 
RUN npm install oas3-tools
RUN npm install cors 
RUN npm install mongodb@5.7.0
RUN npm install @contrast/agent --no-optional
# RUN npm install @sendgrid/mail


# Bundle app source
COPY . .
USER node
EXPOSE 8080
CMD ["node", "-r", "@contrast/agent", "index.js"]
