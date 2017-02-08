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
