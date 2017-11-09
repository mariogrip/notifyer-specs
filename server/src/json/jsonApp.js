const App = require("../app");
const filters = require("./filters");
const formaters = require("./formaters");

const topItems = ["fetch", "filters", "format", "store"];

class JsonApp extends App {
  constructor(options) {
    super(options)
    this.filters = [];
    this.formaters = [];
    this.filterJson()
    this.setupFetch()
    this.setupFilters()
    this.setupFormat()
  }

  filterJson() {
    this.json = this.options.json;
    console.log(this.json.test, "func");
  }

  setupFetch() {
    if (typeof this.json.fetch !== "object")
      return super.error("json", "fetch is not an object");
    if (typeof this.json.fetch.method != "string")
      return super.error("json", "fetch.method is not an string");
    switch (this.json.fetch.method) {
      case "httpEndpoint":
        this.httpEndpoint();
        break;
      case "httpPull":
        this.httpPull();
        break;
      case "httpSocket":
        this.httpSocket();
        break;
      default:
        super.error("json", "Unknown fetch method " + this.json.fetch.method);
        break;
      }
  }

  setupFilters() {
    var _filters = filters.toFilterArray(this.json.filter);
    if (_filters.error){
      super.error(_filters.error.type, _filters.error.error);
      return;
    }
    this.filters = _filters.filters;
    console.log(this.filters);
  }

  setupFormat() {
    if (!Array.isArray(this.json.format))
      return super.error("json", "format is not an array");
    for (var n in this.json.format) {
      var format = this.json.format[n];
      if (typeof format.method != "string")
        return super.error("json", "format.method is not an string");
      switch (format.method) {
        case "func":
          super.error("json", "func method not implied yet");
          break;
        case "objectSort":
          if (!format.objectSort)
            return super.error("json", "format.objectSort does not exist");

          if (format.filters){
            var _filters = filters.toFilterArray(format.objectSort.filter);
            if (_filters.error){
              super.error(_filters.error.type, _filters.error.error);
              return;
            }
            format.objectSort.filters = _filters.filters;
          }
          this.formaters.push({
            func: formaters.objectSort,
            options: format.objectSort
          });
          break;
        default:
          super.error("json", "Unknown filter method " + filter.method);
          break;
      }
    }
    console.log(this.formaters);
  }

  filter(obj) {
    if (!filters.runFilters(obj, this.filters))
      return false;
    return true;
  }

  format(obj) {
    return formaters.runFormaters(obj, this.formaters)
  }

  onData(obj) {
    console.log("filter", obj)
    if (!this.filter(obj)){
      console.log("ignore due to filter");
      return;
    }
    console.log("format")
    var ret = this.format(obj);
    if (!ret) {
      console.log("ignore due to wrong format");
      return;
    }
    super.send("notify", ret)
    return;
  }

  httpPull() {
    super.error("json", "httpPull method not implied yet");
  }

  httpSocket() {
    super.error("json", "httpSocket method not implied yet");
  }

  httpEndpoint() {
    var _this = this;
    super.httpEndpoint((r, a) => {
      _this.onData(r.body);
    })
  }

}

module.exports = JsonApp;
