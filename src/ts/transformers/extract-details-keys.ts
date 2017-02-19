import { getHeader } from "../helpers/har";
import {
  formatBytes, formatDateLocalized, formatMilliseconds, formatSeconds, parseAndFormat, parseDate, parseNonEmpty,
  parseNonNegative, parsePositive,
} from "../helpers/parse";
import { Entry, Header } from "../typing/har";

const byteSizeProperty = (title: string, input: string |  number): KvTuple => {
  return [title, parseAndFormat(input, parsePositive, formatBytes)];
};
const countProperty = (title: string, input: string |  number): KvTuple => {
  return [title, parseAndFormat(input, parsePositive)];
};

function parseGeneralDetails(entry: Entry, startRelative: number, requestID: number): KvTuple[] {
  return [
    ["Request Number", `#${requestID}`],
    ["Started", new Date(entry.startedDateTime).toLocaleString() + ((startRelative > 0) ?
      " (" + formatMilliseconds(startRelative) + " after page request started)" : "")],
    ["Duration", formatMilliseconds(entry.time)],
    ["Error/Status Code", entry.response.status + " " + entry.response.statusText],
    ["Server IPAddress", entry.serverIPAddress],
    ["Connection", entry.connection],
    ["Browser Priority", entry._priority || entry._initialPriority],
    ["Was pushed", parseAndFormat(entry._was_pushed, parsePositive, () => "yes")],
    ["Initiator (Loaded by)", entry._initiator],
    ["Initiator Line", entry._initiator_line],
    ["Host", getHeader(entry.request.headers, "Host")],
    ["IP", entry._ip_addr],
    ["Client Port", parseAndFormat(entry._client_port, parsePositive)],
    ["Expires", entry._expires],
    ["Cache Time", parseAndFormat(entry._cache_time, parsePositive, formatSeconds)],
    ["CDN Provider", entry._cdn_provider],
    byteSizeProperty("ObjectSize", entry._objectSize),
    byteSizeProperty("Bytes In (downloaded)", entry._bytesIn),
    byteSizeProperty("Bytes Out (uploaded)", entry._bytesOut),
    byteSizeProperty("JPEG Scan Count", entry._jpeg_scan_count),
    byteSizeProperty("Gzip Total", entry._gzip_total),
    byteSizeProperty("Gzip Save", entry._gzip_save),
    byteSizeProperty("Minify Total", entry._minify_total),
    byteSizeProperty("Minify Save", entry._minify_save),
    byteSizeProperty("Image Total", entry._image_total),
    byteSizeProperty("Image Save", entry._image_save),
  ].filter((k) => k[1] !== undefined && k[1] !== "") as KvTuple[];
}

function parseRequestDetails(harEntry: Entry): KvTuple[] {
  const request = harEntry.request;

  const stringHeader = (name: string): KvTuple => [name, getHeader(request.headers, name)];

  return [
    ["Method", request.method],
    ["HTTP Version", request.httpVersion],
    byteSizeProperty("Bytes Out (uploaded)", harEntry._bytesOut),
    byteSizeProperty("Headers Size", request.headersSize),
    byteSizeProperty("Body Size", request.bodySize),
    ["Comment", parseAndFormat(request.comment, parseNonEmpty)],
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
    countProperty("Querystring parameters count", request.queryString.length),
    countProperty("Cookies count", request.cookies.length),
  ].filter((k) => k[1] !== undefined && k[1] !== "") as KvTuple[];
}

function parseResponseDetails(entry: Entry): KvTuple[] {
  const response = entry.response;
  const content = response.content;
  const headers = response.headers;

  const stringHeader = (title: string, name: string = title): KvTuple => [title, getHeader(headers, name)];
  const dateHeader = (name: string): KvTuple => {
    const header = getHeader(headers, name);
    return [name, parseAndFormat(header, parseDate, formatDateLocalized)];
  };

  const contentLength = getHeader(headers, "Content-Length");
  let contentSize = undefined;
  if (content.size !== -1 && contentLength !== content.size.toString()) {
    contentSize = content.size;
  }

  let contentType = getHeader(headers, "Content-Type");
  if (entry._contentType && entry._contentType !== contentType) {
    contentType = contentType + " | " + entry._contentType;
  }

  return [
    ["Status", response.status + " " + response.statusText],
    ["HTTP Version", response.httpVersion],
    byteSizeProperty("Bytes In (downloaded)", entry._bytesIn),
    byteSizeProperty("Headers Size", response.headersSize),
    byteSizeProperty("Body Size", response.bodySize),
    ["Content-Type", contentType],
    stringHeader("Cache-Control"),
    stringHeader("Content-Encoding"),
    dateHeader("Expires"),
    dateHeader("Last-Modified"),
    stringHeader("Pragma"),
    byteSizeProperty("Content-Length", contentLength),
    byteSizeProperty("Content Size", contentSize),
    byteSizeProperty("Content Compression", content.compression),
    stringHeader("Connection"),
    stringHeader("ETag"),
    stringHeader("Accept-Patch"),
    ["Age", parseAndFormat(getHeader(headers, "Age"), parseNonNegative, formatSeconds)],
    stringHeader("Allow"),
    stringHeader("Content-Disposition"),
    stringHeader("Location"),
    stringHeader("Strict-Transport-Security"),
    stringHeader("Trailer (for chunked transfer coding)", "Trailer"),
    stringHeader("Transfer-Encoding"),
    stringHeader("Upgrade"),
    stringHeader("Vary"),
    stringHeader("Timing-Allow-Origin"),
    ["Redirect URL", parseAndFormat(response.redirectURL, parseNonEmpty)],
    ["Comment", parseAndFormat(response.comment, parseNonEmpty)],
  ];
}

function parseTimings(entry: Entry, start: number, end: number): KvTuple[] {
  const timings = entry.timings;

  const optionalTiming = (timing?: number) => parseAndFormat(timing, parseNonNegative, formatMilliseconds);
  const total = (typeof start !== "number" || typeof end !== "number") ? undefined : (end - start);

  return [
    ["Total", formatMilliseconds(total)],
    ["Blocked", optionalTiming(timings.blocked)],
    ["DNS", optionalTiming(timings.dns)],
    ["Connect", optionalTiming(timings.connect)],
    ["SSL (TLS)", optionalTiming(timings.ssl)],
    ["Send", formatMilliseconds(timings.send)],
    ["Wait", formatMilliseconds(timings.wait)],
    ["Receive", formatMilliseconds(timings.receive)],
  ];
}

/** Key/Value pair in array `["key", "value"]` */
export type KvTuple = [string, string];

/**
 * Data to show in overlay tabs
 * @param  {number} requestID - request number
 * @param  {WaterfallEntry} entry
 */
export function getKeys(entry: Entry, requestID: number, startRelative: number, endRelative: number) {
  const requestHeaders = entry.request.headers;
  const responseHeaders = entry.response.headers;

  let headerToKvTuple = (header: Header): KvTuple => [header.name, header.value];

  return {
    "general": parseGeneralDetails(entry, startRelative, requestID),
    "request": parseRequestDetails(entry),
    "requestHeaders": requestHeaders.map(headerToKvTuple),
    "response": parseResponseDetails(entry),
    "responseHeaders": responseHeaders.map(headerToKvTuple),
    "timings": parseTimings(entry, startRelative, endRelative),
  };
}
