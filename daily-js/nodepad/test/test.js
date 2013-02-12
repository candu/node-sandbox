process.env.NODE_ENV = 'test';

var should = require('should'),
    request = require('supertest'),
    app = require('../app'),
    _ = require('../../../lib/underscore');

var assertObjectIsSubset = function(obj, of) {
  _.each(obj, function(value, key) {
    JSON.stringify(value).should.equal(JSON.stringify(of[key]));
  });
};

describe('GET /', function() {
  it('responds with a message', function(done) {
    request(app)
      .get('/')
      .expect(200)
      .expect('hello there!', done);
  });
});

describe('POST /documents.json', function() {
  it('responds with valid json', function(done) {
    var document = {
      title: 'Test',
      data: 'this is my document!',
      tags: ['test', 'doc']
    };
    request(app)
      .post('/documents.json')
      .send({document: JSON.stringify(document)})
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        }
        assertObjectIsSubset(document, JSON.parse(res.text));
        done();
      });
  });
});
