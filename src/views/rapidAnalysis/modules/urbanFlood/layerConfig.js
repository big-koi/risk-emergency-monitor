/**
 * 城市内涝 / 山洪：图层配置与四至查询参数
 */
import { resolveFloodTimelineDataType } from "../mapLayers/timelineStrategy";

/** 1=城市内涝 2=山洪 */
export function resolveFloodModelType(disasterTypeIndex) {
  if (disasterTypeIndex === 3) return "1";
  if (disasterTypeIndex === 4) return "2";
  return "";
}

/** 是否过去三小时（积水深度逐帧） */
export function resolveFloodIsPast(options) {
  const opts = options || {};
  return (
    (opts.disasterTypeIndex === 3 && Number(opts.csnlValue) === 2) ||
    (opts.disasterTypeIndex === 4 && Number(opts.shValue) === 2)
  );
}

/** 全国浏览是否未来时段（极值图） */
export function resolveFloodIsFutureBrowse(options) {
  const opts = options || {};
  return (
    (opts.disasterTypeIndex === 3 && Number(opts.csnlValue) === 1) ||
    (opts.disasterTypeIndex === 4 && Number(opts.shValue) === 1)
  );
}

/**
 * 解析单文件图层配置（不含 apiMethod，由页面注入）
 * @returns {{ isPast: boolean, timeType: string, xzqdm: string }}
 */
export function resolveFloodLayerConfig(options) {
  const opts = options || {};
  const filename = opts.filename || "";
  const obj = opts.obj;
  const isPast = resolveFloodIsPast(opts);

  let timeType = resolveFloodTimelineDataType(opts.timeTabActive);
  if (obj && obj.submergedExtreme) {
    timeType = obj.isFuture ? "DL" : "SK";
  }

  let xzqdm = "";
  if (!opts.isMapType) {
    xzqdm = String(filename).split("_")[0];
  }

  const finalXzqdm = opts.isJsDetailsChart
    ? opts.drillXzqdm || ""
    : opts.disasterTypeIndex === 3 && Number(opts.csnlValue) === 2
      ? xzqdm || ""
      : xzqdm;

  return {
    isPast: isPast,
    timeType: timeType,
    xzqdm: finalXzqdm
  };
}

/** 四至查询参数 */
export function buildFloodExtentQueryParams(options) {
  const opts = options || {};
  const params = {
    taskTime: opts.taskTime,
    type: opts.timeType,
    xzqdm: opts.xzqdm || ""
  };
  const modelType = resolveFloodModelType(opts.disasterTypeIndex);
  if (modelType) {
    params.modelType = modelType;
  }
  return params;
}

/** 极值图文件列表查询参数 */
export function buildSubmergedListQueryParams(options) {
  const opts = options || {};
  const params = {
    modelType: resolveFloodModelType(opts.disasterTypeIndex),
    taskTime: opts.taskTime
  };
  if (opts.isFuture) {
    params.type = "DL";
  }
  return params;
}

/** 按行政区码过滤淹没城市 png 列表 */
export function filterSubmergedFilenames(list, xzqdm) {
  if (!list || !list.length) {
    return [];
  }
  if (!xzqdm) {
    return list;
  }
  const region = String(xzqdm).trim();
  return list.filter(function(name) {
    const code = String(name).split("_")[0];
    if (region.endsWith("0000")) {
      return code.startsWith(region.slice(0, 2));
    }
    if (region.endsWith("00") && region.length === 6) {
      return code === region || code.startsWith(region.slice(0, 4));
    }
    return code === region;
  });
}

/** 极值图请求是否已过期 */
export function isFloodSubmergedRequestStale(obj, currentRequestId) {
  return (
    !!obj &&
    !!obj.submergedExtreme &&
    obj.submergedRequestId !== undefined &&
    obj.submergedRequestId !== currentRequestId
  );
}

export default {
  resolveFloodModelType,
  resolveFloodIsPast,
  resolveFloodIsFutureBrowse,
  resolveFloodLayerConfig,
  buildFloodExtentQueryParams,
  buildSubmergedListQueryParams,
  filterSubmergedFilenames,
  isFloodSubmergedRequestStale
};
