let parseMediaValue = require("../utils/parseMediaValue");
let parseMediaValues = require("../utils/parseMediaValues");
let qualityFactorForMediaValue = require("../utils/qualityFactorForMediaValue");
let stringifyMediaValues = require("../utils/stringifyMediaValues");
let Header = require("../Header");
const R = require("ramda");

function byHighestPrecedence(a, b) {
  // "*" gets least precedence, all others are equal
    return a === "*" ? -1 : (b === "*" ? 1 : 0);
}

/**
 * Represents an HTTP Accept-Charset header and provides several methods
 * for determining acceptable content character sets.
 *
 * http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.2
 */
class AcceptCharset extends Header {

    constructor(value) {
        super("Accept-Charset", value);
    }

  /**
   * Returns the value of this header as a string.
   */
    get value() {
        return stringifyMediaValues(this._mediaValues) || "";
    }

    set value(value) {
        this._mediaValues = value ? parseMediaValues(value) : [];
    }

  /**
   * Returns true if the given charset is acceptable.
   */
    accepts(charset) {
        return this.qualityFactorForCharset(charset) !== 0;
    }

  /**
   * Returns the quality factor for the given charset.
   */
    qualityFactorForCharset(charset) {
        let values = this._mediaValues;

        let givenValue = parseMediaValue(charset);
        let matchingValues = values.filter(function (value) {
            if (value.type === "*") {
                return true;
            }

            return value.type === givenValue.type;
        }).sort(byHighestPrecedence);

    // From RFC 2616:
    // The special value "*", if present in the Accept-Charset field, matches every character
    // set (including ISO-8859-1) which is not mentioned elsewhere in the Accept-Charset field.
    // If no "*" is present in an Accept-Charset field, then all character sets not explicitly
    // mentioned get a quality value of 0, except for ISO-8859-1, which gets a quality value of
    // 1 if not explicitly mentioned.
        if (givenValue.type === "iso-8859-1") {
            if (matchingValues.length && matchingValues[0].type === "iso-8859-1") {
                return qualityFactorForMediaValue(matchingValues[0]);
            }

            return 1;
        }

        if (R.isEmpty(matchingValues)) {
            return 0;
        }

        return qualityFactorForMediaValue(matchingValues[0]);
    }

}

module.exports = AcceptCharset;
