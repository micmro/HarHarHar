/*! github.com/micmro/PerfCascade Version:0.2.18 (12/01/2017) */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.perfCascade = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
function matchHeaderFilter(lowercaseName) {
    return function (header) { return header.name.toLowerCase() === lowercaseName; };
}
function hasHeader(headers, headerName) {
    var headerFilter = matchHeaderFilter(headerName.toLowerCase());
    return headers.some(headerFilter);
}
exports.hasHeader = hasHeader;
function getHeader(headers, headerName) {
    var headerFilter = matchHeaderFilter(headerName.toLowerCase());
    var firstMatch = headers.filter(headerFilter).pop();
    return firstMatch ? firstMatch.value : undefined;
}
exports.getHeader = getHeader;

},{}],2:[function(require,module,exports){
"use strict";
var har_1 = require("./har");
var misc = require("./misc");
/**
 *
 * Checks if `entry.response.status` code is `>= lowerBound` and `<= upperBound`
 * @param  {Entry} entry
 * @param  {number} lowerBound - inclusive lower bound
 * @param  {number} upperBound - inclusive upper bound
 */
function isInStatusCodeRange(entry, lowerBound, upperBound) {
    return entry.response.status >= lowerBound && entry.response.status <= upperBound;
}
exports.isInStatusCodeRange = isInStatusCodeRange;
function isCompressible(entry) {
    var harEntry = entry.rawResource;
    var minCompressionSize = 1000;
    // small responses
    if (harEntry.response.bodySize < minCompressionSize) {
        return false;
    }
    if (misc.contains(["html", "css", "javascript", "svg", "plain"], entry.requestType)) {
        return true;
    }
    var mime = harEntry.response.content.mimeType;
    var compressableMimes = ["application/vnd.ms-fontobject",
        "application/x-font-opentype",
        "application/x-font-truetype",
        "application/x-font-ttf",
        "application/xml",
        "font/eot",
        "font/opentype",
        "font/otf",
        "image/vnd.microsoft.icon"];
    if (misc.contains(["text"], mime.split("/")[0]) || misc.contains(compressableMimes, mime.split(";")[0])) {
        return true;
    }
    return false;
}
function isCachable(entry) {
    var harEntry = entry.rawResource;
    var headers = harEntry.response.headers;
    // do not cache non-gets,204 and non 2xx status codes
    if (harEntry.request.method.toLocaleLowerCase() !== "get" ||
        harEntry.response.status === 204 ||
        !isInStatusCodeRange(harEntry, 200, 299)) {
        return false;
    }
    if (!(har_1.hasHeader(headers, "Cache-Control") || har_1.hasHeader(headers, "Expires"))) {
        return true;
    }
    return har_1.getHeader(headers, "Cache-Control").indexOf("no-cache") > -1
        || har_1.getHeader(headers, "Pragma") === "no-cache";
}
function hasCacheIssue(entry) {
    var harEntry = entry.rawResource;
    var headers = harEntry.response.headers;
    return (!har_1.hasHeader(headers, "Content-Encoding") && isCachable(entry));
}
exports.hasCacheIssue = hasCacheIssue;
function hasCompressionIssue(entry) {
    var harEntry = entry.rawResource;
    var headers = harEntry.response.headers;
    return (!har_1.hasHeader(headers, "Content-Encoding") && isCompressible(entry));
}
exports.hasCompressionIssue = hasCompressionIssue;
function isSecure(entry) {
    return entry.name.indexOf("https://") === 0;
}
exports.isSecure = isSecure;
/**
 * Check if the document (disregarding any initial http->https redirects) is loaded over a secure connection.
 * @param {WaterfallData} data -  the waterfall data.
 * @returns {boolean}
 */
function documentIsSecure(data) {
    var rootDocument = data.entries.filter(function (e) { return !e.rawResource.response.redirectURL; })[0];
    return isSecure(rootDocument);
}
exports.documentIsSecure = documentIsSecure;

},{"./har":1,"./misc":4}],3:[function(require,module,exports){
/**
 *  SVG Icons
 */
"use strict";
var toSvg = function (x, y, title, className, scale, svgDoc) {
    var parser = new DOMParser();
    var doc = parser.parseFromString("<svg x=\"" + x + "\" y=\"" + y + "\" xmlns=\"http://www.w3.org/2000/svg\">\n    <g class=\"icon " + className + "\" transform=\"scale(" + scale + ")\">\n      " + svgDoc + "\n      <title>" + title + "</title>\n    </g>\n  </svg>", "image/svg+xml");
    return doc.firstChild;
};
function noTls(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-no-tls", scale, "<path d=\"m 18,6.2162 0,2.7692 q 0,0.2813 -0.205529,0.4868\n    -0.205529,0.2055 -0.486779,0.2055 l -0.692307,0 q -0.28125,0 -0.486779,-0.2055 -0.205529,-0.2055 -0.205529,-0.4868\n    l 0,-2.7692 q 0,-1.1466 -0.811298,-1.9579 -0.811298,-0.8113 -1.957933,-0.8113 -1.146634,0 -1.957933,0.8113\n    -0.811298,0.8113 -0.811298,1.9579 l 0,2.0769 1.038462,0 q 0.432692,0 0.735577,0.3029 0.302884,0.3029\n    0.302884,0.7356 l 0,6.2307 q 0,0.4327 -0.302884,0.7356 -0.302885,0.3029 -0.735577,0.3029 l -10.384615,0 q\n    -0.432693,0 -0.735577,-0.3029 Q 0,15.995 0,15.5623 L 0,9.3316 Q 0,8.8989 0.302885,8.596 0.605769,8.2931\n    1.038462,8.2931 l 7.26923,0 0,-2.0769 q 0,-2.0012 1.422476,-3.4237 1.422476,-1.4225 3.423678,-1.4225 2.001202,0\n    3.423678,1.4225 Q 18,4.215 18,6.2162 Z\" />");
}
exports.noTls = noTls;
function err3xx(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-redirect", scale, "<path d=\"M 17,2.3333333 17,7 q 0,0.2708444 -0.19792,0.4687111\n    -0.197911,0.1979556 -0.468747,0.1979556 l -4.666666,0 q -0.437503,0 -0.614587,-0.4166223 -0.177084,-0.4063111\n    0.14584,-0.7187555 L 12.635413,5.0937778 Q 11.093751,3.6666667 9,3.6666667 q -1.0833333,0 -2.0677067,0.4218666 Q\n    5.94792,4.5104 5.2291644,5.2291556 4.5104178,5.9479111 4.0885422,6.9322667 3.6666667,7.9167111 3.6666667,9 q\n    0,1.083378 0.4218755,2.067733 0.4218756,0.984356 1.1406222,1.703111 Q 5.94792,13.4896 6.9322933,13.911467\n    7.9166667,14.333333 9,14.333333 q 1.239582,0 2.343751,-0.541689 1.104169,-0.5416 1.864578,-1.5312 0.07289,-0.104177\n    0.239591,-0.125066 0.145831,0 0.260409,0.09378 l 1.427084,1.437511 q 0.09375,0.08356 0.09896,0.213511\n    0.0053,0.130222 -0.07813,0.2344 -1.135413,1.375022 -2.75,2.130222 Q 10.791662,17 9,17 7.3749956,17\n    5.8958311,16.364622 4.4166667,15.729156 3.3437511,14.656267 2.2708356,13.583378 1.6354133,12.104178 1,10.624978 1,9\n    1,7.3750222 1.6354133,5.8958222 2.2708356,4.4167111 3.3437511,3.3437333 4.4166667,2.2708444 5.8958311,1.6353778\n    7.3749956,1 9,1 q 1.531253,0 2.963538,0.5781333 1.432293,0.5781334 2.54688,1.6302223 L 15.864587,1.8646222 Q\n    16.166667,1.5416889 16.593751,1.7187556 17,1.8958222 17,2.3333333 Z\" />");
}
exports.err3xx = err3xx;
function err4xx(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-4xx", scale, "<path d=\"m 10.141566,13.833 0,-1.6945 q 0,-0.1249 -0.08472,-0.2096\n    -0.084725,-0.084 -0.2006658,-0.084 l -1.7123482,0 q -0.1159402,0 -0.2006658,0.084 -0.084725,0.084 -0.084725,0.2096\n    l 0,1.6945 q 0,0.1248 0.084725,0.2096 0.084725,0.084 0.2006658,0.084 l 1.7123482,0 q 0.1159402,0 0.2006658,-0.084\n    0.08472,-0.084 0.08472,-0.2096 z m -0.01784,-3.3356 0.160533,-4.0936 q 0,-0.107 -0.08919,-0.1694 -0.115941,-0.098\n    -0.2140439,-0.098 l -1.9620656,0 q -0.098103,0 -0.2140436,0.098 -0.089185,0.062 -0.089185,0.1873 l 0.1516221,4.0757\n    q 0,0.089 0.089185,0.1472 0.089185,0.058 0.2140435,0.058 l 1.6499188,0 q 0.1248588,0 0.2095847,-0.058 0.08473,-0.058\n    0.09364,-0.1472 z M 9.9988702,2.1676 16.848263,14.7248 q 0.312147,0.5619 -0.01784,1.1237 -0.151614,0.2587\n    -0.414709,0.4103 -0.263093,0.1516 -0.566321,0.1516 l -13.6987852,0 q -0.3032283,0 -0.5663235,-0.1516 Q\n    1.3211891,16.1072 1.169575,15.8485 0.83959124,15.2867 1.151738,14.7248 L 8.0011307,2.1676 Q 8.1527449,1.8911\n    8.4202993,1.7306 8.6878537,1.57 9.0000005,1.57 q 0.3121468,0 0.5797012,0.1606 0.2675544,0.1605 0.4191685,0.437\n    z\" />");
}
exports.err4xx = err4xx;
function err5xx(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-5xx", scale, "<path d=\"m 10.141566,13.833 0,-1.6945 q 0,-0.1249 -0.08472,-0.2096\n    -0.084725,-0.084 -0.2006658,-0.084 l -1.7123482,0 q -0.1159402,0 -0.2006658,0.084 -0.084725,0.084 -0.084725,0.2096 l\n    0,1.6945 q 0,0.1248 0.084725,0.2096 0.084725,0.084 0.2006658,0.084 l 1.7123482,0 q 0.1159402,0 0.2006658,-0.084\n    0.08472,-0.084 0.08472,-0.2096 z m -0.01784,-3.3356 0.160533,-4.0936 q 0,-0.107 -0.08919,-0.1694 -0.115941,-0.098\n    -0.2140439,-0.098 l -1.9620656,0 q -0.098103,0 -0.2140436,0.098 -0.089185,0.062 -0.089185,0.1873 l 0.1516221,4.0757\n    q 0,0.089 0.089185,0.1472 0.089185,0.058 0.2140435,0.058 l 1.6499188,0 q 0.1248588,0 0.2095847,-0.058 0.08473,-0.058\n    0.09364,-0.1472 z M 9.9988702,2.1676 16.848263,14.7248 q 0.312147,0.5619 -0.01784,1.1237 -0.151614,0.2587\n    -0.414709,0.4103 -0.263093,0.1516 -0.566321,0.1516 l -13.6987852,0 q -0.3032283,0 -0.5663235,-0.1516 Q\n    1.3211891,16.1072 1.169575,15.8485 0.83959124,15.2867 1.151738,14.7248 L 8.0011307,2.1676 Q 8.1527449,1.8911\n    8.4202993,1.7306 8.6878537,1.57 9.0000005,1.57 q 0.3121468,0 0.5797012,0.1606 0.2675544,0.1605 0.4191685,0.437\n    z\" />");
}
exports.err5xx = err5xx;
function noCache(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-no-cache", scale, "<path d=\"m 9,1 q 2.177084,0 4.015627,1.0728889 1.838542,1.0729778\n    2.911457,2.9114667 Q 17,6.8229333 17,9 q 0,2.177067 -1.072916,4.015644 -1.072915,1.838489 -2.911457,2.911467 Q\n    11.177084,17 9,17 6.8229156,17 4.9843733,15.927111 3.1458311,14.854133 2.0729156,13.015644 1,11.177067 1,9\n    1,6.8229333 2.0729156,4.9843556 3.1458311,3.1458667 4.9843733,2.0728889 6.8229156,1 9,1 Z m 1.333333,12.9896\n    0,-1.9792 q 0,-0.145778 -0.09375,-0.2448 -0.09375,-0.09893 -0.229164,-0.09893 l -2.0000001,0 q -0.1354222,0\n    -0.2395822,0.104177 -0.1041689,0.104178 -0.1041689,0.239556 l 0,1.9792 q 0,0.135378 0.1041689,0.239556\n    0.10416,0.104177 0.2395822,0.104177 l 2.0000001,0 q 0.135413,0 0.229164,-0.09893 0.09375,-0.09902 0.09375,-0.2448 z\n    m -0.0208,-3.583378 0.187503,-6.4687109 q 0,-0.1249778 -0.104169,-0.1874667 -0.104169,-0.083556 -0.25,-0.083556 l\n    -2.2916626,0 q -0.14584,0 -0.25,0.083556 -0.1041688,0.062222 -0.1041688,0.1874667 L 7.67712,10.406222 q 0,0.104178\n    0.1041689,0.182311 0.10416,0.07822 0.25,0.07822 l 1.9270755,0 q 0.1458396,0 0.2447996,-0.07822 0.09895,-0.07822\n    0.109369,-0.182311 z\" />");
}
exports.noCache = noCache;
function noGzip(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-no-gzip", scale, "<path d=\"m 9,1 q 2.177084,0 4.015627,1.0728889 1.838542,1.0729778\n    2.911457,2.9114667 Q 17,6.8229333 17,9 q 0,2.177067 -1.072916,4.015644 -1.072915,1.838489 -2.911457,2.911467 Q\n    11.177084,17 9,17 6.8229156,17 4.9843733,15.927111 3.1458311,14.854133 2.0729156,13.015644 1,11.177067 1,9\n    1,6.8229333 2.0729156,4.9843556 3.1458311,3.1458667 4.9843733,2.0728889 6.8229156,1 9,1 Z m 1.333333,12.9896\n    0,-1.9792 q 0,-0.145778 -0.09375,-0.2448 -0.09375,-0.09893 -0.229164,-0.09893 l -2.0000001,0 q -0.1354222,0\n    -0.2395822,0.104177 -0.1041689,0.104178 -0.1041689,0.239556 l 0,1.9792 q 0,0.135378 0.1041689,0.239556\n    0.10416,0.104177 0.2395822,0.104177 l 2.0000001,0 q 0.135413,0 0.229164,-0.09893 0.09375,-0.09902 0.09375,-0.2448 z\n    m -0.0208,-3.583378 0.187503,-6.4687109 q 0,-0.1249778 -0.104169,-0.1874667 -0.104169,-0.083556 -0.25,-0.083556 l\n    -2.2916626,0 q -0.14584,0 -0.25,0.083556 -0.1041688,0.062222 -0.1041688,0.1874667 L 7.67712,10.406222 q 0,0.104178\n    0.1041689,0.182311 0.10416,0.07822 0.25,0.07822 l 1.9270755,0 q 0.1458396,0 0.2447996,-0.07822 0.09895,-0.07822\n    0.109369,-0.182311 z\" />");
}
exports.noGzip = noGzip;
function plain(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-plain", scale, "<path d=\"m 15.247139,4.3928381 q 0.250004,0.2500571 0.428571,0.6786286\n    0.178575,0.4285714 0.178575,0.7856761 l 0,10.2857142 q 0,0.357181 -0.250003,0.607162 Q 15.354285,17 14.997143,17 L\n    2.9971428,17 Q 2.64,17 2.3899962,16.750019 2.14,16.500038 2.14,16.142857 l 0,-14.2857142 Q 2.14,1.5000381\n    2.3899962,1.249981 2.64,1 2.9971428,1 l 8.0000002,0 q 0.357142,0 0.785714,0.1785905 0.428571,0.1785905\n    0.678568,0.4285714 z m -3.964282,-2.1785143 0,3.3571047 3.357143,0 Q 14.550712,5.3125333 14.443573,5.2053333 L\n    11.64893,2.4107428 q -0.107147,-0.1072 -0.366073,-0.196419 z m 3.428571,13.6428192 0,-9.1428573 -3.714285,0 q\n    -0.357143,0 -0.607147,-0.2499809 Q 10.14,6.2143238 10.14,5.8571428 l 0,-3.7142856 -6.8571428,0 0,13.7142858\n    11.4285708,0 z M 5.5685715,8.1428569 q 0,-0.1250285 0.080358,-0.2053333 0.080358,-0.080382 0.2053562,-0.080382 l\n    6.2857143,0 q 0.124998,0 0.205356,0.080382 0.08036,0.080302 0.08036,0.2053333 l 0,0.5714284 q 0,0.1250294\n    -0.08036,0.2053334 Q 12.264998,9 12.14,9 L 5.8542857,9 Q 5.7292876,9 5.6489295,8.9196178 5.5685713,8.8393156\n    5.5685713,8.7142844 l 0,-0.5714284 z M 12.14,10.142857 q 0.124998,0 0.205356,0.08038 0.08036,0.0803 0.08036,0.205333\n    l 0,0.571429 q 0,0.125028 -0.08036,0.205333 -0.08036,0.08038 -0.205356,0.08038 l -6.2857143,0 q -0.1249981,0\n    -0.2053562,-0.08038 -0.080358,-0.0803 -0.080358,-0.205333 l 0,-0.571429 q 0,-0.125028 0.080358,-0.205333\n    0.080358,-0.08038 0.2053562,-0.08038 l 6.2857143,0 z m 0,2.285715 q 0.124998,0 0.205356,0.08038 0.08036,0.0803\n    0.08036,0.205333 l 0,0.571429 q 0,0.125029 -0.08036,0.205334 -0.08036,0.08038 -0.205356,0.08038 l -6.2857143,0 q\n    -0.1249981,0 -0.2053562,-0.08038 -0.080358,-0.0803 -0.080358,-0.205334 l 0,-0.571429 q 0,-0.125028\n    0.080358,-0.205333 0.080358,-0.08038 0.2053562,-0.08038 l 6.2857143,0 z\" />");
}
exports.plain = plain;
function other(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-other", scale, "<path d=\"m 10.801185,13.499991 0,3.000034 q 0,0.199966\n    -0.149997,0.350003 Q 10.501188,17 10.301185,17 l -2.9999954,0 q -0.200003,0 -0.350002,-0.149972 -0.149998,-0.150037\n    -0.149998,-0.350003 l 0,-3.000034 q 0,-0.199966 0.149998,-0.350004 0.149999,-0.149972 0.350002,-0.149972 l\n    2.9999954,0 q 0.200003,0 0.350003,0.149972 0.149997,0.150038 0.149997,0.350004 z m 3.950001,-7.4999953 q 0,0.6749751\n    -0.193752,1.2624809 -0.193746,0.5875065 -0.437493,0.956246 Q 13.876188,8.587526 13.43244,8.9624908\n    12.988685,9.337519 12.713687,9.506231 12.43869,9.675006 11.951191,9.949989 q -0.5125,0.287495 -0.856252,0.8125\n    -0.343749,0.525 -0.343749,0.837523 0,0.212477 -0.150001,0.406217 -0.150004,0.193802 -0.349999,0.193802 l\n    -3.0000054,0 q -0.187495,0 -0.318749,-0.231277 -0.131246,-0.231284 -0.131246,-0.468725 l 0,-0.562543 q 0,-1.037488\n    0.812497,-1.9562566 Q 8.4261846,8.0625246 9.4011886,7.6249911 10.138688,7.287504 10.451185,6.9249894\n    10.76369,6.5624748 10.76369,5.9750331 q 0,-0.525002 -0.58125,-0.9250582 -0.5812494,-0.3999918 -1.3437494,-0.3999918\n    -0.812504,0 -1.35,0.3625146 -0.437502,0.3125237 -1.3375,1.4374811 -0.162499,0.2000281 -0.387504,0.2000281\n    -0.149997,0 -0.312498,-0.099982 L 3.4011866,4.9875343 Q 3.2386866,4.8625246 3.2074416,4.6750106 3.1761886,4.4874957\n    3.2761906,4.3250097 5.2761886,1 9.0761896,1 q 0.9999984,0 2.0124974,0.3874782 1.012501,0.3875423 1.825003,1.0375531\n    0.812497,0.649947 1.324997,1.5937436 0.512499,0.9437319 0.512499,1.9812208 z\" />");
}
exports.other = other;
function javascript(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-js", scale, "<g transform=\"matrix(0.03159732,0,0,0.03159732,0.93993349,0.955184)\"\n    id=\"Layer_1\"><g><path d=\"m 112.155,67.644 84.212,0 0,236.019 c 0,106.375 -50.969,143.497 -132.414,143.497 -19.944,0\n    -45.429,-3.324 -62.052,-8.864 L 11.32,370.15 c 11.635,3.878 26.594,6.648 43.214,6.648 35.458,0 57.621,-16.068\n    57.621,-73.687 l 0,-235.467 z\" /><path id=\"path9\" d=\"m 269.484,354.634 c 22.161,11.635 57.62,23.27 93.632,23.27\n    38.783,0 59.282,-16.066 59.282,-40.998 0,-22.715 -17.729,-36.565 -62.606,-52.079 -62.053,-22.162 -103.05,-56.512\n    -103.05,-111.36 0,-63.715 53.741,-111.917 141.278,-111.917 42.662,0 73.132,8.313 95.295,18.838 l -18.839,67.592 c\n    -14.404,-7.201 -41.553,-17.729 -77.562,-17.729 -36.567,0 -54.297,17.175 -54.297,36.013 0,23.824 20.499,34.349\n    69.256,53.188 65.928,24.378 96.4,58.728 96.4,111.915 0,62.606 -47.647,115.794 -150.143,115.794 -42.662,0\n    -84.77,-11.636 -105.82,-23.27 l 17.174,-69.257 z\"/></g></g>");
}
exports.javascript = javascript;
function image(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-image", scale, "<path d=\"M 6,6 Q 6,6.75 5.475,7.275 4.95,7.8 4.2,7.8 3.45,7.8\n    2.925,7.275 2.4,6.75 2.4,6 2.4,5.25 2.925,4.725 3.45,4.2 4.2,4.2 4.95,4.2 5.475,4.725 6,5.25 6,6 Z m 9.6,3.6 0,4.2\n    -13.2,0 0,-1.8 3,-3 1.5,1.5 4.8,-4.8 z M 16.5,3 1.5,3 Q 1.378125,3 1.289063,3.089 1.200003,3.178 1.200003,3.2999 l\n    0,11.4 q 0,0.1219 0.08906,0.2109 0.08906,0.089 0.210937,0.089 l 15,0 q 0.121875,0 0.210938,-0.089 0.08906,-0.089\n    0.08906,-0.2109 l 0,-11.4 q 0,-0.1219 -0.08906,-0.2109 Q 16.621878,3 16.5,3 Z m 1.5,0.3 0,11.4 q \n    0,0.6188 -0.440625,1.0594 Q 17.11875,16.2 16.5,16.2 l -15,0 Q 0.88125,16.2 0.440625,15.7594 0,15.3188 0,14.7 L 0,3.3\n    Q 0,2.6813 0.440625,2.2406 0.88125,1.8 1.5,1.8 l 15,0 q 0.61875,0 1.059375,0.4406 Q 18,2.6813 18,3.3 Z\" />");
}
exports.image = image;
function svg(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return image(x, y, title, scale);
}
exports.svg = svg;
function html(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-html", scale, "<path d=\"m 5.62623,13.310467 -0.491804,0.4919 q -0.09836,0.098\n    -0.226229,0.098 -0.127869,0 -0.22623,-0.098 L 0.098361,9.218667 Q 0,9.120367 0,8.992467 q 0,-0.1279 0.09836,-0.2262\n    l 4.583606,-4.5836 q 0.09836,-0.098 0.22623,-0.098 0.127869,0 0.226229,0.098 l 0.491804,0.4918 q 0.09836,0.098\n    0.09836,0.2262 0,0.1279 -0.09836,0.2262 l -3.865574,3.8656 3.865574,3.8656 q 0.09836,0.098 0.09836,0.2262 0,0.1279\n    -0.09836,0.2262 z m 5.813114,-10.495 -3.668852,12.6983 q -0.03934,0.1279 -0.152459,0.1918 -0.113115,0.064\n    -0.231148,0.025 l -0.609836,-0.1672 q -0.127869,-0.039 -0.191803,-0.1525 -0.06393,-0.1131 -0.02459,-0.2409 l\n    3.668852,-12.6984 q 0.03934,-0.1279 0.152459,-0.1918 0.113115,-0.064 0.231148,-0.025 l 0.609836,0.1672 q\n    0.127869,0.039 0.191803,0.1525 0.06393,0.1131 0.02459,0.241 z m 6.462295,6.4032 -4.583606,4.5837 q -0.09836,0.098\n    -0.22623,0.098 -0.127869,0 -0.226229,-0.098 l -0.491804,-0.4919 q -0.09836,-0.098 -0.09836,-0.2262 0,-0.1278\n    0.09836,-0.2262 l 3.865574,-3.8656 -3.865574,-3.8656 q -0.09836,-0.098 -0.09836,-0.2262 0,-0.1279 0.09836,-0.2262 l\n    0.491804,-0.4918 q 0.09836,-0.098 0.226229,-0.098 0.127869,0 0.22623,0.098 l 4.583606,4.5836 Q 18,8.864567\n    18,8.992467 q 0,0.1279 -0.09836,0.2262 z\" />");
}
exports.html = html;
function css(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-css", scale, "<path d=\"m 15.435754,0.98999905 q 0.625698,0 1.094972,0.41564445 Q\n    17,1.8212879 17,2.4469768 q 0,0.5631111 -0.402235,1.3496889 -2.967597,5.6224 -4.156425,6.7217783 -0.867039,0.813421\n    -1.948602,0.813421 -1.1262576,0 -1.9351961,-0.826755 -0.8089385,-0.8268443 -0.8089385,-1.9620443 0,-1.1441778\n    0.8223463,-1.8949333 L 14.273743,1.4726657 Q 14.801117,0.98999905 15.435754,0.98999905 Z M 7.3106145,10.232488 q\n    0.3486034,0.679289 0.9519554,1.161955 0.6033519,0.482666 1.3452513,0.679378 l 0.00894,0.634577 q 0.035753,1.903911\n    -1.1575432,3.101689 -1.1932962,1.197778 -3.115084,1.197778 -1.0994413,0 -1.9486032,-0.415644 Q 2.5463687,16.176576\n    2.0324022,15.452576 1.5184357,14.728576 1.2592179,13.816843 1,12.905109 1,11.850354 q 0.06257,0.04444\n    0.3664804,0.268089 0.3039107,0.223466 0.55419,0.397778 0.2502793,0.174311 0.5273743,0.326311 0.2770949,0.151911\n    0.4111732,0.151911 0.3664804,0 0.4916201,-0.330756 0.2234637,-0.589866 0.5139664,-1.005511 0.2905029,-0.415644\n    0.6212291,-0.679377 0.3307262,-0.263644 0.7865922,-0.424533 0.4558659,-0.160889 0.9206704,-0.228 0.4648044,-0.06667\n    1.1173184,-0.09378 z\" />");
}
exports.css = css;
function warning(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-warning", scale, "<path d=\"m 10.141566,13.833 0,-1.6945 q 0,-0.1249 -0.08472,-0.2096\n    -0.084725,-0.084 -0.2006658,-0.084 l -1.7123482,0 q -0.1159402,0 -0.2006658,0.084 -0.084725,0.084 -0.084725,0.2096 l\n    0,1.6945 q 0,0.1248 0.084725,0.2096 0.084725,0.084 0.2006658,0.084 l 1.7123482,0 q 0.1159402,0 0.2006658,-0.084\n    0.08472,-0.084 0.08472,-0.2096 z m -0.01784,-3.3356 0.160533,-4.0936 q 0,-0.107 -0.08919,-0.1694 -0.115941,-0.098\n    -0.2140439,-0.098 l -1.9620656,0 q -0.098103,0 -0.2140436,0.098 -0.089185,0.062 -0.089185,0.1873 l 0.1516221,4.0757\n    q 0,0.089 0.089185,0.1472 0.089185,0.058 0.2140435,0.058 l 1.6499188,0 q 0.1248588,0 0.2095847,-0.058 0.08473,-0.058\n    0.09364,-0.1472 z M 9.9988702,2.1676 16.848263,14.7248 q 0.312147,0.5619 -0.01784,1.1237 -0.151614,0.2587\n    -0.414709,0.4103 -0.263093,0.1516 -0.566321,0.1516 l -13.6987852,0 q -0.3032283,0 -0.5663235,-0.1516 Q\n    1.3211891,16.1072 1.169575,15.8485 0.83959124,15.2867 1.151738,14.7248 L 8.0011307,2.1676 Q 8.1527449,1.8911\n    8.4202993,1.7306 8.6878537,1.57 9.0000005,1.57 q 0.3121468,0 0.5797012,0.1606 0.2675544,0.1605 0.4191685,0.437\n    z\" />");
}
exports.warning = warning;
function font(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-font", scale, "<path d=\"M 7.9711534,5.7542664 6.3365384,10.0812 q 0.3173075,0\n    1.3124995,0.01956 0.9951928,0.01956 1.5432692,0.01956 0.1826924,0 0.5480773,-0.01956 Q 8.9038458,7.6680441\n    7.9711534,5.754622 Z M 1,16.379245 1.0192356,15.619601 q 0.2211537,-0.06756 0.5384613,-0.120178 0.3173075,-0.05245\n    0.5480764,-0.100978 0.2307697,-0.048 0.4759617,-0.139378 0.245192,-0.09138 0.4278844,-0.278844 0.1826925,-0.187556\n    0.2980774,-0.4856 L 5.5865429,8.5715107 8.2788503,1.61 l 1.2307688,0 q 0.076924,0.1346666 0.1057698,0.2019555 L\n    11.586543,6.427333 q 0.317307,0.7499556 1.01923,2.475911 0.701923,1.726045 1.096153,2.639467 0.144232,0.326934\n    0.557693,1.389423 0.413462,1.062489 0.692307,1.620178 0.192309,0.432711 0.336539,0.548089 0.182692,0.144266\n    0.846154,0.283644 0.663462,0.139467 0.807692,0.197156 Q 17,15.946534 17,16.129289 q 0,0.03822 -0.0048,0.124978\n    -0.0048,0.08622 -0.0048,0.124978 -0.60577,0 -1.826923,-0.07644 -1.221154,-0.07733 -1.836539,-0.07733 -0.730769,0\n    -2.067307,0.06756 -1.3365382,0.06755 -1.7115381,0.07733 0,-0.413511 0.038462,-0.750044 L 10.84617,15.351076 q\n    0.0096,0 0.120192,-0.024 0.110577,-0.024 0.149039,-0.03378 0.03846,-0.0098 0.139423,-0.04356 0.100961,-0.03378\n    0.144231,-0.06222 0.04327,-0.02933 0.105769,-0.07733 0.0625,-0.048 0.08653,-0.105777 0.02403,-0.05778\n    0.02403,-0.134578 0,-0.153867 -0.298077,-0.927911 -0.298068,-0.774053 -0.692299,-1.706764 -0.394231,-0.932623\n    -0.403846,-0.961512 l -4.3269223,-0.01956 q -0.25,0.55769 -0.7355768,1.879823 -0.4855769,1.322044\n    -0.4855769,1.562489 0,0.211555 0.1346151,0.360533 0.1346151,0.149067 0.4182693,0.235556 0.2836533,0.08622\n    0.4663458,0.129866 0.1826924,0.04356 0.5480773,0.08178 0.365384,0.03822 0.3942302,0.03822 0.00962,0.182667\n    0.00962,0.557689 0,0.08622 -0.019236,0.259644 -0.5576924,0 -1.6778843,-0.09618 -1.1201929,-0.09618\n    -1.6778844,-0.09618 -0.076924,0 -0.254808,0.03822 -0.1778844,0.03822 -0.2067306,0.03822 Q 2.0384613,16.379245\n    1,16.379245 Z\" />");
}
exports.font = font;
function flash(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-flash", scale, "<path d=\"m 13.724296,4.737962 q 0.194716,0.216309 0.07572,0.475924 L\n    7.958654,17.729559 Q 7.818031,18 7.504329,18 7.461078,18 7.352885,17.97846 7.16899,17.924378 7.0770425,17.772918\n    6.9850949,17.621512 7.0283513,17.4484 L 9.15937,8.708015 4.7675305,9.800549 q -0.043251,0.01077 -0.1298072,0.01077\n    -0.1947161,0 -0.3353388,-0.118981 -0.1947107,-0.162286 -0.140628,-0.4219 L 6.3360428,0.34617 Q 6.3792939,0.194711\n    6.5091226,0.097382 6.6389298,0 6.8120043,0 l 3.5480877,0 q 0.205532,0 0.346154,0.135193 0.140628,0.135248\n    0.140628,0.319132 0,0.08656 -0.05409,0.194711 l -1.849763,5.008456 4.283664,-1.06011 q 0.08654,-0.02154\n    0.129807,-0.02154 0.205532,0 0.367791,0.162285 z\" />");
}
exports.flash = flash;
function video(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-video", scale, "<path d=\"m 17,4.106999 0,9.7143 q 0,0.3751 -0.348214,0.5268\n    -0.116071,0.044 -0.223214,0.044 -0.241072,0 -0.401786,-0.1696 l -3.598214,-3.5983 0,1.4822 q 0,1.0625\n    -0.754464,1.8169 -0.754465,0.7552 -1.8169652,0.7552 l -6.2857143,0 q -1.0625,0 -1.8169642,-0.7545 Q 1,13.169599\n    1,12.106999 l 0,-6.2857 q 0,-1.0624 0.7544643,-1.8169 0.7544642,-0.7544 1.8169642,-0.7544 l 6.2857143,0 q\n    1.0625002,0 1.8169652,0.7544 0.754464,0.7545 0.754464,1.8169 l 0,1.4733 3.598214,-3.5893 q 0.160714,-0.1696\n    0.401786,-0.1696 0.107143,0 0.223214,0.044 Q 17,3.732099 17,4.106999 Z\" />");
}
exports.video = video;
function audio(x, y, title, scale) {
    if (scale === void 0) { scale = 1; }
    return toSvg(x, y, title, "icon-audio", scale, "<path d=\"m 8.384615,3.7559 0,10.4615 q 0,0.2501 -0.182692,0.4327\n    -0.182692,0.1827 -0.432692,0.1827 -0.25,0 -0.432692,-0.1827 l -3.201924,-3.2019 -2.51923,0 q -0.25,0\n    -0.432693,-0.1827 Q 1,11.0828 1,10.8328 L 1,7.1405 Q 1,6.8905 1.182692,6.7078 1.365385,6.5251 1.615385,6.5251 l\n    2.51923,0 3.201924,-3.2019 q 0.182692,-0.1827 0.432692,-0.1827 0.25,0 0.432692,0.1827 0.182692,0.1827\n    0.182692,0.4327 z m 3.692308,5.2308 q 0,0.7307 -0.408654,1.3605 -0.408654,0.6299 -1.08173,0.8991 -0.09615,0.048\n    -0.240385,0.048 -0.25,0 -0.432693,-0.1779 -0.182692,-0.1778 -0.182692,-0.4375 0,-0.2018 0.115385,-0.3413\n    0.115385,-0.1394 0.278846,-0.2404 0.163461,-0.1009 0.326923,-0.2211 0.163462,-0.1202 0.278846,-0.3414\n    0.115385,-0.2211 0.115385,-0.548 0,-0.327 -0.115385,-0.5481 Q 10.615385,8.2174 10.451923,8.0972 10.288461,7.9771\n    10.125,7.8761 9.961539,7.7751 9.846154,7.6357 9.730769,7.4963 9.730769,7.2943 q 0,-0.2596 0.182692,-0.4374\n    0.182693,-0.178 0.432693,-0.178 0.144231,0 0.240385,0.048 0.673076,0.2597 1.08173,0.8942 0.408654,0.6347\n    0.408654,1.3655 z m 2.461538,0 q 0,1.4711 -0.817307,2.7163 -0.817308,1.2452 -2.163462,1.8125 -0.125,0.048\n    -0.240384,0.048 -0.259616,0 -0.442308,-0.1827 -0.182692,-0.1827 -0.182692,-0.4327 0,-0.375 0.375,-0.5673\n    0.538461,-0.2789 0.730769,-0.4231 0.711538,-0.5192 1.110577,-1.3029 0.399038,-0.7836 0.399038,-1.6682 0,-0.8847\n    -0.399038,-1.6683 -0.399039,-0.7836 -1.110577,-1.3029 -0.192308,-0.1442 -0.730769,-0.4231 -0.375,-0.1923\n    -0.375,-0.5672 0,-0.2501 0.182692,-0.4328 0.182692,-0.1826 0.432692,-0.1826 0.125,0 0.25,0.048 1.346154,0.5674\n    2.163462,1.8125 0.817307,1.2452 0.817307,2.7164 z M 17,8.9867 q 0,2.2115 -1.221154,4.0624 -1.221154,1.851\n    -3.25,2.726 -0.125,0.048 -0.25,0.048 -0.25,0 -0.432692,-0.1827 -0.182693,-0.1827 -0.182693,-0.4327 0,-0.3461\n    0.375,-0.5673 0.06731,-0.038 0.216347,-0.1009 0.149038,-0.062 0.216346,-0.101 0.442307,-0.2404 0.788461,-0.4904\n    1.182693,-0.875 1.846154,-2.1827 0.663462,-1.3077 0.663462,-2.7788 0,-1.4712 -0.663462,-2.7789 Q 14.442308,4.9\n    13.259615,4.0251 12.913461,3.775 12.471154,3.5347 q -0.06731,-0.038 -0.216346,-0.101 -0.149039,-0.062\n    -0.216347,-0.101 -0.375,-0.2212 -0.375,-0.5673 0,-0.25 0.182693,-0.4327 0.182692,-0.1827 0.432692,-0.1827 0.125,0\n    0.25,0.048 2.028846,0.8751 3.25,2.726 Q 17,6.7751 17,8.9867 Z\" />");
}
exports.audio = audio;

},{}],4:[function(require,module,exports){
/**
 *  Misc Helpers
 */
"use strict";
/**
 * Parses URL into its components
 * @param  {string} url
 */
function parseUrl(url) {
    var pattern = RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?");
    var matches = url.match(pattern);
    return {
        authority: matches[4],
        fragment: matches[9],
        path: matches[5],
        query: matches[7],
        scheme: matches[2],
    };
}
/**
 * @param  {T[]} arr - array to search
 * @param  {T} item - item to search for
 * @returns boolean - true if `item` is in `arr`
 */
function contains(arr, item) {
    return arr.some(function (x) { return x === item; });
}
exports.contains = contains;
/**
 * Formats and shortens a url for ui
 * @param  {string} url
 * @param  {number} maxLength - max length of shortened url
 * @returns string
 */
function resourceUrlFormatter(url, maxLength) {
    if (url.length < maxLength) {
        return url.replace(/https?:\/\//, "");
    }
    var matches = parseUrl(url);
    if ((matches.authority + matches.path).length < maxLength) {
        return matches.authority + matches.path;
    }
    var maxAuthLength = Math.floor(maxLength / 2) - 3;
    var maxPathLength = Math.floor(maxLength / 2) - 5;
    // maybe we could fine tune these numbers
    var p = matches.path.split("/");
    if (matches.authority.length > maxAuthLength) {
        return matches.authority.substr(0, maxAuthLength) + "..." + p[p.length - 1].substr(-maxPathLength);
    }
    return matches.authority + "..." + p[p.length - 1].substr(-maxPathLength);
}
exports.resourceUrlFormatter = resourceUrlFormatter;
/**
 * Helper to add a precision to `Math.round`
 * @param  {number} num - number to round
 * @param  {number} decimals - decimal precision to round to
 */
function roundNumber(num, decimals) {
    if (decimals === void 0) { decimals = 2; }
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
exports.roundNumber = roundNumber;

},{}],5:[function(require,module,exports){
/**
 *  SVG Helpers
 */
"use strict";
function entries(obj) {
    var entries = [];
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var k = _a[_i];
        entries.push([k, String((obj[k]))]);
    }
    return entries;
}
function safeSetAttribute(el, key, s) {
    if (!(key in el)) {
        console.warn(new Error("Trying to set non-existing attribute " + key + " = " + s + " on a <" + el.tagName.toLowerCase() + ">."));
    }
    el.setAttributeNS(null, key, s);
}
function safeSetStyle(el, key, s) {
    if (key in el.style) {
        el.style[key] = s;
    }
    else {
        console.warn(new Error("Trying to set non-existing style " + key + " = " + s + " on a <" + el.tagName.toLowerCase() + ">."));
    }
}
function newElement(tagName, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.attributes, attributes = _c === void 0 ? {} : _c, _d = _b.css, css = _d === void 0 ? {} : _d, _e = _b.text, text = _e === void 0 ? "" : _e, _f = _b.className, className = _f === void 0 ? "" : _f;
    var element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
    if (className) {
        addClass(element, className);
    }
    if (text) {
        element.textContent = text;
    }
    entries(css).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        return safeSetStyle(element, key, value);
    });
    entries(attributes).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        return safeSetAttribute(element, key, value);
    });
    return element;
}
function newSvg(className, attributes, css) {
    if (css === void 0) { css = {}; }
    return newElement("svg:svg", { className: className, attributes: attributes, css: css });
}
exports.newSvg = newSvg;
function newG(className, attributes, css) {
    if (attributes === void 0) { attributes = {}; }
    if (css === void 0) { css = {}; }
    return newElement("g", { className: className, attributes: attributes, css: css });
}
exports.newG = newG;
function newClipPath(id) {
    var attributes = { id: id };
    return newElement("clipPath", { attributes: attributes });
}
exports.newClipPath = newClipPath;
function newForeignObject(attributes) {
    return newElement("foreignObject", { attributes: attributes });
}
exports.newForeignObject = newForeignObject;
function newA(className) {
    return newElement("a", { className: className });
}
exports.newA = newA;
function newRect(attributes, className, css) {
    if (className === void 0) { className = ""; }
    if (css === void 0) { css = {}; }
    return newElement("rect", { attributes: attributes, className: className, css: css });
}
exports.newRect = newRect;
function newLine(attributes, className) {
    if (className === void 0) { className = ""; }
    return newElement("line", { className: className, attributes: attributes });
}
exports.newLine = newLine;
function newTitle(text) {
    return newElement("title", { text: text });
}
exports.newTitle = newTitle;
function newTextEl(text, attributes, css) {
    if (attributes === void 0) { attributes = {}; }
    if (css === void 0) { css = {}; }
    return newElement("text", { text: text, attributes: attributes, css: css });
}
exports.newTextEl = newTextEl;
/** temp SVG element for size measurements  */
var getTestSVGEl = (function () {
    /** Reference to Temp SVG element for size measurements */
    var svgTestEl;
    var removeSvgTestElTimeout;
    return function () {
        // lazy init svgTestEl
        if (svgTestEl === undefined) {
            var attributes = {
                "className": "water-fall-chart temp",
                "width": "9999px",
            };
            var css = {
                "left": "0px",
                "position": "absolute",
                "top": "0px",
                "visibility": "hidden",
                "z-index": "99999",
            };
            svgTestEl = newSvg("water-fall-chart temp", attributes, css);
        }
        // needs access to body to measure size
        // TODO: refactor for server side use
        if (svgTestEl.parentElement === undefined) {
            window.document.body.appendChild(svgTestEl);
        }
        // debounced time-deleayed cleanup, so the element can be re-used in tight loops
        clearTimeout(removeSvgTestElTimeout);
        removeSvgTestElTimeout = setTimeout(function () {
            svgTestEl.parentNode.removeChild(svgTestEl);
        }, 1000);
        return svgTestEl;
    };
})();
/**
 * Measure the width of a SVGTextElement in px
 * @param  {SVGTextElement} textNode
 * @param  {boolean=false} skipClone - do not clone `textNode` and use original
 * @returns number
 */
