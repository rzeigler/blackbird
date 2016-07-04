/**
 * Creates a string from an object containing a media value. This object may
 * have properties containing the type, subtype, and parameters.
 *
 *   stringifyMediaValue({ type: 'text', subtype: 'html', params: { level: '2', q: '0.4' } }) =>
 *     "text/html;level=2;q=0.4"
 *
 *   stringifyMediaValue({ type: 'en', subtype: 'gb', params: { q: '0.8' } }, "-") =>
 *     "en-gb;q=0.8"
 *
 *   stringifyMediaValue({ type: 'unicode-1-1', params: { q: '0.8' } }) =>
 *     "unicode-1-1;q=0.8"
 */
const R = require("ramda");
function stringifyMediaValue(value, typeSeparator) {
    typeSeparator = typeSeparator || "/";

    let string = value.type || "*";

    if (value.subtype) {
        string += typeSeparator + value.subtype;
    }

    if (value.params) {
        let params = value.params;

        for (let paramName in params) {
            if (params.hasOwnProperty(paramName)) {
                string += `;${paramName}`;

                if (R.isNil(params[paramName])) {
                    string += `=${params[paramName]}`;
                }
            }
        }
    }

    return string;
}

module.exports = stringifyMediaValue;
