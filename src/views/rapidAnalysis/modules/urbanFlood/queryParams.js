/**
 * 城市内涝 / 山洪共用：排行查询参数
 */

export function buildFloodRankParams(options) {
  const opts = options || {};
  const params = Object.assign(
    {
      taskTime: opts.taskTime
    },
    opts.base || {}
  );
  if (opts.xzqdm) {
    params.xzqdm = opts.xzqdm;
  }
  return params;
}

export function adaptFloodRankItem(item) {
  if (!item) return null;
  const sheng = item.shengname || "";
  const shi = item.shiname || "";
  const nameJoined =
    sheng && shi ? `${sheng}-${shi}` : sheng || shi || item.xzqmc || item.name || "";
  return Object.assign({}, item, {
    name: nameJoined,
    sum:
      item.maxjssd != null
        ? item.maxjssd
        : item.sum != null
          ? item.sum
          : item.maxdepth || item.jssd,
    datatime: item.datatime || item.maxTime || item.max_time || "",
    xzqdm: item.xzqdm || item.xiandm
  });
}

export default {
  buildFloodRankParams,
  adaptFloodRankItem
};
