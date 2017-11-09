const request = require('request');

// Super class for apps
class App {
  constructor(options) {
    if (!options) return false;
    if (!options.client) return false;
    this.options = options;
    this.send("registered", this.options.appname);
    console.log("registerd", this.options.appname)
  }

  send(cmd, obj) {
    this.options.client.send(cmd, obj)
  }

  error(type, error) {
    this.options.client.send("error", {type: type, error: error})
  }

  loop(time, call) {

  }

  http(obj, call) {
    // TODO add safety check
    request(obj, call);
  }

  httpEndpoint(call) {
    console.log("register endp")
    this.options.client.registerHttpEndpoint(this.options.appname, (url) => this.send("httpEndpoint", url), call);
  }

}

module.exports = App;
