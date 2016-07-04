let Promise = require("bluebird");

function resolveProperties(object) {
    let keys = Object.keys(object);

    return Promise.all(
    keys.map(function (key) {
        return object[key];
    })
  ).then(function (values) {
      keys.forEach(function (key, index) {
          object[key] = values[index];
      });

      return object;
  });
}

module.exports = resolveProperties;
