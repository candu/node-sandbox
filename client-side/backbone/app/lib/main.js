requirejs.config({
  baseUrl: '/lib',
  paths: {
    jquery: '/lib/third-party/jquery',
    bootstrap: '/lib/third-party/bootstrap',
    backbone: '/lib/third-party/backbone',
    underscore: '/lib/third-party/underscore',
  },
  shim: {
    underscore: {
      exports: '_'
    },
    bootstrap: {
      deps: ['jquery']
    },
    backbone: {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    }
  }
});

require(['app'], function(App) {
  App.init();
});
