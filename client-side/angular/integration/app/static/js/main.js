requirejs.config({
  baseUrl: '/static/js',
  paths: {
    jquery: '/static/js/jquery',
    bootstrap: '/static/js/bootstrap'
  },
  shim: {
    bootstrap: {deps: ['jquery']}
  }
});

require([
  'jquery',
  'bootstrap'
], function($, bootstrap) {
  console.log('foo');
  return {};
});
