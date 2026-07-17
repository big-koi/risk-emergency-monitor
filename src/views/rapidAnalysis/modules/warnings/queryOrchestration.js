/**
 * 预警信息查询编排（短临/实况/内涝/山洪共用）
 */
import { getWarningQueryCode } from "./warningInfoHelper";
import { promoteToFloodQueryCode } from "../../regionContext";
import { buildRainfallWarningParams } from "../shortTermForecast/queryParams";

/** 是否拉取短临/实况预警 */
export function shouldFetchRainfallWarning(disasterTypeIndex) {
  return disasterTypeIndex === 1 || disasterTypeIndex === 2;
}

export function shouldFetchCsnlWarning(disasterTypeIndex) {
  return disasterTypeIndex === 3;
}

export function shouldFetchShWarning(disasterTypeIndex) {
  return disasterTypeIndex === 4;
}

export function isWarningRequestStale(requestId, currentId) {
  return requestId !== currentId;
}

/**
 * 解析当前预警查询行政区码（含 Store / 钻取 / 内涝上溯）
 */
export function resolveActiveWarningQueryCode(options) {
  const opts = options || {};
  let code = getWarningQueryCode({
    positionXzqCode: opts.warningCode || opts.positionXzqCode,
    tableDirllObj: opts.tableDirllObj,
    isByDetailsChart: opts.isByDetailsChart,
    isSkDetailsChart: opts.isSkDetailsChart,
    isJsDetailsChart: opts.isJsDetailsChart
  });

  if (
    (opts.disasterTypeIndex === 3 || opts.disasterTypeIndex === 4) &&
    !opts.isJsDetailsChart &&
    code
  ) {
    code = promoteToFloodQueryCode(code) || code;
  }

  if (
    (opts.disasterTypeIndex === 1 || opts.disasterTypeIndex === 2) &&
    !opts.isByDetailsChart &&
    !opts.isSkDetailsChart
  ) {
    if (opts.storeQuery) {
      code = opts.storeQuery;
    }
  }

  if (opts.disasterTypeIndex === 3 || opts.disasterTypeIndex === 4) {
    if (opts.isJsDetailsChart) {
      code = opts.storeWarning || opts.storeQuery || code;
    } else if (opts.storeQuery) {
      code = opts.storeQuery;
    }
  }

  return code || "";
}

/**
 * 组装预警接口查询包
 * @returns {{ code: string, regionLabel: string, params: Object }}
 */
export function buildWarningQueryBundle(options) {
  const opts = options || {};
  const code = resolveActiveWarningQueryCode(opts);
  const regionLabel = opts.regionLabel || "全国";
  return {
    code: code,
    regionLabel: regionLabel,
    params: buildRainfallWarningParams({
      taskTime: opts.taskTime,
      code: code
    })
  };
}

/** 构建 build*WarningInfo 共用 options */
export function buildWarningDisplayOpts(regionLabel, taskTime, regionParts) {
  const parts = regionParts || {};
  return {
    regionLabel: regionLabel,
    taskTime: taskTime,
    provinceName: parts.provinceName || "",
    cityName: parts.cityName || "",
    countyName: parts.countyName || ""
  };
}

/**
 * 解析预警接口响应
 * opts: { code, regionLabel, buildOpts, emptyOpts, buildInfo, getEmpty }
 */
export function resolveWarningApiPayload(res, options) {
  const opts = options || {};
  const buildOpts = opts.buildOpts || {};
  const emptyOpts = opts.emptyOpts || {
    regionLabel: opts.regionLabel,
    taskTime: buildOpts.taskTime
  };
  if (res && res.code === 200 && res.data) {
    return {
      ok: true,
      rawData: res.data,
      info: opts.buildInfo
        ? opts.buildInfo(res.data, opts.code, buildOpts)
        : null
    };
  }
  return {
    ok: false,
    rawData: null,
    info: opts.getEmpty
      ? opts.getEmpty(opts.regionLabel, opts.code, emptyOpts)
      : null
  };
}

export default {
  shouldFetchRainfallWarning,
  shouldFetchCsnlWarning,
  shouldFetchShWarning,
  isWarningRequestStale,
  resolveActiveWarningQueryCode,
  buildWarningQueryBundle,
  buildWarningDisplayOpts,
  resolveWarningApiPayload
};
