/**
 * 短临/实况钻取后切换内涝/山洪：跨模块携带行政区与排行匹配
 */

/**
 * 构建跨模块钻取载荷（县码 + 市级字段）
 * @returns {Object|null}
 */
export function buildCrossModuleFloodDrillPayload(options) {
  const opts = options || {};
  if (
    (opts.targetType !== 3 && opts.targetType !== 4) ||
    !(opts.isByDetailsChart || opts.isSkDetailsChart)
  ) {
    return null;
  }
  const obj = opts.tableDirllObj;
  if (!obj || !(obj.xzqdm || obj.xiandm)) {
    return null;
  }
  const countyCode = String(obj.xiandm || obj.xzqdm);
  return {
    xzqdm: countyCode,
    xiandm: countyCode,
    shiid: obj.shiid,
    shiname: obj.shiname,
    shengname: obj.shengname,
    xianname: obj.xianname,
    name:
      obj.name ||
      obj.shengname ||
      (obj.shiname ? (obj.shengname || "") + obj.shiname : "") ||
      opts.detailsTitleXzqh ||
      ""
  };
}

/** 是否应尝试恢复跨模块钻取 */
export function shouldTryResumeCrossModuleFloodDrill(pending, disasterTypeIndex) {
  return !!(pending && (disasterTypeIndex === 3 || disasterTypeIndex === 4));
}

/** 待恢复的浏览区 pending 载荷 */
export function buildPendingFloodRegionPayload(code, label, extra) {
  if (!code) {
    return null;
  }
  return Object.assign(
    {
      xzqdm: String(code),
      name: label || ""
    },
    extra || {}
  );
}

/**
 * 在积水排行列表中匹配行政区行（精确或前缀）
 */
export function findFloodRankRowForXzqdm(drillXzqdm, list) {
  if (!drillXzqdm || !list || !list.length) {
    return null;
  }
  const d = String(drillXzqdm);
  let hit = null;
  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    if (r && String(r.xzqdm) === d) {
      hit = r;
      break;
    }
  }
  if (hit) {
    return hit;
  }
  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    if (!r || r.xzqdm == null) {
      continue;
    }
    const p = String(r.xzqdm);
    if (d.startsWith(p) || p.startsWith(d)) {
      return r;
    }
  }
  return null;
}

export default {
  buildCrossModuleFloodDrillPayload,
  shouldTryResumeCrossModuleFloodDrill,
  buildPendingFloodRegionPayload,
  findFloodRankRowForXzqdm
};
