FROM python:3.8.1

RUN apt-get update && apt-get install -y net-tools postgresql-client curl sudo
RUN curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
RUN apt-get install -y nodejs


RUN mkdir -p /home/app/
COPY . /home/app/

RUN npm install -g concurrently

WORKDIR /home/app/frontend/
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object
RUN npm install .

WORKDIR /home/app/backend/
RUN pip3 install -r requirements.txt


