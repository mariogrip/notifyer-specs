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
        callback.callback(message.data)
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
    this.shakeHand()
  }

  shakeHand() {
    this.send("shakehand", "")
  }

  on(trigger, callback) {
    this.callbacks.push({
      trigger: trigger,
      callback: callback
    });
  }

  send(cmd, data) {
    this.ws.send(JSON.stringify({cmd: cmd, data: data}))
  }
}

module.exports = Client;
