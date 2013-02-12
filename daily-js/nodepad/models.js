var mongoose = require('mongoose'),
    crypto = require('crypto'),
    uuid = require('node-uuid');

var DocumentSchema = mongoose.Schema({
  title: String,
  data: String,
  tags: [String]
});
DocumentSchema.index({title: 1});

function normalizeEmail(email) {
  return email.toLowerCase();
}

function hashPassword(password) {
  if (!this.salt) {
    this.salt = uuid.v4();
  }
  return this.encryptPassword(password);
}

var UserSchema = mongoose.Schema({
  email: {type: String, set: normalizeEmail},
  salt: String,
  password: {type: String, set: hashPassword}
});
UserSchema.index({email: 1}, {unique: true});
UserSchema.methods.encryptPassword = function(password) {
  return crypto.createHmac('sha1', this.salt)
    .update(password)
    .digest('hex');
};
UserSchema.methods.authenticate = function(password) {
  return this.password === this.encryptPassword(password);
};

exports.Document = mongoose.model('Document', DocumentSchema);
exports.User = mongoose.model('User', UserSchema);
