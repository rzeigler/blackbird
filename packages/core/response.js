"use strict";

const R = require("ramda");
const L = require("partial.lenses");

const headers = R.compose(L.prop("headers"), L.default({}));
const header = R.compose(headers, L.prop("name"));
const status = L.prop("status");
const body = L.prop("body");

const setHeader = R.curry((name, value) =>
    L.set(header, value));

const setStatus = (value) => L.set(status, value);

const setBody = (value) => L.set(body, value);

const buildResponse = (ops) => R.reduce(R.compose, R.identity, ops)({});

module.exports = {
    headers,
    header,
    status,
    setHeader,
    setStatus,
    setBody,
    buildResponse
};
