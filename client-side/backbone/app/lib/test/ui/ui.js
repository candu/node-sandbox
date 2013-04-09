define(['test/chai'], function(chai) {
  var expect = chai.expect;
  describe('DOM Tests', function testUI() {
    var el = document.createElement('div');
    el.id = 'myDiv';
    el.innerHTML = 'Hi there!';
    el.style.background = '#ccc';
    document.body.appendChild(el);
    var myEl = document.getElementById('myDiv');
    it('is in the DOM', function testInDOM() {
      expect(myEl).to.not.equal(null);
    });
    it('is a child of the body', function testChildOfBody() {
      expect(myEl.parentElement).to.equal(document.body);
    });
    it('has the right text', function testHasRightText() {
      expect(myEl.innerHTML).to.equal('Hi there!');
    });
    it('has the right background', function testHasRightBG() {
      expect(myEl.style.background).to.equal('rgb(204, 204, 204)');
    });
  });
});
