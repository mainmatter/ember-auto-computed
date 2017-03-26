[![Build Status](https://travis-ci.org/simplabs/ember-auto-computed.svg?branch=master)](https://travis-ci.org/simplabs/ember-auto-computed)

#  ember-auto-computed

ember-auto-computed introduce a mechanism for computed properties to
automatically track their dependent keys so they don't have to be defined
upfront.

__This is an experiment and not (at all!!!) ready for production use!!!__

## Example

The classic `fullName` example looks like this with ember-auto-computed:

```js
  fullName: computed(function() {
    return `${this.get('firstName')} ${this.get('lastName')}`;
  })
```

This is fully functional and will be re-evaluated when either the `firstName`
or `lastName` properties change!

A slightly more involved example illustrates the potential performance
improvements that something like ember-auto-computed could result in:

```js
myProp: computed(function() {
  if (this.get('a')) {
    return this.get('b');
  } else {
    return this.get('c');
  }
}),
```

As dependent keys are recorded when the computed property function is executed,
this property will never depend on all of `a`, `b`, `c` at the same time but
only on either `a` and `b` when `a` is truthy or `c` if a is falsy. That of
course leads to less invalidations (there is no need to invalidate the property
if `b` changes when `a` is falsy anyway).

## License

ember-auto-computed is developed by and &copy;
[simplabs GmbH](http://simplabs.com) and contributors. It is released under the
[MIT License](LICENSE).

ember-auto-computed is not an official part of [Ember.js](http://emberjs.com)
and is not maintained by the Ember.js Core Team.
