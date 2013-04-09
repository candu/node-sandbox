define([
  'backbone'
], function(Backbone) {
  var models = {};
  models.Foo = Backbone.Model.extend({
    initialize: {},
    defaults: {
      id: null,
      name: null,
      age: null
    }
  });
  return models;
});
