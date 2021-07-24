FROM node:15
WORKDIR /code
COPY package*.json ./
RUN npm install -g npm && npm install
CMD ["npm", "run", "dev"]