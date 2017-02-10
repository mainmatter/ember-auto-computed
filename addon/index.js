import Ember from 'ember';

export default function(cb) {
  return Ember.computed(cb);
}

let originalGet = Ember.get;

function newGet(obj, keyName) {
  console.log(obj, keyName);
  return originalGet(obj, keyName);
}

function newBoundGet(keyName) {
  return newGet(this, keyName);
}

Ember.get = newGet;
Ember.Object.prototype.get = newBoundGet;
