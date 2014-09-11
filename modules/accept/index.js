var mach = require('../index');

Object.defineProperties(
  mach.Request.prototype,
  require('./RequestProperties')
);

mach.Accept = require('./Accept');
mach.AcceptCharset = require('./AcceptCharset');
mach.AcceptEncoding = require('./AcceptEncoding');
mach.AcceptLanguage = require('./AcceptLanguage');

module.exports = mach;
