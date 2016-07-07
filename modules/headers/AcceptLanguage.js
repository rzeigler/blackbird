const parseMediaValue = require("../utils/parseMediaValue");
const parseMediaValues = require("../utils/parseMediaValues");
const qualityFactorForMediaValue = require("../utils/qualityFactorForMediaValue");
const stringifyMediaValues = require("../utils/stringifyMediaValues");
const stringifyMediaValueWithoutQualityFactor = require("../utils/stringifyMediaValueWithoutQualityFactor");
const Header = require("../Header");
const R = require("ramda");

function byMostSpecific(a, b) {
    return stringifyMediaValueWithoutQualityFactor(b).length - stringifyMediaValueWithoutQualityFactor(a).length;
}

function byHighestPrecedence(a, b) {
  // "*" gets least precedence, all others are equal
    let precedence;
    if (a === "*") {
        precedence = -1;
    } else if (b === "*") {
        precedence = 1;
    } else {
        precedence = byMostSpecific(a, b);
    }
    return precedence;
}

/**
 * Represents an HTTP Accept-Language header and provides several methods
 * for determining acceptable content languages.
 *
 * http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.4
 */
class AcceptLanguage extends Header {

    constructor(value) {
        super("Accept-Language", value);
    }

  /**
   * Returns the value of this header as a string.
   */
    get value() {
        return stringifyMediaValues(this._mediaValues, "-") || "";
    }

    set value(value) {
        this._mediaValues = value ? parseMediaValues(value, "-") : [];
    }

  /**
   * Returns true if the given language is acceptable.
   */
    accepts(language) {
        return this.qualityFactorForLanguage(language) !== 0;
    }

  /**
   * Returns the quality factor for the given language.
   */
    qualityFactorForLanguage(language) {
        const values = this._mediaValues;

        if (R.isEmpty(values)) {
            return 1;
        }

        const givenValue = parseMediaValue(language, "-");
        const matchingValues = values.filter(function (value) {
            if (value.type === "*") {
                return true;
            }

            if (value.subtype && value.subtype !== givenValue.subtype) {
                return false;
            }

            return value.type === givenValue.type;
        }).sort(byHighestPrecedence);

        if (R.isEmpty(matchingValues)) {
            return 0;
        }

        return qualityFactorForMediaValue(matchingValues[0]);
    }

}

module.exports = AcceptLanguage;
