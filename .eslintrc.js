module.exports = {
    extends: "eslint:recommended",
    parserOptions: {ecmaVersion: 6},
    env: {
        node: true,
        es6: true,
        mocha: true
    },
    rules: {
        // enable additional rules
        indent: ["error", 4],
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "double"],
        "quote-props": ["error", "as-needed"],
        semi: ["error", "always"],

        // override default options for rules from base configurations
        "no-cond-assign": ["error", "always"],

        // disable rules from base configurations
        "no-console": "off"
    }
};
