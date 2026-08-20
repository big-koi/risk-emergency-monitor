/**
 * 内涝/山洪淹没城市（极值图）加载编排
 */
import {
  resolveFloodIsFutureBrowse,
  buildSubmergedListQueryParams,
  filterSubmergedFilenames
} from "./layerConfig";

/** 防抖毫秒（与原 loadFloodSubmergedCities 一致） */
export const FLOOD_SUBMERGED_LOAD_DEBOUNCE_MS = 80;

/**
 * 是否调度淹没城市加载
 * @returns {{ action: 'noop'|'markNoData'|'schedule', debounceMs?: number }}
 */
export function planFloodSubmergedCitiesLoad(options) {
  const opts = options || {};
  if (opts.disasterTypeIndex !== 3 && opts.disasterTypeIndex !== 4) {
    return { action: "noop" };
  }
  if (opts.isJsDetailsChart || opts.isMapType) {
    return { action: "noop" };
  }
  if (!opts.taskSelectedTime) {
    return { action: "markNoData" };
  }
  return {
    action: "schedule",
    debounceMs: FLOOD_SUBMERGED_LOAD_DEBOUNCE_MS
  };
}

/**
 * 发起极值图列表请求前的参数与接口类型
 * @returns {{ isFuture: boolean, params: object, apiKind: 'future'|'past' }}
 */
export function planFloodSubmergedFetchStart(options) {
  const opts = options || {};
  const isFuture = resolveFloodIsFutureBrowse({
    disasterTypeIndex: opts.disasterTypeIndex,
    csnlValue: opts.csnlValue,
    shValue: opts.shValue
  });
  return {
    isFuture: isFuture,
    params: buildSubmergedListQueryParams({
      disasterTypeIndex: opts.disasterTypeIndex,
      taskTime: opts.taskSelectedTime,
      isFuture: isFuture
    }),
    apiKind: isFuture ? "future" : "past"
  };
}

/**
 * 极值图列表接口响应计划
 * @returns {{ action: 'stale'|'noData'|'loadParallel', filtered?, dateArray?, loadObj? }}
 */
export function planFloodSubmergedListResponse(res, options) {
  const opts = options || {};
  if (opts.requestId !== opts.currentRequestId) {
    return { action: "stale" };
  }
  const rawList =
    res && res.code === 200 && Array.isArray(res.data) ? res.data : null;
  if (!rawList || !rawList.length) {
    return { action: "noData" };
  }
  const filtered = filterSubmergedFilenames(rawList, opts.xzqdm);
  if (!filtered.length) {
    return { action: "noData" };
  }
  const dateArray = String(opts.taskSelectedTime || "").split(/[- :]/);
  return {
    action: "loadParallel",
    filtered: filtered,
    dateArray: dateArray,
    loadObj: {
      time: opts.taskSelectedTime,
      filename: filtered,
      submergedExtreme: true,
      isFuture: !!opts.isFuture,
      submergedRequestId: opts.requestId
    }
  };
}

/**
 * 当前行政区地图加载路由（原 loadFloodMapForActiveRegion）
 * @returns {{ action: string, args?: Array, dataType?: string, xzqdm?: string }}
 */
export function planLoadFloodMapForActiveRegion(options) {
  const opts = options || {};
  const idx = opts.disasterTypeIndex;
  if (idx !== 3 && idx !== 4) {
    return { action: "noop" };
  }
  const xzqdm = opts.xzqdm || "";

  if (opts.isJsDetailsChart) {
    if (idx === 3) {
      if (opts.isMapType) {
        return {
          action: "shTimeData",
          args: [opts.csnlValue, opts.csnlValue, xzqdm]
        };
      }
      if (opts.csnlValue == 1) {
        return { action: "jsSd", dataType: "DL" };
      }
      return {
        action: "sklssjz",
        xzqdm: xzqdm || opts.tableDirllXzqdm || ""
      };
    }
    if (opts.isMapType) {
      return {
        action: "shTimeData",
        args: [opts.shValue, opts.shValue, xzqdm]
      };
    }
    if (opts.shValue == 1) {
      return { action: "jsSd", dataType: "DL" };
    }
    return {
      action: "sklssjz",
      xzqdm: xzqdm || opts.tableDirllXzqdm || ""
    };
  }

  if (!opts.isMapType) {
    return { action: "submergedCities" };
  }
  if (idx === 3) {
    return {
      action: "shTimeData",
      args: [opts.csnlValue, opts.csnlValue, xzqdm]
    };
  }
  return {
    action: "shTimeData",
    args: [opts.shValue, opts.shValue, xzqdm]
  };
}

/**
 * 建成区 / 山洪区边界接口响应（searchJCQfw / searchSHfw）
 */
export function planJcqShBoundaryResponse(res, options) {
  const opts = options || {};
  if (
    !(
      res &&
      res.code === 200 &&
      res.data &&
      res.data.feature &&
      opts.hasEarthMap
    )
  ) {
    return { action: "noop" };
  }
  let geometry = null;
  try {
    geometry = JSON.parse(res.data.feature);
  } catch (e) {
    return { action: "noop" };
  }
  return {
    action: "zoomToFeatures",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: geometry
      }
    ],
    zoomOptions: {
      setLayer: "hightLayer",
      style: {
        lineColor: "#FF0000",
        lineWidth: 2,
        fillColor: "rgba(255,255,255,0.3)"
      },
      zoom: true
    }
  };
}

export default {
  FLOOD_SUBMERGED_LOAD_DEBOUNCE_MS,
  planFloodSubmergedCitiesLoad,
  planFloodSubmergedFetchStart,
  planFloodSubmergedListResponse,
  planLoadFloodMapForActiveRegion,
  planJcqShBoundaryResponse
};
