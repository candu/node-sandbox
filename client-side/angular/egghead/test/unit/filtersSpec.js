describe('Unit: Testing Filters', function() {
  beforeEach(angular.mock.module('myApp'));

  it('should have a reverse filter', inject(function($filter) {
    expect($filter('reverse')).not.to.equal(null);
  }));

  it('should have a reverse filter that works', inject(function($filter) {
    var reverse = $filter('reverse');
    expect(reverse('foo')).to.equal('oofI\'m data from a service.');
  }));
});
