/**
 * Module dependencies.
 */
var passport = require('passport')
  , login = require('connect-ensure-login')


exports.index = [
  login.ensureLoggedIn(),
  function(req, res) {
    res.redirect('/account');
  }
];

exports.loginForm = function(req, res) {
  res.render('login');
};

exports.login = passport.authenticate('local', {
  successReturnToOrRedirect: '/account',
  failureRedirect: '/login'
});

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
}

exports.account = [
  login.ensureLoggedIn(),
  function(req, res) {
    res.render('account', { user: req.user });
  }
]
