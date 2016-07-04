let parseMediaValue = require("../utils/parseMediaValue");
let parseMediaValues = require("../utils/parseMediaValues");
let qualityFactorForMediaValue = require("../utils/qualityFactorForMediaValue");
let stringifyMediaValues = require("../utils/stringifyMediaValues");
let stringifyMediaValueWithoutQualityFactor = require("../utils/stringifyMediaValueWithoutQualityFactor");
let Header = require("../Header");
const R = require("ramda");

function byHighestPrecedence(a, b) {
  // "*" gets least precedence, all others are compared by specificity
    return a === "*" ? -1 : (b === "*" ? 1 : byMostSpecific(a, b));
}

function byMostSpecific(a, b) {
    return stringifyMediaValueWithoutQualityFactor(b).length - stringifyMediaValueWithoutQualityFactor(a).length;
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
        let values = this._mediaValues;

        if (R.isEmpty(values)) {
            return 1;
        }

        let givenValue = parseMediaValue(language, "-");
        let matchingValues = values.filter(function (value) {
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
