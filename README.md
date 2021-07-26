## Installation
First create a `.env` file, a sample `sample.env` is provided and it works with in Docker container *mentioned below*
`cp sample.env .env`
Likewise for running tests, a separate test.env file is needed (to provice test-only database and different port for express)
`cp test.env test.env`
Make sure to modify these .env files to point to mongodb server address.
Finally install npm packages.
`npm install`

## Running in Docker
`docker-compose up --build`
this will build two containers, one for nore and another for mongodb. The mongodb can be accessed from the node container by the server name **mongo** for example *mongodb://mongo:27017/docker-node-mongo*


## Running locally
`npm run dev`

## Running tests
`npm t` or `npm run test`

### Environment varibles
- MONGO_URI: for mongoose to connect to mongodb
- MAX_DEVICES: this was provided as strict requirement, but it could be more useful as configurable. That is the number each gateway can have of devices.
- PORT: the port which express will listen on.

## Postman runner
A collection of requests can be reused for testing endpoints https://www.getpostman.com/collections/dabdc4386ba10d7db05a