FROM python:3.8.1@sha256:7be36bd79ab0d754c2a6db5351b7bf91ebe7161cd0d80a15e47ab2c211a0828b

RUN apt-get update && apt-get install -y net-tools postgresql-client curl sudo libgl1
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


