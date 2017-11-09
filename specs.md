# mariogrip's proposals

## Ubuntu touch notification proposal

TESTCODE found in: ./client and ./server
Even though client is written in javascript here, it will be written in c++
Same goes for server, but most of the code will stay javascript here,
exceptions of some instructions

Using uWS for ultra light websocket, resulting on a instant and battery
efficient notification service

Default: one way server to client
Client <- Server

Special exceptions: both ways, server to client, client to server
Client <-> Server

For safety reasons we wont allow the client to send data back to server without
special approval.

However client will be allowed to send data on user action, example from sending
response directly from notification. ONLY inputed and associated data with action
is allowed to send to server, extra variables must exist on server


Terminology

  - Client = Ubuntu touch device
  - Server = Can be UBports servers, self owned server or local server

#### Usecases:

All apps using UBports server
```
                   |-- App 3
Client <- server <-|-- App 2
                   |-- App 1
```


Split between local and UBports server
```
                   |-- App 3
Client <- server <-|-- App 2
        |-- App 1
```

All apps localy
```
        |-- App 3
Client <|-- App 2
        |-- App 1
```

All apps using self owned server
```
                              |-- App 3
Client <- self owned server <-|-- App 2
                              |-- App 1
```
Split between local, self owned server, and UBports server
```
Client <- self owned server <- Main server <-- App 3
        |-- App 2            |-- App 1
```

Split between self owned server, and UBports server
```
Client <- self owned server <- Main server <--- App 2
                             |-- App 1      |-- App 3
```

#### Code

One code, all Usecases, exception for this will be spawning of http endpoints since
this requires domain and/or portfowarding to be able to use. This option will not
be able to run on client, and not all selfowned servers. Fallback is required in
this case

This code will be written in javascript, the reason for this is

  - Can run client and server
  - Can run in safe environment
  - Can use c++ compiled code
  - Well known language
  - QML uses javascript, that makes it easy for app developers to write


Why not to use:
  - C++/c or any compiled language, hard to control and run in controlled
    environment. Hard to program in
  - Python, This will be a language thats not at all used on Standard app development
    it makes more sense to use javascript since that's alredy used with qml.
    believe it or not, node gives alot better performance both per requests and
    battery usage then python does


To make it as simple and flexible for both user and developers, there will be
two types of servers

  - Simple json with Instructions
  - Full javascript code

In most cases "JSON with instructions" is the preferred method

most of JSON instructions backend code will be written in c++


#### Simple JSON

The only code needed for this is done on the client itself
This is using javascript with a made up function called dbus(interface, function, data)
that simulates a dbus call

###### Example using JSON with http endpoint and http pull fallback instruction (using uMatriks)

lets say api endpoint is https://matrix.org/api/data/
and it needs userid and token in body

it returns obj, example

[{
  fromUser: "ben",
  message: "Hello mario",
  timestamp: "1.2.4"
}]

```
const httpEndpointInstructions = {
  fetch: {
    method: "httpEndpoint"
  },
  format: {
    method: "func"
    func: function(obj) {
      return {
        title: obj.userId,
        body: obj.message,
        timestamp: obj.timestamp
      }
    }
  }
}

const httpPullInstructions = {
  fetch: {
    method: "httpPull",
    httpPull: {
      method: "get",
      url: "https://matrix.org/api/data/",
      params: {
        body: {
          userId: "mario",
          token: "34324klj34klj4kljfn4klr3ko-token"
        }
      },
      requestInterval: 5
    }
  },
  check: [
    {
      action: "ignore",
      method: "perArrayEqual"
    },
    {
      action: "ignore",
      method: "func",
      func: function(obj) {

      }
    }
  ],
  format: {
    method: "func"
    func: function(obj) {
      return {
        title: obj.userId,
        body: obj.message,
        timestamp: obj.timestamp
      }
    }
  },
  store: true
}

var instructions = {
  default: httpEndpointInstructions,
  fallback: httpPullInstructions
}

const endpoint = dbus("com.ubports.services.notifacations", "register", instructions)
```

So if it uses default method, It will return a http url, so lets say
endpoint.httpEndpoint = "https://api.ubports.com/notifacations/endpoint/3234tk324"
This url now points directly to this device
So with this the app can register this url to what it want

###### Example JSON using only httpPull instructions (using uMatriks)

lets say api endpoint is https://matrix.org/api/data/
and it needs userid and token in body

it returns obj, example

[{
  fromUser: "ben",
  message: "Hello mario",
  timestamp: "1.2.4"
}]

```
const instructions = {
  fetch: {
    method: "httpPull",
    httpPull: {
      method: "get",
      url: "https://matrix.org/api/data/",
      params: {
        body: {
          userId: "mario",
          token: "34324klj34klj4kljfn4klr3ko-token"
        }
      },
      requestInterval: 5
    }
  },
  checks: [
    {
      action: "accept",
      method: "equals",
      equals: {
        object: "matrix.type",
        equals:  ["CallInvite", "CallAnswer"]
      }
    },
    {
      action: "ignore",
      method: "perArrayEqual"
    },
    {
      action: "ignore",
      method: "func",
      func: function(obj) {

      }
    }
  ],
  format: {
    method: "func"
    func: function(obj) {
      return {
        title: obj.userId,
        body: obj.message,
        timestamp: obj.timestamp
      }
    }
  },
  store: true
}

const notify = dbus("com.ubports.services.notifacations", "register", instructions)
```

