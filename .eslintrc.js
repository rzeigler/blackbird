module.exports = {
    extends: "eslint:recommended",
    parserOptions: {ecmaVersion: 6},
    env: {
        node: true,
        es6: true,
        mocha: true
    },
    rules: {
        //possible errors
        "no-cond-assign":                       ["error", "always"],
        "no-console":                           "off",
        "no-constant-condition":                ["error"],
        "no-control-regex":                     ["error"],
        "no-debugger":                          ["error"],
        "no-dupe-args":                         ["error"],
        "no-dupe-keys":                         ["error"],
        "no-duplicate-case":                    ["error"],
        "no-empty":                             ["error", {allowEmptyCatch: true}],
        "no-empty-character-class":             ["error"],
        "no-ex-assign":                         ["error"],
        "no-extra-boolean-cast":                ["error"],
        "no-extra-parens":                      ["error"],
        indent:                                 ["error", 4],
        "linebreak-style":                      ["error", "unix"],
        quotes:                                 ["error", "double"],
        "quote-props":                          ["error", "as-needed"],
        semi:                                   ["error", "always"],
        curly:                                  ["error", "all"],
        "no-trailing-spaces":                   ["error", {skipBlankLines: false}],
        "space-before-function-paren":          ["error", {anonymous: "always", named: "never"}],
        "one-var":                              ["error", {var: "always"}],
        "prefer-template":                      ["error"],
        eqeqeq:                                 ["error", "always"],
        "object-curly-spacing":                 ["error", "never"],
        "array-bracket-spacing":                ["error", "never"]
    }
};
