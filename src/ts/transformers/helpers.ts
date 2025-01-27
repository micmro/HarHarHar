/** Helpers that are not file-format specific */
import type { Chunk } from "har-format";
import { isInStatusCodeRange, toCssClass } from "../helpers/misc";
import { escapeHtml, sanitizeAlphaNumeric } from "../helpers/parse";
import type { RequestType, SafeKvTuple } from "../typing/waterfall";
import type {
  Icon,
  KvTuple,
  TimingType,
  WaterfallEntry,
  WaterfallEntryTab,
  WaterfallEntryTiming,
  WaterfallResponseDetails,
} from "../typing/waterfall";
import { makeIcon } from "../waterfall/row/svg-indicators";

/** Escapes all HTML except linebreaks `<br/>` */
const escapeHtmlLight = (str: string) => escapeHtml(str).replace("&ltbr/&gt", "<br/>");

/**
 * Converts `dlKeyValues` to the contennd a definition list, without the outer `<dl>` tags
 * @param {SafeKvTuple[]} dlKeyValues array of Key/Value pair
 * @param {boolean} [addClass=false] if `true` the key in `dlKeyValues`
 * is converted to a class name andd added to the `<dt>`
 * @returns {string} stringified HTML definition list
 */
export function makeDefinitionList(dlKeyValues: SafeKvTuple[], addClass: boolean = false) {
  const makeClass = (key: string) => {
    if (!addClass) {
      return "";
    }
    const className = toCssClass(key) || "no-colour";
    return `class="${className}"`;
  };
  return dlKeyValues
    .map((tuple) => `
      <dt ${makeClass(tuple[0])}>${escapeHtmlLight(tuple[0])}</dt>
      <dd>${escapeHtmlLight(tuple[1])}</dd>
    `).join("");
}

/**
 * Convert a MIME type into it's WPT style request type (font, script etc)
 * @param {string} mimeType - a HTTP headers mime-type
 */
export function mimeToRequestType(mimeType: string): RequestType {
  if (mimeType === undefined) {
    return "other";
  }
  const types = mimeType.split("/");
  let part2 = types[1];
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

/** helper to create a `WaterfallEntry` */
export function createWaterfallEntry(url: string,
                                     start: number,
                                     end: number,
                                     segments: WaterfallEntryTiming[] = [],
                                     responseDetails: WaterfallResponseDetails,
                                     tabs: WaterfallEntryTab[]): WaterfallEntry {
  const total = (typeof start !== "number" || typeof end !== "number") ? NaN : (end - start);
  return {
    end,
    responseDetails,
    segments,
    start,
    tabs,
    total,
    url,
  };
}

/** helper to create a `WaterfallEntryTiming` */
export function createWaterfallEntryTiming(type: TimingType,
                                           start: number,
                                           end: number,
                                           chunks?: Chunk[]): WaterfallEntryTiming {
  const total = (typeof start !== "number" || typeof end !== "number") ? NaN : (end - start);
  const typeClean = sanitizeAlphaNumeric(type) as TimingType;
  return {
    end,
    start,
    total,
    type : typeClean,
    chunks,
  };
}

/**
 * Creates the css classes for a row based on it's status code
 * @param  {number} status - HTTP status code
 * @param  {string} renderBlockingStatus - Render blocking status (Chrome only)
 * @param  {boolean} largestContentfulPaintStatus -if largest contentful paint
 * @returns string - concatinated css class names
 */
export function makeRowCssClasses(status: number, renderBlockingStatus: string, largestContentfulPaintStatus: boolean) {
  const classes = ["row-item"];
  if (isInStatusCodeRange(status, 500, 599)) {
    classes.push("status5xx");
  } else if (isInStatusCodeRange(status, 400, 499)) {
    classes.push("status4xx");
  } else if (status !== 304 &&
    isInStatusCodeRange(status, 300, 399)) {
    // 304 == Not Modified, so not an issue
    classes.push("status3xx");
  } else if (status === 0 || status === undefined) {
    // eg connection refused, or connection timeout etc then the http status code defaults to 0
    classes.push("status0");
  }

  if (largestContentfulPaintStatus === true) {
    classes.push("largestContentfulPaint");
  }

  if (renderBlockingStatus === "potentially_blocking") {
    classes.push("potentiallyRenderBlocking");
  } else if (renderBlockingStatus === "blocking" || renderBlockingStatus === "in_body_parser_blocking") {
    classes.push("renderBlocking");
  }

  return classes.join(" ");
}

/**
 * Create icon that fits the response and highlights issues
 *
 * @param  {number} status - HTTP status code
 * @param  {string} statusText - HTTP status text
 * @param  {RequestType} requestType
 * @param  {string=""} redirectURL - pass the URL for `301` or `302`
 * @returns Icon
 */
export function makeMimeTypeIcon(status: number,
                                 statusText: string,
                                 requestType: RequestType,
                                 redirectURL: string = "",
                                 ): Icon {
  // highlight redirects
  if (!!redirectURL) {
    const url = encodeURI(redirectURL.split("?")[0] || "");
    return makeIcon("err3xx", `${status} response status: Redirect to ${escapeHtml(url)}...`);
  } else if (isInStatusCodeRange(status, 400, 499)) {
    return makeIcon("err4xx", `${status} response status: ${escapeHtml(statusText)}`);
  } else if (isInStatusCodeRange(status, 500, 599)) {
    return makeIcon("err5xx", `${status} response status: ${escapeHtml(statusText)}`);
  } else if (status === 204) {
    return makeIcon("plain", "No content");
  } else {
    return makeIcon(sanitizeAlphaNumeric(requestType), escapeHtml(requestType));
  }
}

/**
 * Flattens out a second level of `KvTuple` nesting (and removed empty and `undefined` entries)
 *
 * @param nestedKvPairs - nested `KvTuple`s (possibly sub-nested)
 */
export const flattenKvTuple = (nestedKvPairs: (KvTuple | KvTuple[])[]): KvTuple[] => {
  const returnKv: KvTuple[] = [];
  nestedKvPairs.forEach((maybeKv) => {
    if (maybeKv === undefined || maybeKv.length === 0) {
      return;
    }
    if (Array.isArray(maybeKv[0])) {
      returnKv.push(...(maybeKv as KvTuple[]));
      return;
    }
    returnKv.push(maybeKv as KvTuple);
  });
  return returnKv;
};
