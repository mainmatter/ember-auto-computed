import Ember from 'ember';
import computed from 'ember-auto-computed';

import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';

describe('Unit | auto-computed', function() {
  it('does not persistently modify Ember.get when the CP function throws', function() {
    expect(() => {
      let obj = Ember.Object.extend({
        a: 5,
        b: 37,
        computed: computed(function() {
          throw new Error('err!');
        }),
      }).create();

      try {
        obj.get('computed');
      } catch (_) {
        // ignore this
      }
    }).to.not.change(Ember, 'get');
  });

  it('does not persistently modify Ember.Object.prototype.get when the CP function throws', function() {
    expect(() => {
      let obj = Ember.Object.extend({
        a: 5,
        b: 37,
        computed: computed(function() {
          throw new Error('err!');
        }),
      }).create();

      try {
        obj.get('computed');
      } catch (_) {
        // ignore this
      }
    }).to.not.change(Ember.Object.prototype, 'get');
  });

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

  it('recomputes for nested key', function() {
    let obj = Ember.Object.extend({
      a: {
        b: {
          c: 25,
        },
      },
      computed: computed(function() {
        return this.get('a.b.c') + 17;
      }),
    }).create();

    expect(obj.get('computed')).to.equal(42);
    expect(obj['computed']._dependentKeys).to.deep.equal(['a.b.c']);

    obj.set('a.b.c', 0);

    expect(obj.get('computed')).to.equal(17);
  });

  it('recomputes for nested gets', function() {
    let obj = Ember.Object.extend({
      a: {
        b: {
          c: 25,
        },
      },
      computed: computed(function() {
        return Ember.get(this.get('a'), 'b.c') + 17;
      }),
    }).create();

    expect(obj.get('computed')).to.equal(42);
    expect(obj['computed']._dependentKeys).to.deep.equal(['a', 'a.b.c']);

    obj.set('a.b.c', 0);

    expect(obj.get('computed')).to.equal(17);
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

  it('works for "firstObject"', function() {
    let obj = Ember.Object.extend({
      a: Ember.A([{ value: 'foo' }, { value: 'bar' }, { value: 'baz' }]),
      b: computed(function() {
        return this.get('a.firstObject.value');
      }),
    }).create();

    expect(obj.get('b')).to.equal('foo');
    expect(obj['b']._dependentKeys).to.deep.equal(['a.firstObject.value']);

    obj.set('a.firstObject.value', 'foobar');

    expect(obj.get('b')).to.equal('foobar');
  });

  it('works for "lastObject"', function() {
    let obj = Ember.Object.extend({
      a: Ember.A([{ value: 'foo' }, { value: 'bar' }, { value: 'baz' }]),
      b: computed(function() {
        return this.get('a.lastObject.value');
      }),
    }).create();

    expect(obj.get('b')).to.equal('baz');
    expect(obj['b']._dependentKeys).to.deep.equal(['a.lastObject.value']);

    obj.set('a.lastObject.value', 'foobar');

    expect(obj.get('b')).to.equal('foobar');
  });

  it('works for array', function() {
    let obj = Ember.Object.extend({
      a: [{ value: 'foo' }, { value: 'bar' }, { value: 'baz' }],
      b: computed(function() {
        return this.get('a');
      }),
    }).create();

    expect(obj.get('b')).to.deep.equal([{ value: 'foo' }, { value: 'bar' }, { value: 'baz' }]);
    expect(obj['b']._dependentKeys).to.deep.equal(['a.[]']);
  });

  it('works for mapping objects', function() {
    let obj = Ember.Object.extend({
      a: [{ value: 'foo' }, { value: 'bar' }, { value: 'baz' }],
      b: computed(function() {
        return this.get('a').map(it => Ember.get(it, 'value'));
      }),
    }).create();

    expect(obj.get('b')).to.deep.equal(['foo', 'bar', 'baz']);
    expect(obj['b']._dependentKeys).to.deep.equal(['a.[]', 'a.@each.value']);
  });

  it('works duplicate dep keys', function() {
    let obj = Ember.Object.extend({
      a: 'foo',
      b: 'foo',
      c: computed(function() {
        return this.get('a') + this.get('b');
      }),
    }).create();

    expect(obj.get('c')).to.equal('foofoo');
    expect(obj['c']._dependentKeys).to.deep.equal(['a', 'b']);
  });

  it('works for todos @each example', function() {
    let obj = Ember.Object.extend({
      todos: null,

      init() {
        this.set('todos', [
          Ember.Object.create({ isDone: true }),
          Ember.Object.create({ isDone: false }),
          Ember.Object.create({ isDone: true }),
        ]);
      },

      incomplete: computed(function() {
        let todos = this.get('todos');
        return todos.filter(it => Ember.get(it, 'isDone') === false);
      }),
    }).create();

    expect(obj.get('incomplete')).to.have.lengthOf(1);
    expect(obj['incomplete']._dependentKeys).to.deep.equal(['todos.[]', 'todos.@each.isDone']);
  });

  it('works for todos [] example', function() {
    let obj = Ember.Object.extend({
      todos: null,

      init() {
        this.set('todos', [
          Ember.Object.create({ isDone: true }),
          Ember.Object.create({ isDone: false }),
          Ember.Object.create({ isDone: true }),
        ]);
      },

      selectedTodo: null,
      indexOfSelectedTodo: computed(function() {
        return this.get('todos').indexOf(this.get('selectedTodo'));
      })
    }).create();

    expect(obj.get('indexOfSelectedTodo')).to.equal(-1);
    expect(obj['indexOfSelectedTodo']._dependentKeys).to.deep.equal(['todos.[]', 'selectedTodo']);
  });

  describe('conditional CP', function() {
    let obj;
    beforeEach(function() {
      obj = Ember.Object.extend({
        a: true,
        b: 17,
        c: 42,
        d: computed(function() {
          if (this.get('a')) {
            return this.get('b');
          } else {
            return this.get('c');
          }
        }),
      }).create();
    });

    it('returns 17 initially', function() {
      expect(obj.get('d')).to.equal(17);
    });

    it('only depends on "a" and "b" initially', function() {
      expect(obj.get('d')).to.equal(17);
      expect(obj['d']._dependentKeys).to.deep.equal(['a', 'b']);
    });

    it('changes if "a" changes', function() {
      expect(obj.get('d')).to.equal(17);
      obj.set('a', false);
      expect(obj.get('d')).to.equal(42);
    });

    it('only depends on "a" and "c" after changing "a"', function() {
      expect(obj.get('d')).to.equal(17);
      obj.set('a', false);
      expect(obj.get('d')).to.equal(42);
      expect(obj['d']._dependentKeys).to.deep.equal(['a', 'c']);
    });

    it('changes if "b" changes', function() {
      expect(obj.get('d')).to.equal(17);
      obj.set('b', 13);
      expect(obj.get('d')).to.equal(13);
    });

    it('does not change if "c" changes', function() {
      expect(obj.get('d')).to.equal(17);
      obj.set('c', 1);
      expect(obj.get('d')).to.equal(17);
    });

    it('changes if "a" and "c" are changing', function() {
      expect(obj.get('d')).to.equal(17);
      obj.set('a', false);
      expect(obj.get('d')).to.equal(42);
      obj.set('c', 1);
      expect(obj.get('d')).to.equal(1);
    });
  });
});
