requirejs.config({
  baseUrl: '/lib',
  paths: {
    jquery: '/lib/third-party/jquery',
    bootstrap: '/lib/third-party/bootstrap'
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
