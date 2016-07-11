/**
 * Creates a cookie string using the given options, which may be any of
 * the following:
 *
 * - value
 * - domain
 * - path
 * - expires
 * - secure
 * - httpOnly or HttpOnly
 */
 const R = require("ramda"),
     {is} = R;
 function stringifyCookie(name, options) {
     options = options || {};

     if (R.is(String, options)) {
         options = {value: options};
     }

     let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(options.value || "")}`;

     if (options.domain) {
         cookie += `; domain=${options.domain}`;
     }

     if (options.path) {
         cookie += `; path=${options.path}`;
     }

     if (options.expires) {
         cookie += `; expires=${is(Date, options.expires) ? options.expires.toUTCString() : options.expires}`;
     }

     if (options.secure) {
         cookie += "; secure";
     }

     if (options.httpOnly || options.HttpOnly) {
         cookie += "; HttpOnly";
     }

     return cookie;
 }

 module.exports = stringifyCookie;
