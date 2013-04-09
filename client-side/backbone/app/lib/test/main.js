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

require(['app', 'test/mocha'], function(App) {
  App.init();
  mocha.setup({
    ui: 'bdd',
    globals: ['requirejs', 'define', 'require'],
    reporter: 'html'
  });
  require([
    'test/ui/ui'
  ], function() {
    if (window.mochaPhantomJS) {
      mochaPhantomJS.run();
    } else {
      mocha.run();
    }
  });
});
