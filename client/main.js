/*
This code will be written in c++ for better performance and battery consumtion

This is written in js to easier develop the spec

THIS IS JUST A TEST
*/

const WebSocket = require('ws');
const Client = require("./client");
const notifications = require('freedesktop-notifications');
var exec = require('child_process').exec;

const ws = new WebSocket('ws://192.168.88.243:8080');

function notify(obj) {
  exec("notify-send '"+obj.title+"' '"+obj.body+"'" , function() {
  });

  //  notifications.createNotification({
  //    summary: obj.title,
  //    body: obj.body
  //  }).push();
}

const httpEndpointInstructions = {
  fetch: {
    method: "httpEndpoint"
  },
  filter: [
    {
      action: "accept",
      method: "exists",
      exists: {
        object: "test.type"
      },
      equals: {
        object: "test.type",
        equals: "b"
      },
      is: {
        object: "test.type",
        type: "array"
      }
    }
  ],
  format: [ {
    method: "objectSort",
    objectSort: {
      body: "test.test",
      title: "test.title"
    }
  }
  ],
  appid: "test"
}

ws.on('open', function open() {
  var client = new Client(ws);
  client.send("ping", "blash")
  client.on("all", console.log);
  client.send("register", httpEndpointInstructions);
  client.on("notify", notify)
});
