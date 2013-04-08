describe('filter', function() {
  beforeEach(module('myApp'));

  describe('reverse', function() {
    it('should reverse a string', inject(function(reverseFilter) {
      expect(reverseFilter('ABCD')).to.equal('DCBA');
      expect(reverseFilter('foo')).to.equal('oof');
      expect(reverseFilter('')).to.equal('');
    }));
  });
});
