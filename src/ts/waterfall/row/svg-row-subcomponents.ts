/**
 * Creation of sub-components used in a resource request row
 */

import { getParentByClassName } from "../../helpers/dom";
import * as misc from "../../helpers/misc";
import * as svg from "../../helpers/svg";
import { timingTypeToCssClass } from "../../transformers/styling-converters";
import { RectData } from "../../typing/rect-data";
import { WaterfallEntry, WaterfallEntryTiming } from "../../typing/waterfall";
import {
  onHoverInShowTooltip,
  onHoverOutShowTooltip,
} from "./svg-tooltip";

/**
 * Creates the `rect` that represent the timings in `rectData`
 * @param  {RectData} rectData - Data for block
 * @param  {string} className - className for block `rect`
 */
function makeBlock(rectData: RectData, className: string) {
  const holder = svg.newG("");
  const blockHeight = rectData.height - 1;
  const rectX = misc.roundNumber(rectData.x / rectData.unit) + "%";
  const rect = svg.newRect({
    height: blockHeight,
    width: misc.roundNumber(rectData.width / rectData.unit) + "%",
    x: rectX,
    y: rectData.y,
  }, className);
  holder.appendChild(rect);
  if (rectData.label) {
    let showDelayTimeOut: number | null;
    let foreignElLazy: SVGForeignObjectElement | null;
    rect.addEventListener("mouseenter", () => {
      if (!foreignElLazy) {
        foreignElLazy = (getParentByClassName(rect, "water-fall-chart") as Element)
          .querySelector(".tooltip") as SVGForeignObjectElement;
      }
      showDelayTimeOut = setTimeout(() => {
        showDelayTimeOut = null;
        onHoverInShowTooltip(rect, rectData, foreignElLazy as SVGForeignObjectElement);
      }, 100);
    });
    rect.addEventListener("mouseleave", () => {
      if (showDelayTimeOut) {
        clearTimeout(showDelayTimeOut);
      } else {
        onHoverOutShowTooltip(rect);
      }
    });
  }
  if (rectData.showOverlay && rectData.hideOverlay) {
    rect.addEventListener("mouseenter", rectData.showOverlay(rectData));
    rect.addEventListener("mouseleave", rectData.hideOverlay(rectData));
  }
  return holder;
}

function makeChunkBlock(chunkData, rectData: RectData, className: string) {
  const holder = svg.newG("");
  const blockHeight = rectData.height - 1;
  // TODO: Once we have a way to pass the available bandwidth we can calculate the length for each chunk.
  // const blockWidth = chunkData.ts - (chunkData.bytes / (5000000 / 8.0));
  const rectX = misc.roundNumber(chunkData.ts / rectData.unit) + "%";
  const rect = svg.newRect({
    height: blockHeight,
    width: "1px", // misc.roundNumber(blockWidth / rectData.unit) + "%",
    x: rectX,
    y: rectData.y,
  },
  className,
  {
    pointerEvents: "none"
  });
  holder.appendChild(rect);
  return holder;
}

/**
 * Converts a segment to RectData
 * @param  {WaterfallEntryTiming} segment
 * @param  {RectData} rectData
 * @returns RectData
 */
function segmentToRectData(segment: WaterfallEntryTiming, rectData: RectData): RectData {
  const total = (!isNaN(segment.total)) ? `<br/>total: ${Math.round(segment.total)}ms` : "";
  return {
    cssClass: timingTypeToCssClass(segment.type),
    height: (rectData.height - 6),
    hideOverlay: rectData.hideOverlay,
    label: `<strong>${segment.type}</strong><br/>` +
    `${Math.round(segment.start)}ms - ${Math.round(segment.end)}ms${total}`,
    showOverlay: rectData.showOverlay,
    unit: rectData.unit,
    width: segment.total,
    x: segment.start || 0.001,
    y: rectData.y,
  } as RectData;
}

/**
 * @param  {RectData} rectData
 * @param  {number} timeTotal
 * @param  {number} firstX
 * @returns SVGTextElement
 */
