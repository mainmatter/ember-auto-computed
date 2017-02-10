import Ember from 'ember';
import computed from 'ember-auto-computed';

import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Unit | auto-computed', function() {
  it('computes initial value', function() {
    let obj = Ember.Object.extend({
      a: 5,
      b: 37,
      computed: computed(function() {
        return Ember.get(this, 'a') + this.get('b');
      }),
    }).create();

    expect(obj.get('computed')).to.equal(42);
  });

  it('recomputes on dependency change', function() {
    let obj = Ember.Object.extend({
      a: 5,
      b: 37,
      computed: computed(function() {
        return Ember.get(this, 'a') + this.get('b');
      }),
    }).create();

    expect(obj.get('computed')).to.equal(42);

    obj.set('a', 1);

    expect(obj.get('computed')).to.equal(38);
  });

  it('works for nested computed properties', function() {
    let obj = Ember.Object.extend({
      a: 37,
      b: computed(function() {
        return Ember.get(this, 'a') + 5;
      }),
      c: computed(function() {
        return Ember.get(this, 'b') - 25;
      }),
    }).create();

    expect(obj.get('b')).to.equal(42);
    expect(obj.get('c')).to.equal(17);
  });

  it('recomputes for nested computed properties', function() {
    let obj = Ember.Object.extend({
      a: 0,
      b: computed(function() {
        return Ember.get(this, 'a') + 5;
      }),
      c: computed(function() {
        return Ember.get(this, 'b') - 25;
      }),
    }).create();

    expect(obj.get('b')).to.equal(5);
    expect(obj.get('c')).to.equal(-20);

    obj.set('a', 37);

    expect(obj.get('b')).to.equal(42);
    expect(obj.get('c')).to.equal(17);
  });
});
