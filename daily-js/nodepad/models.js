var mongoose = require('mongoose');

var DocumentSchema = mongoose.Schema({
  title: String,
  data: String,
  tags: [String]
});
DocumentSchema.index({title: 1});
var Document = mongoose.model('Document', DocumentSchema);
exports.Document = Document;