function createTimingLabel(rectData: RectData, timeTotal: number, firstX: number): SVGTextElement {
  const minWidth = 500; // minimum supported diagram width that should show the timing label uncropped
  const spacingPerc = (5 / minWidth * 100);
  const y = rectData.y + rectData.height / 1.5;
  const totalLabel = `${Math.round(timeTotal)} ms`;

  let percStart = (rectData.x + rectData.width) / rectData.unit + spacingPerc;
  let txtEl = svg.newTextEl(totalLabel, { x: `${misc.roundNumber(percStart)}%`, y });

  // (pessimistic) estimation of text with to avoid performance penalty of `getBBox`
  const roughTxtWidth = totalLabel.length * 8;

  if (percStart + (roughTxtWidth / minWidth * 100) > 100) {
    percStart = firstX / rectData.unit - spacingPerc;
    txtEl = svg.newTextEl(totalLabel, { x: `${misc.roundNumber(percStart)}%`, y }, { textAnchor: "end" });
  }

  return txtEl;
}

function createPushIndicator(rectData: RectData): SVGElement {
  const y = rectData.y + rectData.height / 1.5;
  const x = `${misc.roundNumber(rectData.x / rectData.unit)}%`;
  const el = svg.newG("http2-inidicator-holder");
  el.appendChild(svg.newTextEl("→", {
      transform: `translate(-5)`,
      x,
      y,
    }, {
      "fillOpacity": "0.6",
      "text-anchor": "end",
    }));
  el.appendChild(svg.newTitle("http2 Push"));

  return el;
}

/**
 * Render the block and timings for a request
 * @param  {RectData}         rectData Basic dependencys and globals
 * @param  {WaterfallEntry}   entry Request Details, e.g. Request and Timing Data
 * @return {SVGElement}       Renerated SVG (rect or g element)
 */
export function createRect(rectData: RectData, entry: WaterfallEntry): SVGElement {
  const segments = entry.segments;
  const rect = makeBlock(rectData, `time-block ${rectData.cssClass}`);
  const rectHolder = svg.newG("rect-holder");
  let firstX = rectData.x;

  rectHolder.appendChild(rect);

  if (segments && segments.length > 0) {
    segments.forEach((segment) => {
      if (!isNaN(segment.total) && segment.total > 0 && typeof segment.start === "number") {
        const childRectData = segmentToRectData(segment, rectData);
        const childRect = makeBlock(childRectData, `segment ${childRectData.cssClass}`);
        firstX = Math.min(firstX, childRectData.x);

        if (segment.type === 'receive' && segment.chunks && segment.chunks.length > 0) {
          segment.chunks.forEach((chunk) => {
            const chunkRect = makeChunkBlock(chunk, childRectData, `${childRectData.cssClass}-chunk`);
            childRect.appendChild(chunkRect);
          });
        }

        rectHolder.appendChild(childRect);
      }
    });

    if (misc.find(entry.responseDetails.indicators, (indicator) => indicator.id === "push")) {
      rectHolder.appendChild(createPushIndicator(rectData));
    }
    rectHolder.appendChild(createTimingLabel(rectData, entry.total, firstX));
  }

  return rectHolder;
}

/**
 * Create a SVG text element for the request number label, right aligned within the specified width.
 * @param {number} x horizontal position (in px).
 * @param {number} y vertical position of related request block (in px).
 * @param {string} requestNumber the request number string
 * @param {number} height height of row
 * @param {number} width width of the space within the right align the label.
 * @returns {SVGTextElement}
 */
export function createRequestNumberLabel(x: number, y: number, requestNumber: string, height: number, width: number) {
  y += Math.round(height / 2) + 5;
  x += width;
  return svg.newTextEl(requestNumber, { x, y }, { "text-anchor": "end" });
}

/**
 * Create a new clipper SVG Text element to label a request block to fit the left panel width
 * @param  {number}         x                horizontal position (in px)
 * @param  {number}         y                vertical position of related request block (in px)
 * @param  {string}         name             URL
 * @param  {number}         height           height of row
 * @return {SVGTextElement}                  label SVG element
 */
export function createRequestLabelClipped(x: number, y: number, name: string, height: number) {

  const blockLabel = createRequestLabel(x, y, name, height);
  blockLabel.style.clipPath = `url(#titleClipPath)`;
  return blockLabel;
}

/**
 * Create a new full width SVG Text element to label a request block
 * @param  {number}         x                horizontal position (in px)
 * @param  {number}         y                vertical position of related request block (in px)
 * @param  {string}         name             URL
 * @param  {number}         height           height of row
 */
