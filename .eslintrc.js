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
        "no-extra-semi":                        ["error"],
        "no-func-assign":                       ["error"],
        "no-inner-declarations":                ["error"],
        "no-invalid-regexp":                    ["error"],
        "no-irregular-whitespace":              ["error"],
        "no-negated-in-lhs":                    ["error"],
        "no-obj-calls":                         ["error"],
        "no-prototype-builtins":                "off",
        "no-regex-spaces":                      "off",
        "no-sparse-arrays":                     ["error"],
        "no-unexpected-multiline":              ["error"],
        "no-unreachable":                       ["error"],
        "no-unsafe-finally":                    ["warn"],
        "use-isnan":                            ["error"],
        "valid-jsdoc":                          "off",
        "valid-typeof":                         ["error"],
        //best practices
        "accessor-pairs":                       "off",
        "array-callback-return":                "warn",
        "block-scoped-var":                     "error",
        complexity:                             ["warn", 20],
        "consistent-return":                    "off",
        curly:                                  ["error", "all"],
        "default-case":                         "error",
        "dot-location":                         ["error", "property"],
        "dot-notation":                         "error",
        eqeqeq:                                 ["error", "always"],
        "guard-for-in":                         "error",
        indent:                                 ["error", 4],
        "linebreak-style":                      ["error", "unix"],
        quotes:                                 ["error", "double"],
        "quote-props":                          ["error", "as-needed"],
        semi:                                   ["error", "always"],
        "no-trailing-spaces":                   ["error", {skipBlankLines: false}],
        "space-before-function-paren":          ["error", {anonymous: "always", named: "never"}],
        "one-var":                              ["error", {var: "always"}],
        "prefer-template":                      ["error"],
        "object-curly-spacing":                 ["error", "never"],
        "array-bracket-spacing":                ["error", "never"]
    }
};
