FROM node:slim

RUN mkdir -p /home/app

WORKDIR /home/app

COPY . /home/app

RUN npm install 

EXPOSE 4004

CMD ["npm", "start"]