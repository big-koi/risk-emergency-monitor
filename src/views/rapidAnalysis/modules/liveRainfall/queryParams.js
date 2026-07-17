/**
 * 实况降雨领域：查询参数与列表适配
 */

/** 全国实况降雨 PNG 默认四至 */
export const LIVE_PNG_IMAGE_EXTENT = [69.995, -0.005, 140.005, 60.005];

export const LIVE_RAIN_LAYER_NAME = "实况降雨图层";

/** 实况排行钻取详情参数 */
export function buildLiveDrillParams(options) {
  const opts = options || {};
  return {
    skTime: opts.taskTime,
    skType: opts.liveRainType || "6",
    xzqdm: opts.xzqdm || ""
  };
}

export function buildLiveRainRankParams(options) {
  const opts = options || {};
  const skTime =
    opts.liveRainType === "ohter" && opts.liveDate && opts.liveDate.length >= 2
      ? `${opts.liveDate[0]}至${opts.liveDate[1]}`
      : opts.taskTime;
  const params = {
    skTime,
    skType: opts.liveRainType || "6",
    orderType: opts.orderType || "sumjslDesc"
  };
  if (opts.queryCode) {
    params.xzqdm = opts.queryCode;
  }
  return params;
}

export function buildLivePngParams(options) {
  const opts = options || {};
  return {
    skTime:
      opts.liveRainType === "ohter" && opts.liveDate && opts.liveDate.length >= 2
        ? `${opts.liveDate[0]}至${opts.liveDate[1]}`
        : opts.taskTime,
    skType: opts.liveRainType || "6"
  };
}

/** 接口行 → 排行列表项 */
export function adaptLiveRainRankItem(item) {
  if (!item) return null;
  return Object.assign({}, item, {
    name: `${item.xianname}-${item.shiname}-${item.shengname}`,
    maxjsl: item.maxjsl,
    sum: item.sumjsl,
    xzqdm: item.xiandm || item.xzqdm,
    xiandm: item.xiandm,
    x: item.lon,
    y: item.lat
  });
}

export default {
  LIVE_PNG_IMAGE_EXTENT,
  LIVE_RAIN_LAYER_NAME,
  buildLiveDrillParams,
  buildLiveRainRankParams,
  buildLivePngParams,
  adaptLiveRainRankItem
};
