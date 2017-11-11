const express = require('express')
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();

class Http {
  constructor() {
    this._server = app.listen(3001, function () {
      console.log('I will serve http all day long on port 3001')
    })

    // BodyParser
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    this.router = express.Router()
    this.apiRouter = express.Router();
    app.use('/endpoints', this.router);
    app.use('/v1', this.apiRouter);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    if (app.get('env') === 'development') {
      app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send({
          message: err.message,
          error: err
        });
      });
    }
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.send({
        message: err.message,
        error: {}
      });
    });

    this._app = app;
  }

  get app() {
    return this._app;
  }

  get server() {
    return this._server
  }

  registerSession(session) {
    // Client session ids
    this.apiRouter.get('/session', (req, res, next) => {
      res.send(session.newSessionId());
    })
  }

  registerEndpoint(appid, cb, call) {
    var _this = this;
    crypto.randomBytes(28, function(err, buffer) {
        var url = "/test"
        //var url = "/"+appid+"/"+buffer.toString('hex');
        _this.router.post(url, (req, res, next) => {
          call(req, res);
          res.send("OK")
        });
        cb("http://localhost:3001/endpoints"+url);
    });
  }
}

module.exports = Http;