function getNodeTextWidth(textNode, skipClone) {
    if (skipClone === void 0) { skipClone = false; }
    var tmp = getTestSVGEl();
    var tmpTextNode;
    if (skipClone) {
        tmpTextNode = textNode;
    }
    else {
        tmpTextNode = textNode.cloneNode(false);
    }
    tmp.appendChild(tmpTextNode);
    // make sure to turn of shadow for performance
    tmpTextNode.style.textShadow = "0";
    window.document.body.appendChild(tmp);
    return tmpTextNode.getBBox().width;
}
exports.getNodeTextWidth = getNodeTextWidth;
/**
 * Adds class `className` to `el`
 * @param  {SVGElement|HTMLElement} el
 * @param  {string} className
 */
function addClass(el, className) {
    var classList = el.classList;
    if (classList) {
        className.split(" ").forEach(function (c) { return classList.add(c); });
    }
    else {
        // IE doesn't support classList in SVG - also no need for dublication check i.t.m.
        el.setAttribute("class", el.getAttribute("class") + " " + className);
    }
    return el;
}
exports.addClass = addClass;
/**
 * Removes class `className` from `el`
 * @param  {SVGElement|HTMLElement} el
 * @param  {string} className
 */
function removeClass(el, className) {
    var classList = el.classList;
    if (classList) {
        classList.remove(className);
    }
    else {
        // IE doesn't support classList in SVG - also no need for dublication check i.t.m.
        el.setAttribute("class", el.getAttribute("class")
            .replace(new RegExp("(\\s|^)" + className + "(\\s|$)", "g"), "$2"));
    }
    return el;
}
exports.removeClass = removeClass;
/**
 * Removes all child DOM nodes from `el`
 * @param  {SVGElement|HTMLElement} el
 */