JSON api:

  - Fetch: responsible for getting/fetching data
    - httpPull: pull data every x minutes
      - payload
      - auth
      - requestInterval: (1-10000) n seconds to pull (this will be )
      - tag
    - httpEndpoint: spawn a http endpoint that accepts data
      - type: (get, post, put, delete)
      - tag
    - httpSocket: connects to a websocket (ws, sock.io, sockjs, etc..)
      - tag
  - filter: responsible for filtering ALL data (no filter = accept all)
    - action: What to do with data (default accept)
      - ignore: accept everything except
      - accept: ignore everything except
    - Method: How to check the data
      - func: run a javascript function to filter
        - object in - bool out
        - Example:
        ```
          {
            func: function(object) {
              return object.type == "call";
            }
          }
        ```
      - equals: check if object equals (returns false of not exists)
        - object
        - equals
      - is: check if object is * (returns false of not exists)
        - object:
        - type:
          - array: check if object is array
          - string: check if object is string
          - number: check if object is number
          - boolean: check if object is boolean
          - object: check if object is object
      - exists: check if object exists
        - object
      - hasGotBefore: check if got object before (request store)
      - tag:
  - format: responsible for formating data before sending to user
    - methods
      - func: use function to format the data
        - object in - object out
        - Example:
        ```
          {
            func: function(object) {
              return {
                title: object.text.substring(0,10),
                body: object.text,
                timestamp: object.date,
                icon: "http://url.com/icon.png",
                applicationData: {
                  a: "a",
                  b: ""
                }
              }
            }
          }
        ```
      - objectSort: array
       - filters: filters (Optional)
       - title: title for notifacation (optinal, will body if not provided)
       - body: body for notifacation
       - timestamp: timestamp for notifacation (optinal, will use current time)
       - icon: icon http url for notifacation (optinal)
       - applicationData: extra data to deliver to application on clicked (optinal)
    - filter

  - store: store data (needed for some checks)
**TBD**

#### Full javascript code

Example using uMatriks:

Server:

```
class uMatriks extends App {
  constructor(app, options) {
    super(app, options)
    this.user = options.user
    this.token = options.token
  }

  start() {
    super()

    if (this.super.isServer()){
      this.runner = new super.httpEndpoint((data) => {
          *process data*
          if (data.valid)
            return data
          else
            return false
        })
      this.runner.onRegistered(() => {
          *register http endpoint to matrix*
        })
    } else {
      this.runner = new super.loop(() => {
          *Getting data*
          if (data)
            return data
          else
            return false
      })
    }
  }

  stop() {
    super()
    *Do kill code*
    this.runner.kill()
  }

  * Example if client want to send message from notifications*
  onClientRequest(data) {
    *post data to matrix server*
    const httpRequest = super.http({
        method: "get"
        url: "http://server.com/api/message",
        body: data
    })
    return httpRequest.code === 200
  }

  get manifest() {
    return {
        "name": "umatriks.larreamikel",
        "description": "uMatriks is a Matrix protocol client for Ubuntu Touch.",
        "title": "uMatriks",
        "version": "0.6",
        "maintainer": "Mikel Larrea <developer@larreamikel.com>",
        "framework": "ubuntu-sdk-15.04.6"
    }
  }
}

ubports.register(uMatriks)
```

Client:

Dbus call
```
com.ubports.services.notifacations registerFull("umatriks.larreamikel", "0.6")
```

Full javascript code (using dekko):

```
class Dekko extends App {
  start() {
    super()
    this.loop = new super.loop((options) => {
        // options = this.options that will be send from client,
        // This can example include login data, etc...
        *Getting data*
        if (data)
          // returns data back to client
          return data
        else
          // no data, nothing send to client
          return false
    })
  }

  *Stop is handled by super class*

  get manifest() {
    return {
        "name": "dekko.dekkoproject",
        "description": "Dekko email client for ubuntu touch",
        "title": "Dekko",
        "version": "2.0",
        "maintainer": "Dekko project <dekko@dekko.com>",
        "framework": "ubuntu-sdk-15.04.6"
    }
  }
}

ubports.register(Dekko);
```

Client:

Dbus call
```
com.ubports.services.notifacations registerFull("dekko.dekkoproject", "2.0")
```

full javascript API:

obj loop(func): runs evey x to check for new data, if true returns data to client
bool send(obj): sends data to client
obj httpEndpoint(): Registers a http endpoint for this app
obj http(): send http request
**TBD**


#### protocol

json objects in the ws

```
{
  cmd: "cmd",
  data: obj
}
```



Programming:

One client class has many app classes

```
fetch: {
  method: "httpPull",
  httpPull: {
    method: "get",
    url: "https://matrix.org/api/data/",
    params: {
      body: {
        userId: "mario",
        token: "34324klj34klj4kljfn4klr3ko-token"
      }
    },
    requestInterval: 5
  }
},
check: [
  {
    action: "ignore",
    method: "perArrayEqual"
  },
  {
    action: "ignore",
    method: "func",
    func: function(obj) {

    }
  }
],
format: {
  method: "func"
  func: function(obj) {
    return {
      title: obj.userId,
      body: obj.message,
      timestamp: obj.timestamp
    }
  }
},
store: true
}
```

## Ubuntu touch Background services proposal

A application can ask to allow to run in the Background

example for this is Spotify that needs to run in the background to be able to provide
music while application is not focused

dbus request `bool com.ubports.services requestBackground(time)`

- Will ask user for permission to do so
- Will appear in settings, where user can configure time and battery usage before kill
- There will be an "watcher" that watches over battery and cpu usage while in "Background" mode

**TBD**
