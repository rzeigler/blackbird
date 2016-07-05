/**
 * Returns a shallow copy of the properties of the given object,
 * filtered by the functions in propertyTypes.
 */
 const {forEach, keys} = require("ramda");
 function filterProperties(object, propertyTypes) {
     let properties = {};

     let type, value;
     forEach(function (property) {
         type = propertyTypes[property];

         if (typeof type === "function" && object.hasOwnProperty(property)) {
             value = type(object[property]);

             if (value !== undefined) {
                 properties[property] = value;
             }
         }
     }, keys(object));

     return properties;
 }

 module.exports = filterProperties;
