import Ember from 'ember';
import computed from 'ember-auto-computed';

export default Ember.Controller.extend({
  fullName: computed(function() {
    return `${this.get('firstName') || ''} ${this.get('lastName') || ''}`;
  })
});
