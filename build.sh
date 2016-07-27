#!/usr/bin/env bash
eslint . && mocha spec/**/*.js && mocha integration/**/*.js
