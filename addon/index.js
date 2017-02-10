import Ember from 'ember';

let propStack = [];

class StackEntry {
  constructor(obj, keyName) {
    this.obj = obj;
    this.keyName = keyName;
  }

  toString() {
    return `${this.obj}.${this.keyName}`;
  }
}

let trackThis;
let trackedDeps = [];

export default function(cb) {
  return Ember.computed(function() {
    let cpName = propStack.slice(-1)[0].keyName;
    console.log('CP:', cpName);
    trackThis = this;
    let result = cb.call(this);
    console.log(trackedDeps);
    trackThis = undefined;
    trackedDeps = [];
    return result;
  });
}

let originalGet = Ember.get;

function newGet(obj, keyName) {
  propStack.push(new StackEntry(obj, keyName));
  if (obj === trackThis) {
    trackedDeps.push(keyName);
  }
  let value = originalGet(obj, keyName);
  propStack.pop();
  return value;
}

function newBoundGet(keyName) {
  return newGet(this, keyName);
}

Ember.get = newGet;
Ember.Object.prototype.get = newBoundGet;
