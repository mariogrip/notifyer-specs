const uuid = require("uuid");
const Client = require("./client")

// Responsble for handeling WebSocket sessions

function parseData(data) {
  try {
    message = JSON.parse(data)
    return message;
  } catch (e) {
    return false;
    console.log("not a valid json object")
  }
}

function isShakehandValid(_this, message) {
  console.log(typeof message.data.session === "string")
  console.log(message.cmd === "shakehand")
  if (message.cmd === "shakehand" && typeof message.data.session === "string"){
    if (message.data.session.length === 36) {
      console.log("valid uuid", message.data.session);
      console.log(_this.sessions);
      if (_this.sessions[message.data.session]) {
        console.log("found id in session storrage");
        if (_this.sessions[message.data.session].alive){
          console.log("session valid");
          return true;
        }
      }
    }
  }
  console.log("session not valid")
  return false;
}

class Sessions {
  constructor() {
    this.sessions = {};
  }

  // Every new client need to request a session id
  newSessionId() {
    var id = uuid.v4();
    this.sessions[id] = { id: id, alive: true };
    return id;
  }

  // Bind Session to a socket
  bindSessionToSocket(ws, http) {

    // listen for shakehand ONCE!
    ws.once("message", (m) => {
      m = parseData(m);
      if (isShakehandValid(this, m)) {
        console.log(m.data);
        var ourSession = m.data.session;

        // Remove all listeners before handling it over to a client class
        ws.removeAllListeners("message");

        // Check for an existing session
        if (this.sessions[ourSession].client){
          // We have an session
          this.sessions[ourSession].client.websocket = ws;
        } else {
          // We need a new client
          this.sessions[ourSession].client = new Client(ws, http);
        }
      }else {
        // The handshake is not valid Close connection!
        ws.removeAllListeners("message");
        ws.close(1003, "handshake not valid");
        console.log("handshake not valid");
      }
    })
  }
}

module.exports = Sessions;
