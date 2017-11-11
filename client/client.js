const uuid = require("uuid");

function onMessage(_this, message) {
  console.log(message);
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
        callback.callback(message.data, message.id);
    });
  }
}

// When c++ developers fall in love with js class
class Client {
  constructor(ws) {
    this.ws = ws;
    this.ws.on("message", (a) => onMessage(this, a));
    this.ws.on("close", ()=>console.log("crap"))
    this.callbacks = [];
    this.shakeHand();

    this.on("all", (m, id) => {
      if (id)
        this.send("received", {id: id});
    })
  }

  shakeHand() {
    this.send("shakehand", { session: "ac2b7fee-f8bb-4238-910c-8e43784e0b7f"})
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
  //this.messageQueue[id] = {cmd: cmd, data: data, id: id};
  }
}

module.exports = Client;
