import Ember from 'ember';

let propStack = [];

class StackEntry {
  constructor(obj) {
    this.obj = obj;
    // Map of tracked objects and the paths through which they are reachable from `this.obj`
    this._trackedObjects = new Map();
    // Set of dependent keys
    this._dependentKeys = new Set();
  }

  handleGet(obj, keyName, value) {
    if (obj === this.obj) {
      this._add(keyName, value);
    } else {
      let objKey = this._trackedObjects.get(obj);
      if (objKey !== undefined) {
        let fullKey = [objKey, keyName].join('.');
        this._add(fullKey, value);
      }
    }
  }

  _add(keyName, value) {
    if (!Ember.isArray(value)) {
      this._dependentKeys.add(keyName);

      if (!isPrimitive(value)) {
        this._trackedObjects.set(value, keyName);
      }

    } else {
      this._dependentKeys.add(`${keyName}.[]`);

      value.forEach(it => {
        this._trackedObjects.set(it, `${keyName}.@each`);
      });
    }
  }

  get dependentKeys() {
    return Array.from(this._dependentKeys.values());
  }
}

export default function(cb) {
  let computed = Ember.computed(function() {
    let originalGet = Ember.get;
    let originalGetWithDefault = Ember.getWithDefault;
    let originalBoundGet = Ember.Object.prototype.get;
    let originalBoundGetWithDefault = Ember.Object.prototype.getWithDefault;

    function newGet(obj, keyName) {
      let entry = propStack.slice(-1)[0];
      let value = originalGet(obj, keyName);
      if (entry) {
        entry.handleGet(obj, keyName, value);
      }
      return value;
    }

    function newGetWithDefault(obj, keyName, def) {
      let entry = propStack.slice(-1)[0];
      let value = originalGetWithDefault(obj, keyName, def);
      if (entry) {
        entry.handleGet(obj, keyName, value);
      }
      return value;
    }

    function newBoundGet(keyName) {
      return newGet(this, keyName);
    }

    function newBoundGetWithDefault(keyName, def) {
      return newGetWithDefault(this, keyName, def);
    }

    Ember.get = newGet;
    Ember.Object.prototype.get = newBoundGet;
    Ember.getWithDefault = newGetWithDefault;
    Ember.Object.prototype.getWithDefault = newBoundGetWithDefault;

    try {
      propStack.push(new StackEntry(this));
      let result = cb.call(this);
      let entry = propStack.pop();
      let meta = computed._meta || {};
      let staticDependentKeys = meta.__staticDependencies__ || [];
      let dependentKeys = [...entry.dependentKeys, ...staticDependentKeys];
      computed.property(...dependentKeys);
      return result;
    } finally {
      Ember.get = originalGet;
      Ember.Object.prototype.get = originalBoundGet;
      Ember.getWithDefault = originalGetWithDefault;
      Ember.Object.prototype.getWithDefault = originalBoundGetWithDefault;
    }
  });

  computed.depend = function(...keys) {
    this.meta({ __staticDependencies__: keys });
    return this;
  };

  return computed;
}

/* eslint-disable eqeqeq */
function isPrimitive(value) {
  return value == null || (typeof value !== 'function' && typeof value !== 'object');
}
