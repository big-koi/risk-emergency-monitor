/**
 * 短临降水排行：列表项适配
 */

export function adaptShortTermRankItem(item) {
  if (!item) return null;
  return Object.assign({}, item, {
    name: `${item.xianname}-${item.shiname}-${item.shengname}`,
    max: item.maxjy,
    maxgw: item.maxgwjy,
    sum: item.sumjy,
    xzqdm: item.xiandm || item.xzqdm,
    xiandm: item.xiandm,
    dateTime: item.pgtime
  });
}

export function adaptShortTermRankList(rawList) {
  const list = [];
  (rawList || []).forEach(function(item) {
    const adapted = adaptShortTermRankItem(item);
    if (adapted) {
      list.push(adapted);
    }
  });
  return list;
}

export default {
  adaptShortTermRankItem,
  adaptShortTermRankList
};
