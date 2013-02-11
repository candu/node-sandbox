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

module.exports.all = products;

module.exports.find = function(id) {
  if (typeof id !== 'number') {
    id = parseInt(id, 10);
  }
  return _.find(products, function(product) {
    return product.id === id;
  });
};
