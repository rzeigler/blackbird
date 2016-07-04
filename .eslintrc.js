module.exports = {
    extends: "eslint:recommended",
    parserOptions: {ecmaVersion: 6},
    env: {
        node: true,
        es6: true,
        mocha: true
    },
    rules: {
        indent:                                 ["error", 4],
        "linebreak-style":                      ["error", "unix"],
        quotes:                                 ["error", "double"],
        "quote-props":                          ["error", "as-needed"],
        semi:                                   ["error", "always"],
        curly:                                  ["error", "all"],
        "no-trailing-spaces":                   ["error", { skipBlankLines: false }],
        "space-before-function-paren":          ["error", { anonymous: "always", named: "never" }],
        "one-var":                              ["error", {var: "always"}],
        "prefer-template":                      ["error"],
        eqeqeq:                                 ["error", "always"],
        "no-cond-assign":                       ["error", "always"],
        "no-console":                           "off"
    }
};
