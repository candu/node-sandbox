var _ = require('../../lib/underscore');

var products = [
  {
    id: 1,
    name: 'Mac Book Pro',
    description: 'Apple 13" Mac Book Pro',
    price: 1000
  },
  {
    id: 2,
    name: 'iPad',
    description: 'Apple 64GB 3G iPad',
    price: 899
  }
];

function _int(id) {
  if (typeof id === 'number') {
    return id;
  }
  return parseInt(id, 10);
}

function _find(id) {
  return _.find(products, function(product) {
    return product.id === _int(id);
  });
}

module.exports.all = products;
module.exports.find = _find;
module.exports.set = function(id, updates) {
  var product = _find(id);
  _.each(updates, function(value, key) {
    product[key] = value;
  });
}
