const WebSocketServer = require('uws').Server;
const wss = new WebSocketServer({ port: 8080 });
const {NodeVM} = require('vm2');
const Client = require("./src/client")
const Http = require("./src/http")

const vm = new NodeVM({
    console: 'inherit',
    sandbox: {},
    require: {
        external: true,
        root: "./src",
    }
});

const http = new Http();

//let functionWithCallbackInSandbox = vm.run("module.exports = function(who, callback) { callback('hello '+ who); }");
//functionWithCallbackInSandbox('world', (greeting) => {
//    console.log(greeting);
//});

function onMessage(message) {
    console.log('received: ' + message);
}

wss.on('connection', function(ws) {
    var c = new Client(ws, http);
    c.on("all", console.log);
});
