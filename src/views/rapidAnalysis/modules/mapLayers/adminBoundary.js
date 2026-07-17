/**
 * 行政区边界要素规范化与样式
 */

export function normalizeAdminBoundaryFeatures(res) {
  if (!res) return [];
  if (res.type === "FeatureCollection" && Array.isArray(res.features)) {
    return res.features;
  }
  if (res.type === "Feature") {
    return [res];
  }
  if (res.type && res.coordinates) {
    return [
      {
        type: "Feature",
        properties: {},
        geometry: res
      }
    ];
  }
  return [];
}

/** 省 / 市 / 县 文案 */
export function resolveXzqLevelLabel(code) {
  const region = code ? String(code).trim() : "";
  if (!region || region === "100000") {
    return "";
  }
  if (region.endsWith("0000")) {
    return "省";
  }
  if (region.endsWith("00")) {
    return "市";
  }
  return "县";
}

export function getDefaultAdminOutlineStyle() {
  return {
    lineColor: "#FFA000",
    lineWidth: 5,
    fillColor: "rgba(255,255,255,0)"
  };
}

export function getDefaultHighlightBoundaryStyle() {
  return {
    lineColor: "#FF0000",
    lineWidth: 2,
    fillColor: "rgba(255,255,255,0)"
  };
}

/** 行政区相关 OL 图层 id */
export const ADMIN_BOUNDARY_LAYER_IDS = [
  "xzq",
  "bufferGeoJsonLayers",
  "hightLayer"
];

export default {
  normalizeAdminBoundaryFeatures,
  resolveXzqLevelLabel,
  getDefaultAdminOutlineStyle,
  getDefaultHighlightBoundaryStyle,
  ADMIN_BOUNDARY_LAYER_IDS
};
