define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {
  var App = {};
  App.init = function init() {
    console.log($().jquery);
    console.log(_.has({a:42}, 'a'));
    console.log(Backbone);
  };
  return App;
});
