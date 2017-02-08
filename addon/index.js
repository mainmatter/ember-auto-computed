import Ember from 'ember';

export default function(cb) {
  return Ember.computed(cb);
}

let originalGet = Ember.get;

function newGet(...args) {
  console.log(args);
  return originalGet(...args);
}

Ember.get = newGet;

let originalBoundGet = Ember.Object.prototype.get;

function newBoundGet(...args) {
  console.log(args);
  return originalBoundGet.call(this, ...args);
}

Ember.Object.prototype.get = newBoundGet;
