import Ember from 'ember';

let propStack = [];

class StackEntry {
  constructor(obj) {
    this.obj = obj;
    this.deps = new Map();
  }

  handleGet(obj, keyName, value) {
    if (obj === this.obj) {
      if (Ember.isArray(value)) {
        return value.forEach(it => {
          this.deps.set(it, `${keyName}.@each`);
        });
      } else {
        return this.deps.set(value, keyName);
      }
    }

    let objKey = this.deps.get(obj);
    if (objKey !== undefined) {
      let fullKey = [objKey, keyName].join('.');

      if (Ember.isArray(value)) {
        return value.forEach(it => {
          this.deps.set(it, `${fullKey}.@each`);
        });
      } else {
        return this.deps.set(value, fullKey);
      }
    }
  }

  get dependentKeys() {
    let set = new Set(this.deps.values());
    return Array.from(set.values());
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
