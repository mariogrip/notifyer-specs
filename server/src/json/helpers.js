'use strict'

/*
  Truns string into object keys

  example:
    object1.array returns ["object1", "array"]
    object1.dude returns ["object1", "dude"]
    object1.["b.sds"] returns ["b.sds", "s"]
*/
function stringToObjectKeys(str) {
  var dot;
  var braket;

  if (str.includes("."))
    dot = true;

  if (str.includes("[") && str.includes("]"))
    braket = true;

  console.log("str", str, "dot", dot, "braket", braket)

  if (!dot && !braket)
    return [str]

  if (dot)
    return str.split(".")

  return false;

  //TODO add braket
  //if (!dot && braket)
  //  return false;
  //if (dot && braket)
  //  return false;
}

function objectStepKeyArray(obj, keyArray) {
  console.log(keyArray)
  if (!obj || !keyArray)
    return false;
  if (!Array.isArray(keyArray))
    return false;
  for (var n in keyArray) {
    var key = keyArray[n];
    obj = obj[key];
    if (!obj)
      return false;
  }
  console.log(obj);
  return obj;
}

function objectStepKeyString(obj, str) {
  var k = stringToObjectKeys(str)
  console.log("k", k);
  return objectStepKeyArray(obj, k);
}

function error(type, err) {
  return {
    error: {
      type: type,
      error: err,
    }
  }
}

module.exports = {
  objectStepKeyArray: objectStepKeyArray,
  stringToObjectKeys: stringToObjectKeys,
  objectStepKeyString: objectStepKeyString,
  error: error
};
