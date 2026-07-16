/**
 * 短临预报领域：查询参数构建
 * 逐步把页面内散落逻辑迁入此模块
 */

/**
 * 构建短临降水排行请求参数
 * @param {object} options
 * @param {string} options.queryCode Store.queryCode
 * @param {string} options.taskTime
 * @param {string} options.orderType
 */
export function buildShortTermRankParams(options) {
  const opts = options || {};
  const params = {
    orderType: opts.orderType || "sumjyDesc",
    taskTime: opts.taskTime
  };
  if (opts.queryCode) {
    params.xzqdm = opts.queryCode;
  }
  return params;
}

/**
 * 构建短临/实况预警查询参数
 */
export function buildRainfallWarningParams(options) {
  const opts = options || {};
  const params = {
    taskTime: opts.taskTime
  };
  if (opts.code) {
    params.code = opts.code;
  }
  return params;
}

export default {
  buildShortTermRankParams,
  buildRainfallWarningParams
};
