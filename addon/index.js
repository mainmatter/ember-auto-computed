import Ember from 'ember';

let propStack = [];

class StackEntry {
  constructor(obj) {
    this.obj = obj;
    this.deps = [];
  }

  handleGet(obj, keyName) {
    if (obj === this.obj) {
      this.deps.push(keyName);
    }
  }
}

export default function(cb) {
  let computed = Ember.computed(function() {
    propStack.push(new StackEntry(this));
    let result = cb.call(this);
    let entry = propStack.pop();
    computed.property(...entry.deps);
    return result;
  });

  return computed;
}

let originalGet = Ember.get;

function newGet(obj, keyName) {
  let entry = propStack.slice(-1)[0];
  if (entry) {
    entry.handleGet(obj, keyName);
  }
  return originalGet(obj, keyName);
}

function newBoundGet(keyName) {
  return newGet(this, keyName);
}

Ember.get = newGet;
Ember.Object.prototype.get = newBoundGet;
