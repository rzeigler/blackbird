var expect = require('expect');
var mach = require('../../index');

describe('extensions/acceptCharset', function () {

  beforeEach(function () {
    mach.extend(require('../acceptCharset'));
  });

  describe('a message with an Accept-Charset header', function () {
    var message;
    beforeEach(function () {
      message = new mach.Message(null, {
        'Accept-Charset': 'unicode-1-1'
      });
    });

    it('accepts acceptable charsets', function () {
      expect(message.acceptsCharset('unicode-1-1')).toBe(true);
    });

    it('does not accept unacceptable charsets', function () {
      expect(message.acceptsCharset('iso-8859-5')).toBe(false);
    });
  });

});
