var app = angular.module('behaviorApp', []);

app.directive('enter', function() {
  return function(scope, element) {
    element.bind('mouseenter', function() {
      element.addClass('label');
    });
  };
});

app.directive('leave', function() {
  return function(scope, element) {
    element.bind('mouseleave', function() {
      element.removeClass('label');
    });
  };
});
