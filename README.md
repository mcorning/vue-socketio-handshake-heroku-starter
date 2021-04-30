<img src="icon.svg" align="right" width="200" height="145" />

# vue-socketio-handshake-heroku-starter

`vue-socketio-handshake-heroku-starter` is a vue-socket.io boilerplate to set up a new vue application using a node backend and websockets. It consists of a vue client and a node server and is using [vue-socket.io-extended](https://github.com/probil/vue-socket.io-extended) to bind socket.io to the vue instance. The project is set up to be deployed to Heroku.

:sparkles: Example app demo:
[vue-socketio-heroku-starter.herokuapp.com](https://vue-socketio-handshake-heroku-starter.herokuapp.com/)

## Usage

The application is a simple example app, using a node-socket.io server to add a specified client to  all connected clients. The node server is located in `index.js`.

### Run

First Build the vue source code:
Choose the `build` option in the NPM Scripts Explorer or in a terminal enter:

`npm run build`

Start the server with the `start` option in the NPM Scripts Explorer or in a terminal enter:

`node index`

Either ctrl-click the link rendered in the termal:

<http://localhost:3003>

or open a browser of your choice using that URL.

### Debug

Be sure you have the latest bits in the /dist folder.

Select the VS Code Debug Explorer, and choose the `Launch index.js` option from the toolbar dropdown. Server is running on port *3003*

Next, select the `3003 vuejs: chrome` option from the same dropdown. Chrome will open on port 3003.

Set breakpoints, as necessary, in one or both debuggers.

## Deploy to Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/mcorning/vue-socketio-handshake-heroku-starter.git)

or manually create a new Heroku application and add the `heroku/nodejs` and `https://github.com/heroku/heroku-buildpack-static` buildpacks. 

Note that the node server runs from the path specified in the [Procfile](https://heroku-vue-socket-test.herokuapp.com/).
