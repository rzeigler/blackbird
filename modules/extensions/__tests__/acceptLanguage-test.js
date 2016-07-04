var expect = require('expect');
var mach = require('../../index');

describe('extensions/acceptLanguage', function () {

  beforeEach(function () {
    mach.extend(require('../acceptLanguage'));
  });

  describe('a message with an Accept-Language header', function () {
    var message;
    beforeEach(function () {
      message = new mach.Message(null, {
        'Accept-Language': 'jp'
      });
    });

    it('accepts acceptable languages', function () {
      expect(message.acceptsLanguage('jp')).toBe(true);
    });

    it('does not accept unacceptable languages', function () {
      expect(message.acceptsLanguage('da')).toBe(false);
    });
  });
});
