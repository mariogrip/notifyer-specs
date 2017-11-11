const WebSocketServer = require('uws').Server;
const {NodeVM} = require('vm2');
const Http = require("./src/http")
const Sessions = require("./src/sessions");

const vm = new NodeVM({
    console: 'inherit',
    sandbox: {},
    require: {
        external: true,
        root: "./src",
    }
});

const http = new Http();
const sessions = new Sessions();
http.registerSession(sessions);

const server = http.server;
const wss = new WebSocketServer({ server });

//let functionWithCallbackInSandbox = vm.run("module.exports = function(who, callback) { callback('hello '+ who); }");
//functionWithCallbackInSandbox('world', (greeting) => {
//    console.log(greeting);
//});

wss.on('connection', function(ws) {
  sessions.bindSessionToSocket(ws, http);
});
