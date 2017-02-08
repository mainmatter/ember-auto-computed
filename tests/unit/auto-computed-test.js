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

  it.skip('recomputes on dependency change', function() {
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
});
