mocha.setup({
  ui: 'bdd',
  globals: ['requirejs', 'define', 'require'],
  reporter: 'html'
});
var expect = chai.expect;