function removeChildren(el) {
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
    return el;
}
exports.removeChildren = removeChildren;

},{}],6:[function(require,module,exports){
"use strict";
/**
 * Creates the html for diagrams legend
 */
function makeLegend() {
    var ulNode = document.createElement("ul");
    ulNode.className = "resource-legend";
    ulNode.innerHTML = "\n        <li class=\"legend-blocked\" title=\"Time spent in a queue waiting for a network connection.\">Blocked</li>\n        <li class=\"legend-dns\" title=\"DNS resolution time.\">DNS</li>\n        <li class=\"legend-connect\" title=\"Time required to create TCP connection.\">Connect</li>\n        <li class=\"legend-ssl\" title=\"Time required for SSL/TLS negotiation.\">SSL (TLS)</li>\n        <li class=\"legend-send\" title=\"Time required to send HTTP request to the server.\">Send</li>\n        <li class=\"legend-wait\" title=\"Waiting for a response from the server.\">Wait</li>\n        <li class=\"legend-receive\" \n        title=\"Time required to read entire response from the server (or cache).\">Receive</li>";
    return ulNode;
}
exports.makeLegend = makeLegend;

},{}],7:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var legend_1 = require("./legend/legend");
exports.makeLegend = legend_1.makeLegend;
var paging_1 = require("./paging/paging");
var HarTransformer = require("./transformers/har");
var svg_chart_1 = require("./waterfall/svg-chart");
/** default options to use if not set in `options` parameter */
var defaultOptions = {
    leftColumnWith: 25,
    legendHolder: undefined,
    pageSelector: undefined,
    rowHeight: 23,
    showAlignmentHelpers: true,
    showIndicatorIcons: true,
    showMimeTypeIcon: true,
};
function PerfCascade(waterfallDocsData, chartOptions) {
    if (chartOptions === void 0) { chartOptions = {}; }
    var options = __assign({}, defaultOptions, chartOptions);
    // setup paging helper
    var paging = new paging_1.default(waterfallDocsData);
    var doc = svg_chart_1.createWaterfallSvg(paging.getSelectedPage(), options);
    // page update behaviour
    paging.onPageUpdate(function (_pageIndex, pageDoc) {
        var el = doc.parentElement;
        var newDoc = svg_chart_1.createWaterfallSvg(pageDoc, options);
        el.replaceChild(newDoc, doc);
        doc = newDoc;
    });
    if (options.pageSelector) {
        paging.initPagingSelectBox(options.pageSelector);
    }
    if (options.legendHolder) {
        options.legendHolder.innerHTML = "";
        options.legendHolder.appendChild(legend_1.makeLegend());
    }
    return doc;
}
/**
 * Create new PerfCascade from HAR data
 * @param  {Har} harData - HAR object
 * @param  {ChartOptions} options - PerfCascade options object
 * @returns {SVGSVGElement} - Chart SVG Element
 */
