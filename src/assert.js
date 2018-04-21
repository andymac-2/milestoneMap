'use strict'

var NDEBUG = false;

var assert = NDEBUG === true ? () => {} : test => console.assert (test, test.toString());
