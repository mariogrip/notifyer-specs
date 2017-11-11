const JsonApp = require("./json/jsonApp");
const uuid = require("uuid");

const DEFAULT_MAX_QUEUE = 15;

function onMessage(_this, message) {
  try {
    message = JSON.parse(message)
  } catch (e) {
    return console.log("not a valid json object")
  }
  if (!_this.shaken) {
    if (message.cmd != "shakehand")
      return console.log("not shaken"); // Ignore any messages before hand has shaken
    _this.shaken = true
  } else {
    if (_this.callbacks.length == 0)
      return console.log("no cb")
    _this.callbacks.forEach((callback) => {
      if (callback.trigger === message.cmd || callback.trigger === "all")
        callback.callback(message.data, message.id)
    });
  }
}

// When c++ developers fall in love with js class
class Client {
  constructor(ws, http) {
    this.ws = ws;
    this.http = http;
    this.ws.on("message", (a) => onMessage(this, a));
    this.ws.on("close", ()=>console.log("crap"))
    this.callbacks = [];
    this.apps = {};
    this.messageQueue = [];
    this.maxQueueLenght = DEFAULT_MAX_QUEUE;
    this.shakeHand();
    this.cmdHandler();
  }

  shakeHand() {
    this.send("shakehand", "");
    this.shaken = true;
  }

  // We have got a new socket, switch to that one!
  set websocket(ws) {
    // At this point our old one is assumed broken, we cannot allow two
    this.ws.removeAllListeners("message");
    this.ws.removeAllListeners("close");
    this.ws.terminate();

    // Set our new one
    this.ws = ws;
    this.ws.on("message", (a) => onMessage(this, a));
    this.ws.on("close", ()=>console.log("crap"))
    this.shakeHand();
    this.cmdHandler();
    console.log("Got new ws");
    this.sendQueue();
  }


  on(trigger, callback) {
    this.callbacks.push({
      trigger: trigger,
      callback: callback
    });
  }

  send(cmd, data) {
    // Try to send to client, and also add to queue
    var id = uuid.v4();
    this.ws.send(JSON.stringify({cmd: cmd, data: data, id: id}));
    this.addToQueue({cmd: cmd, data: data, id: id});
  }

  addToQueue(d) {
    if (this.messageQueue.length >= this.maxQueueLenght) {
      console.log("queue too long, removing old", this.messageQueue.length);
      this.messageQueue.shift();
    }
    this.messageQueue.push(d);
  }

  sendQueue() {
    console.log("sendQueue");
    this.messageQueue.forEach((m) => {
      var mes = this.messageQueue.shift();
      this.send(mes.cmd, mes.data);
    });
  }

  registerHttpEndpoint(appid, cb, call) {
    this.http.registerEndpoint(appid, cb, call);
  }

  registerApp(data) {
    if (typeof data.appid !== "string")
      return console.log("not valid app ID! ignore FIXME");

    // Check if we have an this appid running
    if (this.apps[data.appid]) {
      // We do FIXME check for app update
      return;
    }
    var _this = this;
    this.apps[data.appid] = new JsonApp({
          json: data,
          client: _this,
          appid: data.appid
        });
  }

  onMessageRecivedConf(data, id) {
    console.log("received conf, removing for queue");
    for (var i in this.messageQueue) {
      var m = this.messageQueue[i];
      if (m.id === data.id) {
        this.messageQueue.splice(i, 1);
      }
    }
  }


  cmdHandler() {
    var _this = this;
    this.on("ping", (data) => _this.send("pong", data));
    this.on("register", (data) => {
      _this.registerApp(data);
    });
    this.on("received", (data, id) => {
      _this.onMessageRecivedConf(data, id);
    });
  }
}

module.exports = Client;
