import Ember from 'ember';

let propStack = [];

class StackEntry {
  constructor(obj) {
    this.obj = obj;
    this.deps = new Map();
    this._dependentKeys = new Set();
  }

  handleGet(obj, keyName, value) {
    if (obj === this.obj) {
      if (Ember.isArray(value)) {
        return value.forEach(it => {
          this._dependentKeys.add(`${keyName}.@each`);
          this.deps.set(it, `${keyName}.@each`);
        });
      } else {
        this._dependentKeys.add(keyName);
        return this.deps.set(value, keyName);
      }
    }

    let objKey = this.deps.get(obj);
    if (objKey !== undefined) {
      let fullKey = [objKey, keyName].join('.');

      if (Ember.isArray(value)) {
        return value.forEach(it => {
          this._dependentKeys.add(`${fullKey}.@each`);
          this.deps.set(it, `${fullKey}.@each`);
        });
      } else {
        this._dependentKeys.add(fullKey);
        return this.deps.set(value, fullKey);
      }
    }
  }

  get dependentKeys() {
    return Array.from(this._dependentKeys.values());
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
