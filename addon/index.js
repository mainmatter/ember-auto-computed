import Ember from 'ember';

let propStack = [];

class StackEntry {
  constructor(obj) {
    this.obj = obj;
    this.deps = new Map();
  }

  handleGet(obj, keyName, value) {
    if (obj === this.obj) {
      return this.deps.set(value, keyName);
    }

    let objKey = this.deps.get(obj);
    if (objKey !== undefined) {
      let fullKey = [objKey, keyName].join('.');
      this.deps.set(value, fullKey);
    }
  }

  get dependentKeys() {
    return Array.from(this.deps.values());
  }
}

export default function(cb) {
  let computed = Ember.computed(function() {
    propStack.push(new StackEntry(this));
    let result = cb.call(this);
    let entry = propStack.pop();
    computed.property(...entry.dependentKeys);
    return result;
  });

  return computed;
}

let originalGet = Ember.get;

function newGet(obj, keyName) {
  let entry = propStack.slice(-1)[0];
  let value = originalGet(obj, keyName);
  if (entry) {
    entry.handleGet(obj, keyName, value);
  }
  return value;
}

function newBoundGet(keyName) {
  return newGet(this, keyName);
}

Ember.get = newGet;
Ember.Object.prototype.get = newBoundGet;
