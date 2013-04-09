basePath = '../';

files = [
  MOCHA,
  MOCHA_ADAPTER,
  './app/lib/angular.js',
  './app/main.js',
  './node_modules/chai/chai.js',
  './test/lib/chai-should.js',
  './test/lib/chai-expect.js',
  './test/lib/angular/angular-mocks.js',
  './test/unit/**/*.js'
];

port = 9201;
runnerPort = 9301;
captureTimeout = 5000;

growl     = true;
colors    = true;
singleRun = true;
autoWatch = false;
browsers  = ['Chrome'];
reporters = ['progress'];
