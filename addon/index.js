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

export default function(cb) {
  return Ember.computed(function() {
    let cpName = propStack.slice(-1)[0].keyName;
    console.log('CP:', cpName);
    return cb.call(this);
  });
}

let originalGet = Ember.get;

function newGet(obj, keyName) {
  propStack.push(new StackEntry(obj, keyName));
  let value = originalGet(obj, keyName);
  propStack.pop();
  return value;
}

function newBoundGet(keyName) {
  return newGet(this, keyName);
}

Ember.get = newGet;
Ember.Object.prototype.get = newBoundGet;
