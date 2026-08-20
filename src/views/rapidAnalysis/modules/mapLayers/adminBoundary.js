/**
 * 行政区边界要素规范化、样式与加载编排（纯函数）
 */
import { getRainfallDrillCode } from "../../regionContext";

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

export const ADMIN_OUTLINE_LAYER_ID = "xzq";
export const ADMIN_HIGHLIGHT_LAYER_ID = "hightLayer";

/** 工具栏/排行定位用行政区码 */
export function resolveSearchXzqfwCode(item) {
  if (!item) return "";
  return getRainfallDrillCode(item) || item.xzqdm || "";
}

/**
 * 工具栏 upladeLine 计划
 * @returns {{ action: 'clearNational'|'noop'|'addOutline', features?, style?, facadeOptions?, fitOptions? }}
 */
export function planUpladeLine(res, options) {
  const opts = options || {};
  if (!res) {
    return { action: "clearNational" };
  }
  if (opts.isMapType || !opts.hasMap) {
    return { action: "noop" };
  }
  const features = normalizeAdminBoundaryFeatures(res);
  if (!features.length) {
    return { action: "noop" };
  }
  const style = getDefaultAdminOutlineStyle();
  return {
    action: "addOutline",
    features: features,
    style: style,
    facadeOptions: {
      style: style,
      layerId: ADMIN_OUTLINE_LAYER_ID,
      dataProjection: "EPSG:4490",
      featureProjection: "EPSG:4490"
    },
    fitOptions: {
      padding: [50, 50, 50, 50],
      duration: 1000
    }
  };
}

/**
 * 将 searchXzqfw / 静态 json 数据规整为 zoomToFeatures 载荷
 * @returns {{ features: Array, options: object }|null}
 */
export function buildLegacyHighlightZoomPayload(data, style, zoom) {
  if (!data) return null;
  const zoomOpts = {
    setLayer: ADMIN_HIGHLIGHT_LAYER_ID,
    style: style,
    zoom: zoom !== false
  };

  if (data.feature) {
    let geometry = null;
    try {
      geometry = JSON.parse(data.feature);
    } catch (e) {
      geometry = null;
    }
    if (!geometry) return null;
    return {
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: geometry
        }
      ],
      options: zoomOpts
    };
  }
  if (data.type === "Feature") {
    return { features: [data], options: zoomOpts };
  }
  if (data.type === "FeatureCollection" && data.features) {
    return { features: data.features, options: zoomOpts };
  }
  if (data.type && data.coordinates) {
    return {
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: data
        }
      ],
      options: zoomOpts
    };
  }
  return null;
}

/**
 * 搜索定位高亮边界计划（原 _applySearchXzqfwBoundary）
 * @returns {{ action: 'fail'|'threePolyline'|'highlight', data?, style?, zoom?, facadeOptions?, legacyPayload? }}
 */
export function planApplySearchXzqfwBoundary(data, options) {
  if (!data) {
    return { action: "fail" };
  }
  const opts = options || {};
  const style = Object.assign(
    {},
    getDefaultHighlightBoundaryStyle(),
    opts.style || {}
  );
  const zoom = opts.zoom !== false;

  if (opts.isMapType) {
    if (
      (opts.disasterTypeIndex == 3 || opts.disasterTypeIndex == 4) &&
      opts.hasThreeMap
    ) {
      return { action: "threePolyline", data: data, style: style };
    }
    return { action: "fail" };
  }

  const legacyPayload = buildLegacyHighlightZoomPayload(data, style, zoom);
  return {
    action: "highlight",
    data: data,
    style: style,
    zoom: zoom,
    facadeOptions: { style: style, zoom: zoom },
    legacyPayload: legacyPayload
  };
}

/**
 * searchXzqfw 接口响应：应用或走 fallback
 */
export function planSearchXzqfwApiResult(res) {
  if (res && res.code === 200 && res.data) {
    return { action: "apply", data: res.data };
  }
  return { action: "fallback" };
}

/**
 * getFwByXzqCode fallback 前校验
 * @returns {{ action: 'fail'|'fetchFw', xzqdm?: string, xzqlevel?: string }}
 */
export function planRegionBoundaryFallback(xzqdm) {
  const code = xzqdm ? String(xzqdm).trim() : "";
  if (!code) {
    return { action: "fail" };
  }
  const xzqlevel = resolveXzqLevelLabel(code);
  if (!xzqlevel) {
    return { action: "fail" };
  }
  return { action: "fetchFw", xzqdm: code, xzqlevel: xzqlevel };
}

/** 静态行政区 GeoJSON URL */
export function buildAdAreaStaticUrl(webServer, code) {
  const base = webServer || "";
  return base + "static/adArea/" + code + ".json";
}

export default {
  normalizeAdminBoundaryFeatures,
  resolveXzqLevelLabel,
  getDefaultAdminOutlineStyle,
  getDefaultHighlightBoundaryStyle,
  ADMIN_BOUNDARY_LAYER_IDS,
  ADMIN_OUTLINE_LAYER_ID,
  ADMIN_HIGHLIGHT_LAYER_ID,
  resolveSearchXzqfwCode,
  planUpladeLine,
  buildLegacyHighlightZoomPayload,
  planApplySearchXzqfwBoundary,
  planSearchXzqfwApiResult,
  planRegionBoundaryFallback,
  buildAdAreaStaticUrl
};
