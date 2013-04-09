requirejs.config({
  baseUrl: '/lib',
  paths: {
    jquery: '/lib/jquery',
    bootstrap: '/lib/bootstrap'
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
