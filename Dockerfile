FROM python:3.8.20

RUN apt-get update && apt-get install -y net-tools postgresql-client curl sudo libgl1
RUN apt-get install -y gnupg \
    dirmngr \
    build-essential
RUN curl -sL https://deb.nodesource.com/setup_16.x | sudo bash -
RUN apt-get update && apt-get install -y nodejs


RUN mkdir -p /home/app/
COPY . /home/app/

WORKDIR /home/app/frontend/
RUN npm install .

WORKDIR /home/app/backend/
RUN pip3 install -r requirements.txt


