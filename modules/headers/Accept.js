let parseMediaValue = require("../utils/parseMediaValue");
let parseMediaValues = require("../utils/parseMediaValues");
let qualityFactorForMediaValue = require("../utils/qualityFactorForMediaValue");
let stringifyMediaValues = require("../utils/stringifyMediaValues");
let stringifyMediaValueWithoutQualityFactor = require("../utils/stringifyMediaValueWithoutQualityFactor");
let Header = require("../Header");

function paramsMatchIgnoringQualityFactor(params, givenParams) {
    for (let paramName in params)
        if (params.hasOwnProperty(paramName) && paramName !== "q" && givenParams[paramName] !== params[paramName])
            return false;

    return true;
}

function byHighestPrecedence(a, b) {
  //   Accept: text/*, text/html, text/html;level=1, */*
  //
  // have the following precedence:
  //
  //   1) text/html;level=1
  //   2) text/html
  //   3) text/*
  //   4) */*
    return stringifyMediaValueWithoutQualityFactor(b).length - stringifyMediaValueWithoutQualityFactor(a).length;
}

/**
 * Represents an HTTP Accept header and provides several methods for
 * determining acceptable media types.
 *
 * http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.1
 */
class Accept extends Header {

    constructor(value) {
        super("Accept", value);
    }

  /**
   * Returns the value of this header as a string.
   */
    get value() {
        return stringifyMediaValues(this._mediaValues) || "*/*";
    }

    set value(value) {
        this._mediaValues = value ? parseMediaValues(value) : [];
    }

  /**
   * Returns true if the given media type is acceptable.
   */
    accepts(mediaType) {
        return this.qualityFactorForMediaType(mediaType) !== 0;
    }

  /**
   * Returns the quality factor for the given media type.
   */
    qualityFactorForMediaType(mediaType) {
        let values = this._mediaValues;

        if (!values.length)
            return 1;

        let givenValue = parseMediaValue(mediaType);
        let matchingValues = values.filter(function (value) {
            return (value.type === "*" || value.type === givenValue.type) &&
             (value.subtype === "*" || value.subtype === givenValue.subtype) &&
             paramsMatchIgnoringQualityFactor(value.params, givenValue.params);
        }).sort(byHighestPrecedence);

        if (!matchingValues.length)
            return 0;

        return qualityFactorForMediaValue(matchingValues[0]);
    }

}

module.exports = Accept;