export function createRequestLabelFull(x: number, y: number, name: string, height: number) {
  const blockLabel = createRequestLabel(x, y, name, height);
  const labelHolder = svg.newG("full-label", {}, {
    clipPath: `url(#titleFullClipPath)`,
  });
  labelHolder.appendChild(svg.newRect({
    height: height - 4,
    rx: 5,
    ry: 5,
    // for initial load performance use 500px as base width
    // it's updated one by one on hover
    width: 500,
    x: x - 3,
    y: y + 3,
  }, "label-full-bg"));
  labelHolder.appendChild(blockLabel);
  return labelHolder;
}

// private helper
function createRequestLabel(x: number, y: number, name: string, height: number): SVGTextElement {
  const blockName = misc.resourceUrlFormatter(name, 125);
  y = y + Math.round(height / 2) + 5;
  const blockLabel = svg.newTextEl(blockName, { x, y });

  blockLabel.appendChild(svg.newTitle(name));
  blockLabel.style.opacity = name.match(/js.map$/) ? "0.5" : "1";

  return blockLabel;
}

const supportsAnimationFrame = (typeof window.requestAnimationFrame === "function" &&
  typeof window.cancelAnimationFrame === "function");

/**
 * Appends the labels to `rowFixed` - TODO: see if this can be done more elegant
 * @param {SVGGElement}    rowFixed   [description]
 * @param {SVGTextElement} requestNumberLabel a label placed in front of every shortLabel
 * @param {SVGTextElement} shortLabel [description]
 * @param {SVGGElement}    fullLabel  [description]
 */
export function appendRequestLabels(rowFixed: SVGGElement, requestNumberLabel: SVGTextElement,
                                    shortLabel: SVGTextElement, fullLabel: SVGGElement) {
  const labelFullBg = fullLabel.getElementsByTagName("rect")[0] as SVGRectElement;
  const fullLabelText = fullLabel.getElementsByTagName("text")[0] as SVGTextElement;

  // use display: none to not render it and visibility to remove it from search results (crt+f in chrome at least)
  fullLabel.style.display = "none";
  fullLabel.style.visibility = "hidden";
  rowFixed.appendChild(requestNumberLabel);
  rowFixed.appendChild(shortLabel);
  rowFixed.appendChild(fullLabel);
  /** the size adjustment only needs to happend once, this var keeps track of that */
  let isAdjusted = false;
  /** store AnimationFrame id, to cancel it if hovering was too fast */
  let updateAnimFrame: number | undefined;
  rowFixed.addEventListener("mouseenter", () => {
    fullLabel.style.display = "block";
    shortLabel.style.display = "none";
    fullLabel.style.visibility = "visible";

    // offload doublecheck of width
    const update = () => {
      const newWidth = fullLabelText.getComputedTextLength() + 10;
      labelFullBg.setAttribute("width", newWidth.toString());
      isAdjusted = true;
      updateAnimFrame = undefined;
    };

    if (!isAdjusted) {
      if (supportsAnimationFrame) {
        updateAnimFrame = window.requestAnimationFrame(update);
      } else {
        update();
      }
    }
  });
  rowFixed.addEventListener("mouseleave", () => {
    shortLabel.style.display = "block";
    fullLabel.style.display = "none";
    fullLabel.style.visibility = "hidden";
    if (supportsAnimationFrame && updateAnimFrame !== undefined) {
      cancelAnimationFrame(updateAnimFrame);
    }
  });
}

/**
 * Stripe for BG
 * @param  {number}      y              [description]
 * @param  {number}      height         [description]
 * @param  {boolean}     isEven         [description]
 * @return {SVGRectElement}                [description]
 */
export function createBgStripe(y: number, height: number, isEven: boolean): SVGRectElement {
  const className = isEven ? "even" : "odd";
  return svg.newRect({
    height,
    width: "100%", // make up for the spacing
    x: 0,
    y,
  }, className);
}

export function createNameRowBg(y: number, rowHeight: number): SVGGElement {
  const rowFixed = svg.newG("row row-fixed");

  rowFixed.appendChild(svg.newRect({
    height: rowHeight,
    width: "100%",
    x: "0",
    y,
  }, "",
    {
      opacity: 0,
    }));

  return rowFixed;
}

export function createRowBg(y: number, rowHeight: number): SVGGElement {
  const rowFixed = svg.newG("row row-flex");

  rowFixed.appendChild(svg.newRect({
    height: rowHeight,
    width: "100%",
    x: "0",
    y,
  }, "",
    {
      opacity: 0,
    }));

  return rowFixed;
}
