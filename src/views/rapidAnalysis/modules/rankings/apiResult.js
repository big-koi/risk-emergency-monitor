/**
 * 排行 / 预警城市接口结果解析（与具体 API 解耦）
 */

/** 通用：code===200 时用 adaptItem 映射列表 */
export function mapRankResponseList(res, adaptItem) {
  if (!res || res.code !== 200 || !res.data) {
    return [];
  }
  const list = [];
  const raw = Array.isArray(res.data) ? res.data : [];
  const adapt =
    typeof adaptItem === "function"
      ? adaptItem
      : function(item) {
          return item;
        };
  raw.forEach(function(item) {
    const adapted = adapt(item);
    if (adapted) {
      list.push(adapted);
    }
  });
  return list;
}

/**
 * 内涝/山洪积水排行加载结果
 * @returns {'ok'|'empty'|'noop'}
 */
export function resolveFloodRankLoadStatus(res, hasActiveRegion) {
  if (res && res.code === 200 && res.data) {
    return "ok";
  }
  if (hasActiveRegion) {
    return "empty";
  }
  return "noop";
}

/**
 * 预警城市统计块
 * @returns {{ count, change, list }|null}
 */
export function resolveWarningCityStats(res) {
  if (!res || res.code !== 200 || !res.data) {
    return null;
  }
  return {
    count: res.data.count,
    change: res.data.change,
    list: res.data.list
  };
}

export default {
  mapRankResponseList,
  resolveFloodRankLoadStatus,
  resolveWarningCityStats
};
