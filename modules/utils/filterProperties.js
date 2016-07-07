/**
 * Returns a shallow copy of the properties of the given object,
 * filtered by the functions in propertyTypes.
 */
 const {forEach, keys, isNil} = require("ramda");
 function filterProperties(object, propertyTypes) {
     const properties = {};

     let type, value;
     forEach(function (property) {
         type = propertyTypes[property];

         if (typeof type === "function" && object.hasOwnProperty(property)) {
             value = type(object[property]);

             if (!isNil(value)) {
                 properties[property] = value;
             }
         }
     }, keys(object));

     return properties;
 }

 module.exports = filterProperties;
