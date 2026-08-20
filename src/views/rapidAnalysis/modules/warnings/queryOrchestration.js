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

/**
 * 按灾种解析应拉取的预警类型
 * @returns {'rainfall'|'csnl'|'sh'|null}
 */
export function resolveModuleWarningFetchKind(disasterTypeIndex) {
  if (disasterTypeIndex === 1 || disasterTypeIndex === 2) {
    return "rainfall";
  }
  if (disasterTypeIndex === 3) {
    return "csnl";
  }
  if (disasterTypeIndex === 4) {
    return "sh";
  }
  return null;
}

/**
 * 预警请求启动计划（初始空态 / 是否跳过接口）
 * emptyOptsMode: 'simple' | 'buildOpts'（山洪与原逻辑一致用 buildOpts）
 */
export function planWarningInfoFetchStart(options) {
  const opts = options || {};
  const bundle = opts.bundle || {};
  const code = bundle.code;
  const regionLabel = bundle.regionLabel;
  const params = bundle.params;
  const taskTime = opts.taskTime;
  const buildOpts = buildWarningDisplayOpts(
    regionLabel,
    taskTime,
    opts.regionParts
  );
  const emptyOpts =
    opts.emptyOptsMode === "buildOpts"
      ? buildOpts
      : { regionLabel: regionLabel, taskTime: taskTime };

  return {
    code: code,
    regionLabel: regionLabel,
    params: params,
    buildOpts: buildOpts,
    emptyOpts: emptyOpts,
    initialInfo: opts.getEmpty
      ? opts.getEmpty(regionLabel, code, emptyOpts)
      : null,
    skipFetch: !taskTime
  };
}

/** 接口成功/业务失败后的 payload（复用 resolveWarningApiPayload） */
export function planWarningInfoFetchSuccess(res, startPlan, adapters) {
  const start = startPlan || {};
  const ad = adapters || {};
  return resolveWarningApiPayload(res, {
    code: start.code,
    regionLabel: start.regionLabel,
    buildOpts: start.buildOpts,
    emptyOpts: start.emptyOpts,
    buildInfo: ad.buildInfo,
    getEmpty: ad.getEmpty
  });
}

/** 网络失败时的空态 */
export function planWarningInfoFetchCatch(startPlan, getEmpty) {
  const start = startPlan || {};
  return {
    rawData: null,
    info:
      typeof getEmpty === "function"
        ? getEmpty(start.regionLabel, start.code, start.emptyOpts)
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
  resolveWarningApiPayload,
  resolveModuleWarningFetchKind,
  planWarningInfoFetchStart,
  planWarningInfoFetchSuccess,
  planWarningInfoFetchCatch
};