function fromHar(harData, options) {
    if (options === void 0) { options = {}; }
    return PerfCascade(HarTransformer.transformDoc(harData), options);
}
exports.fromHar = fromHar;
/**
 * Create new PerfCascade from PerfCascade's internal WaterfallData format
 * @param {WaterfallDocs} waterfallDocsData Object containing data to render
 * @param  {ChartOptions} options - PerfCascade options object
 * @returns {SVGSVGElement} - Chart SVG Element
 */
function fromPerfCascadeFormat(waterfallDocsData, options) {
    if (options === void 0) { options = {}; }
    return PerfCascade(waterfallDocsData, options);
}
exports.fromPerfCascadeFormat = fromPerfCascadeFormat;
var transformHarToPerfCascade = HarTransformer.transformDoc;
exports.transformHarToPerfCascade = transformHarToPerfCascade;

},{"./legend/legend":6,"./paging/paging":8,"./transformers/har":9,"./waterfall/svg-chart":22}],8:[function(require,module,exports){
"use strict";
var svg = require("../helpers/svg");
/** Class to keep track of run of a multi-run har is beeing shown  */
var Paging = (function () {
    function Paging(doc) {
        this.doc = doc;
        this.selectedPageIndex = 0;
        this.onPageUpdateCbs = [];
    }
    /**
     * Returns number of pages
     * @returns number - number of pages in current doc
     */
    Paging.prototype.getPageCount = function () {
        return this.doc.pages.length;
    };
    /**
     * Returns selected pages
     * @returns WaterfallData - currently selected page
     */
    Paging.prototype.getSelectedPage = function () {
        return this.doc.pages[this.selectedPageIndex];
    };
    /**
     * Returns index of currently selected page
     * @returns number - index of current page (0 based)
     */
    Paging.prototype.getSelectedPageIndex = function () {
        return this.selectedPageIndex;
    };
    /**
     * Update which pageIndex is currently update.
     * Published `onPageUpdate`
     * @param  {number} pageIndex
     */
    Paging.prototype.setSelectedPageIndex = function (pageIndex) {
        var _this = this;
        if (this.selectedPageIndex === pageIndex) {
            return;
        }
        if (pageIndex < 0 || pageIndex >= this.getPageCount()) {
            throw new Error("Page does not exist - Invalid pageIndex selected");
        }
        this.selectedPageIndex = pageIndex;
        var selectedPage = this.doc.pages[this.selectedPageIndex];
        this.onPageUpdateCbs.forEach(function (cb) {
            cb(_this.selectedPageIndex, selectedPage);
        });
    };
    /**
     * Register subscriber callbacks to be called when the pageindex updates
     * @param  {OnPagingCb} cb
     * @returns number - index of the callback
     */
    Paging.prototype.onPageUpdate = function (cb) {
        if (this.getPageCount() > 1) {
            return this.onPageUpdateCbs.push(cb);
        }
        return undefined;
    };
    /**
     * hooks up select box with paging options
     * @param  {HTMLSelectElement} selectbox
     */
    Paging.prototype.initPagingSelectBox = function (selectbox) {
        var _this = this;
        var self = this;
        if (this.getPageCount() <= 1) {
            selectbox.style.display = "none";
            return;
        }
        // remove all existing options, like placeholders
        svg.removeChildren(selectbox);
        this.doc.pages.forEach(function (p, i) {
            var option = new Option(p.title, i.toString(), i === _this.selectedPageIndex);
            selectbox.add(option);
        });
        selectbox.style.display = "block";
        selectbox.addEventListener("change", function (evt) {
            var val = parseInt(evt.target.value, 10);
            self.setSelectedPageIndex(val);
        });
    };
    return Paging;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Paging;

},{"../helpers/svg":5}],9:[function(require,module,exports){
"use strict";
function createWaterfallEntry(name, start, end, segments, rawResource, requestType) {
    if (segments === void 0) { segments = []; }
    var total = (typeof start !== "number" || typeof end !== "number") ? undefined : (end - start);
    return {
        total: total,
        name: name,
        start: start,
        end: end,
        segments: segments,
        rawResource: rawResource,
        requestType: requestType,
    };
}
function createWaterfallEntryTiming(type, start, end) {
    var total = (typeof start !== "number" || typeof end !== "number") ? undefined : (end - start);
    return {
        total: total,
        type: type,
        start: start,
        end: end,
    };
}
/**
 * Convert a MIME type into it's WPT style request type (font, script etc)
 * @param {string} mimeType
 */
function mimeToRequestType(mimeType) {
    if (mimeType === undefined) {
        return "other";
    }
    var types = mimeType.split("/");
    var part2 = types[1];
    // take care of text/css; charset=UTF-8 etc
    if (part2 !== undefined) {
        part2 = part2.indexOf(";") > -1 ? part2.split(";")[0] : part2;
    }
    switch (types[0]) {
        case "image": {
            if (part2 === "svg+xml") {
                return "svg";
            }
            return "image";
        }
        case "font": return "font";
        case "video": return "video";
        case "audio": return "audio";
        default: break;
    }
    switch (part2) {
        case "xml":
        case "html": return "html";
        case "plain": return "plain";
        case "css": return "css";
        case "vnd.ms-fontobject":
        case "font-woff":
        case "font-woff2":
        case "x-font-truetype":
        case "x-font-opentype":
        case "x-font-woff": return "font";
        case "javascript":
        case "x-javascript":
        case "script":
        case "json": return "javascript";
        case "x-shockwave-flash": return "flash";
        default: return "other";
    }
}
/**
 * Transforms the full HAR doc, including all pages
 * @param  {Har} harData - raw hhar object
 * @returns WaterfallDocs
 */
function transformDoc(harData) {
    var _this = this;
    // make sure it's the *.log base node
    var data = (harData["log"] !== undefined ? harData["log"] : harData);
    console.log("HAR created by %s(%s) %s page(s)", data.creator.name, data.creator.version, data.pages.length);
    return {
        pages: data.pages.map(function (_page, i) { return _this.transformPage(data, i); }),
    };
}
exports.transformDoc = transformDoc;
/**
 * Transforms a HAR object into the format needed to render the PerfCascade
 * @param  {Har} harData - HAR document
 * @param {number=0} pageIndex - page to parse (for multi-page HAR)
 * @returns WaterfallData
 */
function transformPage(harData, pageIndex) {
    if (pageIndex === void 0) { pageIndex = 0; }
    // make sure it's the *.log base node
    var data = (harData["log"] !== undefined ? harData["log"] : harData);
    var currPage = data.pages[pageIndex];
    var pageStartTime = new Date(currPage.startedDateTime).getTime();
    var pageTimings = currPage.pageTimings;
    console.log("%s: %s of %s page(s)", currPage.title, pageIndex + 1, data.pages.length);
    var doneTime = 0;
    var entries = data.entries
        .filter(function (entry) { return entry.pageref === currPage.id; })
        .map(function (entry) {
        var startRelative = new Date(entry.startedDateTime).getTime() - pageStartTime;
        doneTime = Math.max(doneTime, startRelative + entry.time);
        var requestType = mimeToRequestType(entry.response.content.mimeType);
        return createWaterfallEntry(entry.request.url, startRelative, parseInt(entry._all_end, 10) || (startRelative + entry.time), buildDetailTimingBlocks(startRelative, entry), entry, requestType);
    });
    var marks = Object.keys(pageTimings)
        .filter(function (k) { return (typeof pageTimings[k] === "number" && pageTimings[k] >= 0); })
        .sort(function (a, b) { return pageTimings[a] > pageTimings[b] ? 1 : -1; })
        .map(function (k) {
        var startRelative = pageTimings[k];
        doneTime = Math.max(doneTime, startRelative);
        return {
            "name": k.replace(/^[_]/, "") + " (" + startRelative + "ms)",
            "startTime": startRelative,
        };
    });
    // Add 100ms margin to make room for labels
    doneTime += 100;
    return {
        durationMs: doneTime,
        entries: entries,
        marks: marks,
        lines: [],
        title: currPage.title,
    };
}
exports.transformPage = transformPage;
/**
 * Create `WaterfallEntry`s to represent the subtimings of a request
 * ("blocked", "dns", "connect", "send", "wait", "receive")
 * @param  {number} startRelative - Number of milliseconds since page load started (`page.startedDateTime`)
 * @param  {Entry} harEntry
 * @returns Array
 */
function buildDetailTimingBlocks(startRelative, harEntry) {
    var t = harEntry.timings;
    return ["blocked", "dns", "connect", "send", "wait", "receive"].reduce(function (collect, key) {
        var time = getTimePair(key, harEntry, collect, startRelative);
        if (time.end && time.start >= time.end) {
            return collect;
        }
        // special case for 'connect' && 'ssl' since they share time
        // http://www.softwareishard.com/blog/har-12-spec/#timings
        if (key === "connect" && t["ssl"] && t["ssl"] !== -1) {
            var sslStart = parseInt(harEntry["_ssl_start"], 10) || time.start;
            var sslEnd = parseInt(harEntry["_ssl_end"], 10) || time.start + t.ssl;
            var connectStart = (!!parseInt(harEntry["_ssl_start"], 10)) ? time.start : sslEnd;
            return collect
                .concat([createWaterfallEntryTiming("ssl", sslStart, sslEnd)])
                .concat([createWaterfallEntryTiming(key, connectStart, time.end)]);
        }
        return collect.concat([createWaterfallEntryTiming(key, time.start, time.end)]);
    }, []);
}
/**
 * Returns Object containing start and end time of `collect`
 *
 * @param  {string} key
 * @param  {Entry} harEntry
 * @param  {WaterfallEntry[]} collect
 * @param  {number} startRelative - Number of milliseconds since page load started (`page.startedDateTime`)
 * @returns {Object}
 */
function getTimePair(key, harEntry, collect, startRelative) {
    var wptKey;
    switch (key) {
        case "wait":
            wptKey = "ttfb";
            break;
        case "receive":
            wptKey = "download";
            break;
        default: wptKey = key;
    }
    var preciseStart = parseInt(harEntry["_" + wptKey + "_start"], 10);
    var preciseEnd = parseInt(harEntry["_" + wptKey + "_end"], 10);
    var start = isNaN(preciseStart) ?
        ((collect.length > 0) ? collect[collect.length - 1].end : startRelative) : preciseStart;
    var end = isNaN(preciseEnd) ? (start + harEntry.timings[key]) : preciseEnd;
    return {
        "end": end,
        "start": start,
    };
}

},{}],10:[function(require,module,exports){
"use strict";
/**
 * Convert a RequestType into a CSS class
 * @param {RequestType} requestType
 */
function requestTypeToCssClass(requestType) {
    return "block-" + requestType;
}
exports.requestTypeToCssClass = requestTypeToCssClass;
/**
 * Convert a TimingType into a CSS class
 * @param {TimingType} timingType
 */
function timingTypeToCssClass(timingType) {
    return "block-" + timingType;
}
exports.timingTypeToCssClass = timingTypeToCssClass;

},{}],11:[function(require,module,exports){
"use strict";
var har_1 = require("../../helpers/har");
var ifValueDefined = function (value, fn) {
    if (!isFinite(value) || value <= 0) {
        return undefined;
    }
    return fn(value);
};
var formatBytes = function (size) { return ifValueDefined(size, function (s) { return s + " byte (~" + Math.round(s / 1024 * 10) / 10 + "kb)"; }); };
var formatTime = function (size) { return ifValueDefined(size, function (s) { return s + " ms"; }); };
var formatDate = function (date) {
    if (!date) {
        return "";
    }
    var dateToFormat = new Date(date);
    return date + " </br>(local time: " + dateToFormat.toLocaleString() + ")";
};
var asIntPartial = function (val, ifIntFn) {
    var v = parseInt(val, 10);
    return ifValueDefined(v, ifIntFn);
};
/** get experimental feature (usually WebPageTest) */
var getExp = function (harEntry, name) {
    return harEntry[name] || harEntry["_" + name] || harEntry.request[name] || harEntry.request["_" + name] || "";
};
/** get experimental feature and ensure it's not a sting of `0` or `` */
var getExpNotNull = function (harEntry, name) {
    var resp = getExp(harEntry, name);
    return resp !== "0" ? resp : "";
};
/** get experimental feature and format it as byte */
var getExpAsByte = function (harEntry, name) {
    var resp = parseInt(getExp(harEntry, name), 10);
    return (isNaN(resp) || resp <= 0) ? "" : formatBytes(resp);
};
function parseGeneralDetails(entry, requestID) {
    var harEntry = entry.rawResource;
    return [
        ["Request Number", "#" + requestID],
        ["Started", new Date(harEntry.startedDateTime).toLocaleString() + " (" + formatTime(entry.start) +
                " after page request started)"],
        ["Duration", formatTime(harEntry.time)],
        ["Error/Status Code", harEntry.response.status + " " + harEntry.response.statusText],
        ["Server IPAddress", harEntry.serverIPAddress],
        ["Connection", harEntry.connection],
        ["Browser Priority", getExp(harEntry, "priority") || getExp(harEntry, "newPriority") ||
                getExp(harEntry, "initialPriority")],
        ["Was pushed", getExp(harEntry, "was_pushed")],
        ["Initiator (Loaded by)", getExp(harEntry, "initiator")],
        ["Initiator Line", getExp(harEntry, "initiator_line")],
        ["Host", har_1.getHeader(harEntry.request.headers, "Host")],
        ["IP", getExp(harEntry, "ip_addr")],
        ["Client Port", getExpNotNull(harEntry, "client_port")],
        ["Expires", getExp(harEntry, "expires")],
        ["Cache Time", getExp(harEntry, "cache_time")],
        ["CDN Provider", getExp(harEntry, "cdn_provider")],
        ["ObjectSize", getExp(harEntry, "objectSize")],
        ["Bytes In (downloaded)", getExpAsByte(harEntry, "bytesIn")],
        ["Bytes Out (uploaded)", getExpAsByte(harEntry, "bytesOut")],
        ["JPEG Scan Count", getExpNotNull(harEntry, "jpeg_scan_count")],
        ["Gzip Total", getExpAsByte(harEntry, "gzip_total")],
        ["Gzip Save", getExpAsByte(harEntry, "gzip_save")],
        ["Minify Total", getExpAsByte(harEntry, "minify_total")],
        ["Minify Save", getExpAsByte(harEntry, "minify_save")],
        ["Image Total", getExpAsByte(harEntry, "image_total")],
        ["Image Save", getExpAsByte(harEntry, "image_save")],
    ];
}
function parseRequestDetails(harEntry) {
    var request = harEntry.request;
    var stringHeader = function (name) { return [name, har_1.getHeader(request.headers, name)]; };
    return [
        ["Method", request.method],
        ["HTTP Version", request.httpVersion],
        ["Bytes Out (uploaded)", getExpAsByte(harEntry, "bytesOut")],
        ["Headers Size", formatBytes(request.headersSize)],
        ["Body Size", formatBytes(request.bodySize)],
        ["Comment", request.comment],
        stringHeader("User-Agent"),
        stringHeader("Host"),
        stringHeader("Connection"),
        stringHeader("Accept"),
        stringHeader("Accept-Encoding"),
        stringHeader("Expect"),
        stringHeader("Forwarded"),
        stringHeader("If-Modified-Since"),
        stringHeader("If-Range"),
        stringHeader("If-Unmodified-Since"),
        ["Querystring parameters count", request.queryString.length],
        ["Cookies count", request.cookies.length],
    ];
}
function parseResponseDetails(harEntry) {
    var response = harEntry.response;
    var content = response.content;
    var headers = response.headers;
    var stringHeader = function (title, name) {
        if (name === void 0) { name = title; }
        return [title, har_1.getHeader(headers, name)];
    };
    var dateHeader = function (name) { return [name, formatDate(har_1.getHeader(headers, name))]; };
    var contentLength = har_1.getHeader(headers, "Content-Length");
    var contentType = har_1.getHeader(headers, "Content-Type");
    if (harEntry._contentType && harEntry._contentType !== contentType) {
        contentType = contentType + " | " + harEntry._contentType;
    }
    return [
        ["Status", response.status + " " + response.statusText],
        ["HTTP Version", response.httpVersion],
        ["Bytes In (downloaded)", getExpAsByte(harEntry, "bytesIn")],
        ["Header Size", formatBytes(response.headersSize)],
        ["Body Size", formatBytes(response.bodySize)],
        ["Content-Type", contentType],
        stringHeader("Cache-Control"),
        stringHeader("Content-Encoding"),
        dateHeader("Expires"),
        dateHeader("Last-Modified"),
        stringHeader("Pragma"),
        ["Content-Length", asIntPartial(contentLength, formatBytes)],
        ["Content Size", (contentLength !== content.size.toString() ? formatBytes(content.size) : "")],
        ["Content Compression", formatBytes(content.compression)],
        stringHeader("Connection"),
        stringHeader("ETag"),
        stringHeader("Accept-Patch"),
        stringHeader("Age"),
        stringHeader("Allow"),
        stringHeader("Content-Disposition"),
        stringHeader("Location"),
        stringHeader("Strict-Transport-Security"),
        stringHeader("Trailer (for chunked transfer coding)", "Trailer"),
        stringHeader("Transfer-Encoding"),
        stringHeader("Upgrade"),
        stringHeader("Vary"),
        stringHeader("Timing-Allow-Origin"),
        ["Redirect URL", response.redirectURL],
        ["Comment", response.comment],
    ];
}
function parseTimings(entry) {
    var timings = entry.rawResource.timings;
    // FIXME should only filter -1 values here, 0 is a valid timing.
    return [
        ["Total", entry.total + " ms"],
        ["Blocked", formatTime(timings["blocked"])],
        ["DNS", formatTime(timings["dns"])],
        ["Connect", formatTime(timings["connect"])],
        ["SSL (TLS)", formatTime(timings["ssl"])],
        ["Send", formatTime(timings["send"])],
        ["Wait", formatTime(timings["wait"])],
        ["Receive", formatTime(timings["receive"])],
    ];
}
/**
 * Data to show in overlay tabs
 * @param  {number} requestID - request number
 * @param  {WaterfallEntry} entry
 */
function getKeys(requestID, entry) {
    var harEntry = entry.rawResource;
    var requestHeaders = harEntry.request.headers;
    var responseHeaders = harEntry.response.headers;
    var headerToKvTuple = function (header) { return [header.name, header.value]; };
    return {
        "general": parseGeneralDetails(entry, requestID),
        "request": parseRequestDetails(harEntry),
        "requestHeaders": requestHeaders.map(headerToKvTuple),
        "response": parseResponseDetails(harEntry),
        "responseHeaders": responseHeaders.map(headerToKvTuple),
        "timings": parseTimings(entry),
    };
}
exports.getKeys = getKeys;

},{"../../helpers/har":1}],12:[function(require,module,exports){
"use strict";
var extract_details_keys_1 = require("./extract-details-keys");
function makeDefinitionList(dlKeyValues, addClass) {
    if (addClass === void 0) { addClass = false; }
    var makeClass = function (key) {
        if (!addClass) {
            return "";
        }
        var className = key.toLowerCase().replace(/[^a-z-]/g, "");
        return "class=\"" + (className || "no-colour") + "\"";
    };
    var isValidTuple = function (tuple) {
        var value = tuple[1];
        return (typeof value === "string" && value.length > 0) ||
            (typeof value === "number" && !(value === 0 || value === -1));
    };
    return dlKeyValues
        .filter(isValidTuple)
        .map(function (tuple) { return "\n      <dt " + makeClass(tuple[0]) + ">" + tuple[0] + "</dt>\n      <dd>" + tuple[1] + "</dd>\n    "; }).join("");
}
function makeTab(innerHtml, renderDl) {
    if (renderDl === void 0) { renderDl = true; }
    if (innerHtml.trim() === "") {
        return "";
    }
    var inner = renderDl ? "<dl>" + innerHtml + "</dl>" : innerHtml;
    return "<div class=\"tab\">\n    " + inner + "\n  </div>";
}
function makeImgTab(accordionHeight, entry) {
    if (entry.requestType !== "image") {
        return "";
    }
    var imgTag = "<img class=\"preview\" style=\"max-height:" + (accordionHeight - 100) + "px\"\n                        data-src=\"" + entry.rawResource.request.url + "\" />";
    return makeTab(imgTag, false);
}
function makeTabBtn(name, tab) {
    return !!tab ? "<li><button class=\"tab-button\">" + name + "</button></li>" : "";
}
function createDetailsBody(requestID, entry, accordeonHeight) {
    var html = document.createElement("html");
    var body = document.createElement("body");
    body.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
    html.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/xmlns/");
    var tabsData = extract_details_keys_1.getKeys(requestID, entry);
    var generalTab = makeTab(makeDefinitionList(tabsData.general));
    var timingsTab = makeTab(makeDefinitionList(tabsData.timings, true));
    var requestDl = makeDefinitionList(tabsData.request);
    var requestHeadersDl = makeDefinitionList(tabsData.requestHeaders);
    var responseDl = makeDefinitionList(tabsData.response);
    var responseHeadersDl = makeDefinitionList(tabsData.responseHeaders);
    var imgTab = makeImgTab(accordeonHeight, entry);
    body.innerHTML = "\n    <div class=\"wrapper\">\n      <header class=\"type-" + entry.requestType + "\">\n        <h3><strong>#" + requestID + "</strong> " + entry.name + "</h3>\n        <nav class=\"tab-nav\">\n        <ul>\n          " + makeTabBtn("General", generalTab) + "\n          <li><button class=\"tab-button\">Request</button></li>\n          <li><button class=\"tab-button\">Response</button></li>\n          " + makeTabBtn("Timings", timingsTab) + "\n          <li><button class=\"tab-button\">Raw Data</button></li>\n          " + makeTabBtn("Preview", imgTab) + "\n        </ul>\n        </nav>\n      </header>\n      " + generalTab + "\n      <div class=\"tab\">\n        <dl>\n          " + requestDl + "\n        </dl>\n        <h2>All Request Headers</h2>\n        <dl>\n          " + requestHeadersDl + "\n        </dl>\n      </div>\n      <div class=\"tab\">\n        <dl>\n          " + responseDl + "\n        </dl>\n        <h2>All Response Headers</h2>\n        <dl>\n          " + responseHeadersDl + "\n        </dl>\n      </div>\n      " + timingsTab + "\n      <div class=\"tab\">\n        <pre><code>" + JSON.stringify(entry.rawResource, null, 2) + "</code></pre>\n      </div>\n      " + imgTab + "\n    </div>\n    ";
    html.appendChild(body);
    return html;
}
exports.createDetailsBody = createDetailsBody;

},{"./extract-details-keys":11}],13:[function(require,module,exports){
"use strict";
var PubSub = (function () {
    function PubSub() {
        this.subscribers = [];
    }
    PubSub.prototype.subscribeToOverlayChanges = function (fn) {
        this.subscribers.push(fn);
    };
    PubSub.prototype.publishToOverlayChanges = function (change) {
        this.subscribers.forEach(function (fn) { return fn(change); });
    };
    return PubSub;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PubSub;
;

},{}],14:[function(require,module,exports){
"use strict";
var svg = require("../../helpers/svg");
var svg_details_overlay_1 = require("./svg-details-overlay");
/** Overlay (popup) instance manager */
var OverlayManager = (function () {
    // TODO: move `overlayHolder` to constructor
    function OverlayManager(context, overlayHolder) {
        this.context = context;
        this.overlayHolder = overlayHolder;
        /** Collection of currely open overlays */
        this.openOverlays = [];
    }
    /** all open overlays height combined */
    OverlayManager.prototype.getCombinedOverlayHeight = function () {
        return this.openOverlays.reduce(function (pre, curr) { return pre + curr.height; }, 0);
    };
    /**
     * Opens an overlay - rerenders others internaly
     */
    OverlayManager.prototype.openOverlay = function (index, y, accordionHeight, entry, barEls) {
        if (this.openOverlays.some(function (o) { return o.index === index; })) {
            return;
        }
        var self = this;
        this.openOverlays.push({
            "defaultY": y,
            "entry": entry,
            "index": index,
            "onClose": function () {
                self.closeOverlay(index, accordionHeight, barEls);
            },
        });
        this.renderOverlays(accordionHeight);
        this.context.pubSub.publishToOverlayChanges({
            "combinedOverlayHeight": self.getCombinedOverlayHeight(),
            "openOverlays": self.openOverlays,
            "type": "open",
        });
        this.realignBars(barEls);
    };
    /**
     * closes on overlay - rerenders others internally
     */
    OverlayManager.prototype.closeOverlay = function (index, accordionHeight, barEls) {
        var self = this;
        this.openOverlays.splice(this.openOverlays.reduce(function (prev, curr, i) {
            return (curr.index === index) ? i : prev;
        }, -1), 1);
        this.renderOverlays(accordionHeight);
        this.context.pubSub.publishToOverlayChanges({
            "combinedOverlayHeight": self.getCombinedOverlayHeight(),
            "openOverlays": self.openOverlays,
            "type": "closed",
        });
        this.realignBars(barEls);
    };
    /**
     * sets the offset for request-bars
     * @param  {SVGGElement[]} barEls
     */
    OverlayManager.prototype.realignBars = function (barEls) {
        var _this = this;
        barEls.forEach(function (bar, j) {
            var offset = _this.getOverlayOffset(j);
            bar.style.transform = "translate(0, " + offset + "px)";
        });
    };
    /** y offset to it's default y position */
    OverlayManager.prototype.getOverlayOffset = function (rowIndex) {
        return this.openOverlays.reduce(function (col, overlay) {
            if (overlay.index < rowIndex) {
                return col + overlay.height;
            }
            return col;
        }, 0);
    };
    /**
     * removes all overlays and renders them again
     *
     * @summary this is to re-set the "y" position since there is a bug in chrome with
     * tranform of an SVG and positioning/scoll of a foreignObjects
     * @param  {number} accordionHeight
     * @param  {SVGGElement} overlayHolder
     */
    OverlayManager.prototype.renderOverlays = function (accordionHeight) {
        var _this = this;
        svg.removeChildren(this.overlayHolder);
        var currY = 0;
        this.openOverlays
            .sort(function (a, b) { return a.index > b.index ? 1 : -1; })
            .forEach(function (overlay) {
            var y = overlay.defaultY + currY;
            var infoOverlay = svg_details_overlay_1.createRowInfoOverlay(overlay.index, y, accordionHeight, overlay.entry, overlay.onClose);
            // if overlay has a preview image show it
            var previewImg = infoOverlay.querySelector("img.preview");
            if (previewImg && !previewImg.src) {
                previewImg.setAttribute("src", previewImg.attributes.getNamedItem("data-src").value);
            }
            _this.overlayHolder.appendChild(infoOverlay);
            var currHeight = infoOverlay.getBoundingClientRect().height;
            currY += currHeight;
            overlay.actualY = y;
            overlay.height = currHeight;
            return overlay;
        });
    };
    return OverlayManager;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OverlayManager;
;

},{"../../helpers/svg":5,"./svg-details-overlay":15}],15:[function(require,module,exports){
"use strict";
var svg = require("../../helpers/svg");
var html_details_body_1 = require("./html-details-body");
function forEach(els, fn) {
    Array.prototype.forEach.call(els, fn);
}
exports.forEach = forEach;
function createCloseButtonSvg(y) {
    var closeBtn = svg.newA("info-overlay-close-btn");
    closeBtn.appendChild(svg.newRect({
        "height": 23,
        "width": 23,
        "x": "100%",
        "y": y,
    }));
    closeBtn.appendChild(svg.newTextEl("X", {
        dx: 7,
        dy: 16,
        x: "100%",
        y: y,
    }));
    closeBtn.appendChild(svg.newTitle("Close Overlay"));
    return closeBtn;
}
function createHolder(y, accordionHeight) {
    var innerHolder = svg.newG("info-overlay-holder");
    var bg = svg.newRect({
        "height": accordionHeight,
        "rx": 2,
        "ry": 2,
        "width": "100%",
        "x": "0",
        "y": y,
    }, "info-overlay");
    innerHolder.appendChild(bg);
    return innerHolder;
}
function createRowInfoOverlay(indexBackup, y, accordionHeight, entry, onClose) {
    var requestID = parseInt(entry.rawResource._index + 1, 10) || indexBackup + 1;
    var wrapper = svg.newG("outer-info-overlay-holder");
    var holder = createHolder(y, accordionHeight);
    var foreignObject = svg.newForeignObject({
        "height": accordionHeight,
        "width": "100%",
        "x": "0",
        "y": y,
    });
    var closeBtn = createCloseButtonSvg(y);
    closeBtn.addEventListener("click", function () { return onClose(indexBackup, holder); });
    var body = html_details_body_1.createDetailsBody(requestID, entry, accordionHeight);
    var buttons = body.getElementsByClassName("tab-button");
    var tabs = body.getElementsByClassName("tab");
    var setTabStatus = function (index) {
        forEach(tabs, function (tab, j) {
            tab.style.display = (index === j) ? "block" : "none";
            buttons.item(j).classList.toggle("active", (index === j));
        });
    };
    forEach(buttons, function (btn, i) {
        btn.addEventListener("click", function () { setTabStatus(i); });
    });
    setTabStatus(0);
    foreignObject.appendChild(body);
    holder.appendChild(foreignObject);
    holder.appendChild(closeBtn);
    wrapper.appendChild(holder);
    return wrapper;
}
exports.createRowInfoOverlay = createRowInfoOverlay;

},{"../../helpers/svg":5,"./html-details-body":12}],16:[function(require,module,exports){
/**
 * Creation of sub-components used in a resource request row
 */
"use strict";
var heuristics = require("../../helpers/heuristics");
// helper to avoid typing out all key of the helper object
function makeIcon(type, title) {
    return { "type": type, "title": title, "width": 20 };
}
/**
 * Scan the request for errors or potential issues and highlight them
 * @param  {WaterfallEntry} entry
 * @returns {Icon}
 */
function getMimeTypeIcon(entry) {
    var harEntry = entry.rawResource;
    // highlight redirects
    if (!!harEntry.response.redirectURL) {
        var url = encodeURI(harEntry.response.redirectURL.split("?")[0] || "");
        return makeIcon("err3xx", harEntry.response.status + " response status: Redirect to " + url + "...");
    }
    else if (heuristics.isInStatusCodeRange(harEntry, 400, 499)) {
        return makeIcon("err4xx", harEntry.response.status + " response status: " + harEntry.response.statusText);
    }
    else if (heuristics.isInStatusCodeRange(harEntry, 500, 599)) {
        return makeIcon("err5xx", harEntry.response.status + " response status: " + harEntry.response.statusText);
    }
    else {
        return makeIcon(entry.requestType, entry.requestType);
    }
}
exports.getMimeTypeIcon = getMimeTypeIcon;
/**
 * Scan the request for errors or portential issues and highlight them
 * @param  {WaterfallEntry} entry
 * @param  {boolean} docIsSsl
 * @returns {Icon[]}
 */
function getIndicatorIcons(entry, docIsSsl) {
    var harEntry = entry.rawResource;
    var output = [];
    if (docIsSsl && !heuristics.isSecure(entry)) {
        output.push(makeIcon("noTls", "Insecure Connection"));
    }
    if (heuristics.hasCacheIssue(entry)) {
        output.push(makeIcon("noCache", "Response not cached"));
    }
    if (heuristics.hasCompressionIssue(entry)) {
        output.push(makeIcon("noGzip", "no gzip"));
    }
    if (!harEntry.response.content.mimeType && heuristics.isInStatusCodeRange(harEntry, 200, 299)) {
        output.push(makeIcon("warning", "No MIME Type defined"));
    }
    return output;
}
exports.getIndicatorIcons = getIndicatorIcons;

},{"../../helpers/heuristics":2}],17:[function(require,module,exports){
/**
 * Creation of sub-components used in a ressource request row
 */
"use strict";
var misc = require("../../helpers/misc");
var svg = require("../../helpers/svg");
var styling_converters_1 = require("../../transformers/styling-converters");
/**
 * Creates the `rect` that represent the timings in `rectData`
 * @param  {RectData} rectData - Data for block
 * @param  {string} className - className for block `rect`
 */
function makeBlock(rectData, className) {
    var blockHeight = rectData.height - 1;
    var rect = svg.newRect({
        "height": blockHeight,
        "width": misc.roundNumber(rectData.width / rectData.unit) + "%",
        "x": misc.roundNumber(rectData.x / rectData.unit) + "%",
        "y": rectData.y,
    }, className);
    if (rectData.label) {
        rect.appendChild(svg.newTitle(rectData.label)); // Add tile to wedge path
    }
    if (rectData.showOverlay && rectData.hideOverlay) {
        rect.addEventListener("mouseenter", rectData.showOverlay(rectData));
        rect.addEventListener("mouseleave", rectData.hideOverlay(rectData));
    }
    return rect;
}
/**
 * Converts a segment to RectData
 * @param  {WaterfallEntryTiming} segment
 * @param  {RectData} rectData
 * @returns RectData
 */
function segmentToRectData(segment, rectData) {
    return {
        "cssClass": styling_converters_1.timingTypeToCssClass(segment.type),
        "height": (rectData.height - 6),
        "hideOverlay": rectData.hideOverlay,
        "label": segment.type + " (" + Math.round(segment.start) + "ms - "
            + Math.round(segment.end) + "ms | total: " + Math.round(segment.total) + "ms)",
        "showOverlay": rectData.showOverlay,
        "unit": rectData.unit,
        "width": segment.total,
        "x": segment.start || 0.001,
        "y": rectData.y,
    };
}
/**
 * @param  {RectData} rectData
 * @param  {number} timeTotal
 * @param  {number} firstX
 * @returns SVGTextElement
 */
function createTimingLabel(rectData, timeTotal, firstX) {
    var minWidth = 500; // minimum supported diagram width that should show the timing label uncropped
    var spacingPerc = (5 / minWidth * 100);
    var y = rectData.y + rectData.height / 1.5;
    var totalLabel = Math.round(timeTotal) + " ms";
    var percStart = (rectData.x + rectData.width) / rectData.unit + spacingPerc;
    var txtEl = svg.newTextEl(totalLabel, { x: misc.roundNumber(percStart) + "%", y: y });
    // (pessimistic) estimation of text with to avoid performance penalty of `getBBox`
    var roughTxtWidth = totalLabel.length * 8;
    if (percStart + (roughTxtWidth / minWidth * 100) > 100) {
        percStart = firstX / rectData.unit - spacingPerc;
        txtEl = svg.newTextEl(totalLabel, { x: misc.roundNumber(percStart) + "%", y: y }, { "textAnchor": "end" });
    }
    return txtEl;
}
/**
 * Render the block and timings for a request
 * @param  {RectData}         rectData Basic dependencys and globals
 * @param  {WaterfallEntryTiming[]} segments Request and Timing Data
 * @param  {number} timeTotal  - total time of the request
 * @return {SVGElement}                Renerated SVG (rect or g element)
 */
function createRect(rectData, segments, timeTotal) {
    var rect = makeBlock(rectData, "time-block " + rectData.cssClass);
    var rectHolder = svg.newG("rect-holder");
    var firstX = rectData.x;
    rectHolder.appendChild(rect);
    if (segments && segments.length > 0) {
        segments.forEach(function (segment) {
            if (segment.total > 0 && typeof segment.start === "number") {
                var childRectData = segmentToRectData(segment, rectData);
                var childRect = makeBlock(childRectData, "segment " + childRectData.cssClass);
                firstX = Math.min(firstX, childRectData.x);
                rectHolder.appendChild(childRect);
            }
        });
        rectHolder.appendChild(createTimingLabel(rectData, timeTotal, firstX));
    }
    return rectHolder;
}
exports.createRect = createRect;
/**
 * Create a new clipper SVG Text element to label a request block to fit the left panel width
 * @param  {number}         x                horizontal position (in px)
 * @param  {number}         y                vertical position of related request block (in px)
 * @param  {string}         name             URL
 * @param  {number}         height           height of row
 * @return {SVGTextElement}                  label SVG element
 */
function createRequestLabelClipped(x, y, name, height) {
    var blockLabel = createRequestLabel(x, y, name, height);
    blockLabel.style.clipPath = "url(#titleClipPath)";
    return blockLabel;
}
exports.createRequestLabelClipped = createRequestLabelClipped;
/**
 * Create a new full width SVG Text element to label a request block
 * @param  {number}         x                horizontal position (in px)
 * @param  {number}         y                vertical position of related request block (in px)
 * @param  {string}         name             URL
 * @param  {number}         height           height of row
 */
function createRequestLabelFull(x, y, name, height) {
    var blockLabel = createRequestLabel(x, y, name, height);
    var labelHolder = svg.newG("full-label");
    labelHolder.appendChild(svg.newRect({
        "height": height - 4,
        "rx": 5,
        "ry": 5,
        "width": svg.getNodeTextWidth(blockLabel),
        "x": x - 3,
        "y": y + 3,
    }, "label-full-bg"));
    labelHolder.appendChild(blockLabel);
    return labelHolder;
}
exports.createRequestLabelFull = createRequestLabelFull;
// private helper
function createRequestLabel(x, y, name, height) {
    var blockName = misc.resourceUrlFormatter(name, 125);
    y = y + Math.round(height / 2) + 5;
    var blockLabel = svg.newTextEl(blockName, { x: x, y: y });
    blockLabel.appendChild(svg.newTitle(name));
    blockLabel.style.opacity = name.match(/js.map$/) ? "0.5" : "1";
    return blockLabel;
}
/**
 * Appends the labels to `rowFixed` - TODO: see if this can be done more elegant
 * @param {SVGGElement}    rowFixed   [description]
 * @param {SVGTextElement} shortLabel [description]
 * @param {SVGGElement}    fullLabel  [description]
 */
function appendRequestLabels(rowFixed, shortLabel, fullLabel) {
    var labelFullBg = fullLabel.getElementsByTagName("rect")[0];
    var fullLabelText = fullLabel.getElementsByTagName("text")[0];
    // use display: none to not render it and visibility to remove it from search results (crt+f in chrome at least)
    fullLabel.style.display = "none";
    fullLabel.style.visibility = "hidden";
    rowFixed.appendChild(shortLabel);
    rowFixed.appendChild(fullLabel);
    rowFixed.addEventListener("mouseenter", function () {
        fullLabel.style.display = "block";
        shortLabel.style.display = "none";
        fullLabel.style.visibility = "visible";
        labelFullBg.style.width = (fullLabelText.clientWidth + 10).toString();
    });
    rowFixed.addEventListener("mouseleave", function () {
        shortLabel.style.display = "block";
        fullLabel.style.display = "none";
        fullLabel.style.visibility = "hidden";
    });
}
exports.appendRequestLabels = appendRequestLabels;
/**
 * Stripe for BG
 * @param  {number}      y              [description]
 * @param  {number}      height         [description]
 * @param  {boolean}     isEven         [description]
 * @return {SVGRectElement}                [description]
 */
function createBgStripe(y, height, isEven) {
    var className = isEven ? "even" : "odd";
    return svg.newRect({
        "height": height,
        "width": "100%",
        "x": 0,
        "y": y,
    }, className);
}
exports.createBgStripe = createBgStripe;
function createNameRowBg(y, rowHeight, onClick) {
    var rowFixed = svg.newG("row row-fixed");
    rowFixed.appendChild(svg.newRect({
        "height": rowHeight,
        "width": "100%",
        "x": "0",
        "y": y,
    }, "", {
        "opacity": 0,
    }));
    rowFixed.addEventListener("click", onClick);
    return rowFixed;
}
exports.createNameRowBg = createNameRowBg;
function createRowBg(y, rowHeight, onClick) {
    var rowFixed = svg.newG("row row-flex");
    rowFixed.appendChild(svg.newRect({
        "height": rowHeight,
        "width": "100%",
        "x": "0",
        "y": y,
    }, "", {
        "opacity": 0,
    }));
    rowFixed.addEventListener("click", onClick);
    return rowFixed;
}
exports.createRowBg = createRowBg;

},{"../../helpers/misc":4,"../../helpers/svg":5,"../../transformers/styling-converters":10}],18:[function(require,module,exports){
"use strict";
var heuristics = require("../../helpers/heuristics");
var icons = require("../../helpers/icons");
var misc = require("../../helpers/misc");
var svg = require("../../helpers/svg");
var indicators = require("./svg-indicators");
var rowSubComponents = require("./svg-row-subcomponents");
// initial clip path
var clipPathElProto = svg.newClipPath("titleClipPath");
clipPathElProto.appendChild(svg.newRect({
    "height": "100%",
    "width": "100%",
}));
// Create row for a single request
function createRow(context, index, rectData, entry, labelXPos, onDetailsOverlayShow) {
    var y = rectData.y;
    var rowHeight = rectData.height;
    var leftColumnWith = context.options.leftColumnWith;
    var rowCssClass = ["row-item"];
    if (heuristics.isInStatusCodeRange(entry.rawResource, 500, 599)) {
        rowCssClass.push("status5xx");
    }
    if (heuristics.isInStatusCodeRange(entry.rawResource, 400, 499)) {
        rowCssClass.push("status4xx");
    }
    else if (entry.rawResource.response.status !== 304 &&
        heuristics.isInStatusCodeRange(entry.rawResource, 300, 399)) {
        // 304 == Not Modified, so not an issue
        rowCssClass.push("status3xx");
    }
    var rowItem = svg.newG(rowCssClass.join(" "));
    var leftFixedHolder = svg.newSvg("left-fixed-holder", {
        "width": leftColumnWith + "%",
        "x": "0",
    });
    var flexScaleHolder = svg.newSvg("flex-scale-waterfall", {
        "width": 100 - leftColumnWith + "%",
        "x": leftColumnWith + "%",
    });
    var requestNumber = index + 1 + ". ";
    var rect = rowSubComponents.createRect(rectData, entry.segments, entry.total);
    var shortLabel = rowSubComponents.createRequestLabelClipped(labelXPos, y, requestNumber + misc.resourceUrlFormatter(entry.name, 40), rowHeight);
    var fullLabel = rowSubComponents.createRequestLabelFull(labelXPos, y, requestNumber + entry.name, rowHeight);
    var rowName = rowSubComponents.createNameRowBg(y, rowHeight, onDetailsOverlayShow);
    var rowBar = rowSubComponents.createRowBg(y, rowHeight, onDetailsOverlayShow);
    var bgStripe = rowSubComponents.createBgStripe(y, rowHeight, (index % 2 === 0));
    // create and attach request block
    rowBar.appendChild(rect);
    var x = 3;
    if (context.options.showMimeTypeIcon) {
        var icon = indicators.getMimeTypeIcon(entry);
        rowName.appendChild(icons[icon.type](x, y + 3, icon.title));
        x += icon.width;
    }
    if (context.options.showIndicatorIcons) {
        // Create and add warnings for potential issues
        indicators.getIndicatorIcons(entry, context.docIsSsl).forEach(function (icon) {
            rowName.appendChild(icons[icon.type](x, y + 3, icon.title));
            x += icon.width;
        });
    }
    rowSubComponents.appendRequestLabels(rowName, shortLabel, fullLabel);
    flexScaleHolder.appendChild(rowBar);
    leftFixedHolder.appendChild(clipPathElProto.cloneNode(true));
    leftFixedHolder.appendChild(rowName);
    rowItem.appendChild(bgStripe);
    rowItem.appendChild(flexScaleHolder);
    rowItem.appendChild(leftFixedHolder);
    return rowItem;
}
exports.createRow = createRow;

},{"../../helpers/heuristics":2,"../../helpers/icons":3,"../../helpers/misc":4,"../../helpers/svg":5,"./svg-indicators":16,"./svg-row-subcomponents":17}],19:[function(require,module,exports){
/**
 * vertical alignment helper lines
 */
"use strict";
var svg = require("../../helpers/svg");
/**
 * Creates verticale alignment bars
 * @param {number} diagramHeight  height of the requests part of the diagram in px
 */
function createAlignmentLines(diagramHeight) {
    return {
        endline: svg.newLine({
            "x1": "0",
            "x2": "0",
            "y1": "0",
            "y2": diagramHeight,
        }, "line-end"),
        startline: svg.newLine({
            "x1": "0",
            "x2": "0",
            "y1": "0",
            "y2": diagramHeight,
        }, "line-start"),
    };
}
exports.createAlignmentLines = createAlignmentLines;
/**
 * Partially appliable Eventlisteners for verticale alignment bars to be shown on hover
 * @param {HoverElements} hoverEl  verticale alignment bars SVG Elements
 */
function makeHoverEvtListeners(hoverEl) {
    return {
        onMouseEnterPartial: function () {
            return function (evt) {
                var targetRect = evt.target;
                svg.addClass(targetRect, "active");
                var xPosEnd = targetRect.x.baseVal.valueInSpecifiedUnits +
                    targetRect.width.baseVal.valueInSpecifiedUnits + "%";
                var xPosStart = targetRect.x.baseVal.valueInSpecifiedUnits + "%";
                hoverEl.endline.x1.baseVal.valueAsString = xPosEnd;
                hoverEl.endline.x2.baseVal.valueAsString = xPosEnd;
                hoverEl.startline.x1.baseVal.valueAsString = xPosStart;
                hoverEl.startline.x2.baseVal.valueAsString = xPosStart;
                svg.addClass(hoverEl.endline, "active");
                svg.addClass(hoverEl.startline, "active");
            };
        },
        onMouseLeavePartial: function () {
            return function (evt) {
                var targetRect = evt.target;
                svg.removeClass(targetRect, "active");
                svg.removeClass(hoverEl.endline, "active");
                svg.removeClass(hoverEl.startline, "active");
            };
        },
    };
}
exports.makeHoverEvtListeners = makeHoverEvtListeners;

},{"../../helpers/svg":5}],20:[function(require,module,exports){
/**
 * Creation of sub-components of the waterfall chart
 */
"use strict";
var misc_1 = require("../../helpers/misc");
var svg = require("../../helpers/svg");
var styling_converters_1 = require("../../transformers/styling-converters");
/**
 * Renders a per-second marker line and appends it to `timeHolder`
 *
 * @param  {Context} context  Execution context object
 * @param  {SVGGElement} timeHolder element that the second marker is appended to
 * @param  {number} secsTotal  total number of seconds in the timeline
 * @param  {number} sec second of the time marker to render
 * @param  {boolean} addLabel  if true a time label is added to the marker-line
 */
var appendSecond = function (context, timeHolder, secsTotal, sec, addLabel) {
    if (addLabel === void 0) { addLabel = false; }
    var diagramHeight = context.diagramHeight;
    var secPerc = 100 / secsTotal;
    /** just used if `addLabel` is `true` - for full seconds */
    var lineLabel;
    var lineClass = "sub-second-line";
    if (addLabel) {
        var showTextBefore = (sec > secsTotal - 0.2);
        lineClass = "second-line";
        var x_1 = misc_1.roundNumber(secPerc * sec) + 0.5 + "%";
        var css = {};
        if (showTextBefore) {
            x_1 = misc_1.roundNumber(secPerc * sec) - 0.5 + "%";
            css["text-anchor"] = "end";
        }
        lineLabel = svg.newTextEl(sec + "s", { x: x_1, y: diagramHeight }, css);
    }
    var x = misc_1.roundNumber(secPerc * sec) + "%";
    var lineEl = svg.newLine({
        "x1": x,
        "x2": x,
        "y1": 0,
        "y2": diagramHeight,
    }, lineClass);
    context.pubSub.subscribeToOverlayChanges(function (change) {
        var offset = change.combinedOverlayHeight;
        // figure out why there is an offset
        var scale = (diagramHeight + offset) / (diagramHeight);
        lineEl.setAttribute("transform", "scale(1, " + scale + ")");
        if (addLabel) {
            lineLabel.setAttribute("transform", "translate(0, " + offset + ")");
        }
    });
    timeHolder.appendChild(lineEl);
    if (addLabel) {
        timeHolder.appendChild(lineLabel);
    }
};
/**
 * Renders the time-scale SVG elements (1sec, 2sec...)
 * @param  {Context} context  Execution context object
 * @param {number} durationMs    Full duration of the waterfall
 * @param {number} subSecondStepMs  Distant (time in ms) between sub-second time-scales
 */
function createTimeScale(context, durationMs, subSecondStepMs) {
    if (subSecondStepMs === void 0) { subSecondStepMs = 200; }
    var timeHolder = svg.newG("time-scale full-width");
    /** steps between each second marker */
    var subSecondSteps = 1000 / subSecondStepMs;
    var secs = durationMs / 1000;
    var steps = durationMs / subSecondStepMs;
    for (var i = 0; i <= steps; i++) {
        var isFullSec = i % subSecondSteps === 0;
        var secValue = i / subSecondSteps;
        appendSecond(context, timeHolder, secs, secValue, isFullSec);
    }
    return timeHolder;
}
exports.createTimeScale = createTimeScale;
// TODO: Implement - data for this not parsed yet
function createBgRect(context, entry) {
    var rect = svg.newRect({
        "height": context.diagramHeight,
        "width": ((entry.total || 1) / context.unit) + "%",
        "x": ((entry.start || 0.001) / context.unit) + "%",
        "y": 0,
    }, styling_converters_1.requestTypeToCssClass(entry.requestType));
    rect.appendChild(svg.newTitle(entry.name)); // Add tile to wedge path
    return rect;
}
exports.createBgRect = createBgRect;

},{"../../helpers/misc":4,"../../helpers/svg":5,"../../transformers/styling-converters":10}],21:[function(require,module,exports){
"use strict";
var misc_1 = require("../../helpers/misc");
var svg = require("../../helpers/svg");
/**
 * Renders global marks for events like the onLoad event etc
 * @param  {Context} context  Execution context object
 * @param {Mark[]} marks         [description]
 */
function createMarks(context, marks) {
    var diagramHeight = context.diagramHeight;
    var marksHolder = svg.newG("marker-holder", {
        "transform": "scale(1, 1)",
    });
    marks.forEach(function (mark, i) {
        var x = misc_1.roundNumber(mark.startTime / context.unit);
        var markHolder = svg.newG("mark-holder type-" + mark.name.toLowerCase());
        var lineHolder = svg.newG("line-holder");
        var lineLabelHolder = svg.newG("line-label-holder");
        mark.x = x;
        var lineLabel = svg.newTextEl(mark.name, { x: x + "%", y: diagramHeight + 25 });
        var line = svg.newLine({
            "x1": x + "%",
            "x2": x + "%",
            "y1": 0,
            "y2": diagramHeight,
        });
        var lastMark = marks[i - 1];
        if (lastMark && mark.x - lastMark.x < 1) {
            lineLabel.setAttribute("x", lastMark.x + 1 + "%");
            mark.x = lastMark.x + 1;
        }
        // would use polyline but can't use percentage for points
        var lineConnection = svg.newLine({
            "x1": x + "%",
            "x2": mark.x + "%",
            "y1": diagramHeight,
            "y2": diagramHeight + 23,
        });
        lineHolder.appendChild(line);
        lineHolder.appendChild(lineConnection);
        context.pubSub.subscribeToOverlayChanges(function (change) {
            var offset = change.combinedOverlayHeight;
            var scale = (diagramHeight + offset) / (diagramHeight);
            line.setAttribute("transform", "scale(1, " + scale + ")");
            lineLabelHolder.setAttribute("transform", "translate(0, " + offset + ")");
            lineConnection.setAttribute("transform", "translate(0, " + offset + ")");
        });
        var isActive = false;
        var onLabelMouseEnter = function () {
            if (!isActive) {
                isActive = true;
                svg.addClass(lineHolder, "active");
                // firefox has issues with this
                markHolder.parentNode.appendChild(markHolder);
            }
        };
        var onLabelMouseLeave = function () {
            isActive = false;
            svg.removeClass(lineHolder, "active");
        };
        lineLabel.addEventListener("mouseenter", onLabelMouseEnter);
        lineLabel.addEventListener("mouseleave", onLabelMouseLeave);
        lineLabelHolder.appendChild(lineLabel);
        markHolder.appendChild(svg.newTitle(mark.name + " (" + Math.round(mark.startTime) + "ms)"));
        markHolder.appendChild(lineHolder);
        markHolder.appendChild(lineLabelHolder);
        marksHolder.appendChild(markHolder);
    });
    return marksHolder;
}
exports.createMarks = createMarks;

},{"../../helpers/misc":4,"../../helpers/svg":5}],22:[function(require,module,exports){
"use strict";
var heuristics_1 = require("../helpers/heuristics");
var svg = require("../helpers/svg");
var styling_converters_1 = require("../transformers/styling-converters");
var overlay_changes_pub_sub_1 = require("./details-overlay/overlay-changes-pub-sub");
var svg_details_overlay_manager_1 = require("./details-overlay/svg-details-overlay-manager");
var indicators = require("./row/svg-indicators");
var row = require("./row/svg-row");
var alignmentHelper = require("./sub-components/svg-alignment-helper");
var generalComponents = require("./sub-components/svg-general-components");
var marks = require("./sub-components/svg-marks");
/**
 * Calculate the height of the SVG chart in px
 * @param {Mark[]}       marks      [description]
 * @param  {number} diagramHeight
 * @returns Number
 */
function getSvgHeight(marks, diagramHeight) {
    var maxMarkTextLength = marks.reduce(function (currMax, currValue) {
        var attributes = { x: 0, y: 0 };
        return Math.max(currMax, svg.getNodeTextWidth(svg.newTextEl(currValue.name, attributes), true));
    }, 0);
    return Math.floor(diagramHeight + maxMarkTextLength + 35);
}
/**
 * Intitializes the context object
 * @param {WaterfallData} data - Object containing the setup parameter
 * @param {ChartOptions} options - Chart config/customization options
 * @param {WaterfallEntry[]} entriesToShow - Filtered array of entries that will be rendered
 * @return {Context} Context object
 */
function createContext(data, options, entriesToShow, overlayHolder) {
    var unit = data.durationMs / 100;
    var diagramHeight = (entriesToShow.length + 1) * options.rowHeight;
    var docIsSsl = heuristics_1.documentIsSecure(data);
    var context = {
        diagramHeight: diagramHeight,
        overlayManager: undefined,
        pubSub: new overlay_changes_pub_sub_1.default(),
        unit: unit,
        options: options,
        docIsSsl: docIsSsl,
    };
    // `overlayManager` needs the `context` reference, so it's attached later
    context.overlayManager = new svg_details_overlay_manager_1.default(context, overlayHolder);
    return context;
}
/**
 * Entry point to start rendering the full waterfall SVG
 * @param {WaterfallData} data - Object containing the setup parameter
 * @param {ChartOptions} options - Chart config/customization options
 * @return {SVGSVGElement} - SVG Element ready to render
 */
function createWaterfallSvg(data, options) {
    // constants
    var entriesToShow = data.entries
        .filter(function (entry) { return (typeof entry.start === "number" && typeof entry.total === "number"); })
        .sort(function (a, b) { return (a.start || 0) - (b.start || 0); });
    /** Holder of request-details overlay */
    var overlayHolder = svg.newG("overlays");
    var context = createContext(data, options, entriesToShow, overlayHolder);
    /** full height of the SVG chart in px */
    var chartHolderHeight = getSvgHeight(data.marks, context.diagramHeight);
    /** Main SVG Element that holds all data */
    var timeLineHolder = svg.newSvg("water-fall-chart", {
        "height": chartHolderHeight,
    });
    /** Holder for scale, event and marks */
    var scaleAndMarksHolder = svg.newSvg("scale-and-marks-holder", {
        "width": 100 - options.leftColumnWith + "%",
        "x": options.leftColumnWith + "%",
    });
    /** Holds all rows */
    var rowHolder = svg.newG("rows-holder");
    /** Holder for on-hover vertical comparison bars */
    var hoverOverlayHolder;
    var mouseListeners;
    if (options.showAlignmentHelpers) {
        hoverOverlayHolder = svg.newG("hover-overlays");
        var hoverEl = alignmentHelper.createAlignmentLines(context.diagramHeight);
        hoverOverlayHolder.appendChild(hoverEl.startline);
        hoverOverlayHolder.appendChild(hoverEl.endline);
        mouseListeners = alignmentHelper.makeHoverEvtListeners(hoverEl);
    }
    // Start appending SVG elements to the holder element (timeLineHolder)
    scaleAndMarksHolder.appendChild(generalComponents.createTimeScale(context, data.durationMs));
    scaleAndMarksHolder.appendChild(marks.createMarks(context, data.marks));
    data.lines.forEach(function (entry) {
        timeLineHolder.appendChild(generalComponents.createBgRect(context, entry));
    });
    var labelXPos = 5;
    // This assumes all icons (mime and indicators) have the same width
    var iconWidth = indicators.getMimeTypeIcon(entriesToShow[0]).width;
    if (options.showMimeTypeIcon) {
        labelXPos += iconWidth;
    }
    if (options.showIndicatorIcons) {
        var iconsPerBlock = entriesToShow.map(function (entry) {
            return indicators.getIndicatorIcons(entry, context.docIsSsl).length;
        });
        labelXPos += iconWidth * Math.max.apply(null, iconsPerBlock);
    }
    var barEls = [];
    function getChartHeight() {
        return (chartHolderHeight + context.overlayManager.getCombinedOverlayHeight()).toString() + "px";
    }
    context.pubSub.subscribeToOverlayChanges(function () {
        timeLineHolder.style.height = getChartHeight();
    });
    /** Renders single row and hooks up behaviour */
    function renderRow(entry, i) {
        var entryWidth = entry.total || 1;
        var y = options.rowHeight * i;
        var x = (entry.start || 0.001);
        var accordionHeight = 450;
        var rectData = {
            "cssClass": styling_converters_1.requestTypeToCssClass(entry.requestType),
            "height": options.rowHeight,
            "hideOverlay": options.showAlignmentHelpers ? mouseListeners.onMouseLeavePartial : undefined,
            "label": entry.name + " (" + entry.start + "ms - " + entry.end + "ms | total: " + entry.total + "ms)",
            "showOverlay": options.showAlignmentHelpers ? mouseListeners.onMouseEnterPartial : undefined,
            "unit": context.unit,
            "width": entryWidth,
            "x": x,
            "y": y,
        };
        var showDetailsOverlay = function () {
            context.overlayManager.openOverlay(i, y + options.rowHeight, accordionHeight, entry, barEls);
        };
        var rowItem = row.createRow(context, i, rectData, entry, labelXPos, showDetailsOverlay);
        barEls.push(rowItem);
        rowHolder.appendChild(rowItem);
    }
    // Main loop to render rows with blocks
    entriesToShow.forEach(renderRow);
    if (options.showAlignmentHelpers) {
        scaleAndMarksHolder.appendChild(hoverOverlayHolder);
    }
    timeLineHolder.appendChild(scaleAndMarksHolder);
    timeLineHolder.appendChild(rowHolder);
    timeLineHolder.appendChild(overlayHolder);
    return timeLineHolder;
}
exports.createWaterfallSvg = createWaterfallSvg;

},{"../helpers/heuristics":2,"../helpers/svg":5,"../transformers/styling-converters":10,"./details-overlay/overlay-changes-pub-sub":13,"./details-overlay/svg-details-overlay-manager":14,"./row/svg-indicators":16,"./row/svg-row":18,"./sub-components/svg-alignment-helper":19,"./sub-components/svg-general-components":20,"./sub-components/svg-marks":21}]},{},[7])(7)
});