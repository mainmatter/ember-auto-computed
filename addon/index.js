import Ember from 'ember';

export default function(cb) {
  return Ember.computed(cb);
}

let originalGet = Ember.get;

function newGet(obj, keyName) {
  console.log(obj, keyName);
  return originalGet(obj, keyName);
}

Ember.get = newGet;

let originalBoundGet = Ember.Object.prototype.get;

function newBoundGet(keyName) {
  console.log(this, keyName);
  return originalBoundGet.call(this, keyName);
}

Ember.Object.prototype.get = newBoundGet;
