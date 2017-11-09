'use strict'

const helpers = require("./helpers");
const filters = require("./filters");

const returnObjects = [
  {name: "title"},
  {name: "body", required: true},
  {name: "timestamp"},
  {name: "icon"},
  {name: "applicationData"},
]


function objectSort(obj, options) {
  console.log("objectSort", obj, options)
  if (options.filters) {
    console.log("objectSort", "running filters");
    if (!runFilters(obj, filters))
      return false;
  }

  var returnBuilder = {};

  for (var n in returnObjects) {
    var object = returnObjects[n];
    if (!options[object.name]){
      console.log("objectSort not here", object.name)
      if (object.required){
        // Return false on required element not found
        return false;
      }
      continue;
    }

    var body = helpers.objectStepKeyString(obj, options[object.name]);
    if (!body)
      return false;
    if (typeof body !== "string")
      return false;
    returnBuilder[object.name] = body
  }

  console.log(returnBuilder);
  return returnBuilder;
}

function runFormaters(obj, formaters) {
  for (var n in formaters) {
    var format = formaters[n]
    var k = format.func(obj, format.options);
    if (k)
      return k;
  }
  return false;
}


module.exports = {
  objectSort: objectSort,
  runFormaters: runFormaters
};
