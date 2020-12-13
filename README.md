Angular IRC
=========================================

This repository contains server & client side code using `TypeScript` language

## What is Angular IRC?
Angular IRC is a web application that enables clients to communicate with each other.  It is a simple implementation of the Internet Chat Relay (IRC) protocol, and it is built on top of the WebSocket protocol (RFC 6455).  

## Frontend
The frontend interface was developed with Angular 10, Angular Material and Bootstrap 4.

## Backend
This app uses Node/Express to implement a relay server that facilitates real-time messaging between clients.

# Installation
## Prerequisites

Make sure you have the following installed first:

1. [Angular CLI](https://cli.angular.io/)
2. [NodeJS](https://nodejs.org)

## Run Server

To run server locally, just install dependencies and run `gulp` task to create a build:

```bash
$ cd server
$ npm install -g gulp-cli
$ npm install
$ gulp build
$ npm start
```

## Run Client

To run client locally, run the following commands:

```bash
$ cd client
$ npm install
$ ng serve
```

Now open your browser in following URL: [http://localhost:4200](http://localhost:4200/)

## License

MIT
