'use strict'

const helpers = require("./helpers");
const filterActions = ["ignore", "accept"];

function toFilterArray(rawFilter) {
  if (!Array.isArray(rawFilter))
    return helpers.error("json", "filter is not an array");

  var returnBuilder = [];

  for (var n_filter in rawFilter) {
    var filter = rawFilter[n_filter];
    if (typeof filter.method != "string")
      return helpers.error("json", "filter["+n_filter+"].method is not an string");
    // Default action
    if (!filter.action)
      filter.action = "accept";
    if (!filterActions.includes(filter.action))
      return helpers.error("json", "Unknown filter action " + filter.action);
    switch (filter.method) {
      case "func":
        return helpers.error("json", "func method not implied yet");
        break;
      case "equals":
        returnBuilder.push({
          func: equals,
          options: filter.equals
        });
        break;
      case "is":
        returnBuilder.push({
          func: is,
          options: filter.is
        });
        break;
      case "exists":
        returnBuilder.push({
          func: exists,
          options: filter.exists
        });
        break;
      default:
        return helpers.error("json", "Unknown filter method " + filter.method);
        break;
    }
    }

  return {
    filters: returnBuilder
  };
}

function equals(obj, options) {
  console.log("equals", obj, options)
  if (typeof options.equals === "string")
    options.equals = [options.equals];
  if (!Array.isArray(options.equals))
    return false
  var objStepped = helpers.objectStepKeyString(obj, options.object);
  console.log(objStepped, "a");
  if (!objStepped)
    return false;
  console.log(options.equals, "c");
  console.log(options.equals.includes(objStepped));
  return options.equals.includes(objStepped);
}

function exists(obj, options) {
  var objStepped = helpers.objectStepKeyString(obj, options.object);
  return !!objStepped
}

function is(obj, options) {
  var objStepped = helpers.objectStepKeyString(obj, options.object);

  console.log("is objStepped", objStepped);
  if (!objStepped)
    return false;
  switch (options.type) {
    case "array":
      console.log("is array", Array.isArray(objStepped));
      return Array.isArray(objStepped)
      break;
    case "string":
      console.log("is string", typeof objStepped === "string")
      return typeof objStepped === "string";
      break;
    case "number":
      console.log("is number", typeof objStepped === "number")
      return typeof objStepped === "number";
      break;
    case "object":
    console.log("is object", typeof objStepped === "object")
      return typeof objStepped === "object";
      break;
    case "boolean":
      console.log("is boolean", typeof objStepped === "boolean")
      return typeof objStepped === "boolean";
      break;
    default:
      console.log("default");
      return false;
      break;
  }
}

function action(action) {
  // default action is accept
  if (!action || typeof action !== "string")
    return true

  switch (action) {
    case "ignore":
      return false;
      break;
    case "accept":
      return true;
      break;
  }

  // We should not reach this, if we do so, ignore
  return false;
}

function runFilters(obj, filters) {
  // No filters, lets accept all
  if (filters.length == 0)
    return true;

  // Default action will be the first action we get!
  var defaultAction;
  for (var n in filters) {
    var filter = filters[n];
    if (!defaultAction && filter.options.action)
      defaultAction = filter.options.action;
    if (filter.func(obj, filter.options)){
      console.log("filter true");
      return action(filter.options.action);
    }

  }
  console.log("filter false");
  return action(defaultAction);
}

module.exports = {
  is: is,
  exists: exists,
  equals: equals,
  toFilterArray: toFilterArray,
  runFilters: runFilters
};
