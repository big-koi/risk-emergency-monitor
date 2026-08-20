/**
 * 预警城市：等级图标、轮播条、2D marker 载荷
 */

function buildLevelConfigMap(prefix) {
  const p = prefix || "";
  return {
    红色预警: {
      className: `${p}hongseyujing-bg`,
      icon3D: "@path:images/hongseyujing.png",
      icon2D: require("@/assets/images/rapidAnalysis/hongseyujing.png")
    },
    橙色预警: {
      className: `${p}chengseyujing-bg`,
      icon3D: "@path:images/chengseyujing.png",
      icon2D: require("@/assets/images/rapidAnalysis/chengseyujing.png")
    },
    黄色预警: {
      className: `${p}huangseyujing-bg`,
      icon3D: "@path:images/huangseyujing.png",
      icon2D: require("@/assets/images/rapidAnalysis/huangseyujing.png")
    },
    蓝色预警: {
      className: `${p}lanseyujing-bg`,
      icon3D: "@path:images/lanseyujing.png",
      icon2D: require("@/assets/images/rapidAnalysis/lanseyujing.png")
    }
  };
}

/** 预警等级 → className / iconUrl */
export function resolveWarningLevelConfig(yjlevel, isMapType, prefix) {
  const configMap = buildLevelConfigMap(prefix);
  const config = configMap[yjlevel] || configMap["蓝色预警"];
  return {
    className: config.className,
    iconUrl: isMapType ? config.icon3D : config.icon2D
  };
}

/**
 * 内涝/山洪预警城市：补图标 + 顶部轮播
 * @returns {{ list: Array, scrollTopList: Array }}
 */
export function prepareWarningCityDisplay(list, options) {
  const opts = options || {};
  const isMapType = !!opts.isMapType;
  const prefix = opts.prefix || "";
  const scrollTopList = [];
  const enriched = [];
  (list || []).forEach(function(item, index) {
    const config = resolveWarningLevelConfig(item.yjlevel, isMapType, prefix);
    enriched.push(Object.assign({}, item, { iconUrl: config.iconUrl }));
    scrollTopList.push({
      index: index,
      class: config.className,
      name: `${item.shengname}-${item.shiname}`
    });
  });
  return { list: enriched, scrollTopList: scrollTopList };
}

/** 2D 地图：预警城市 marker 任务列表 */
export function buildFloodWarningMarkerJobs(list) {
  return (list || []).map(function(item) {
    return {
      coordinate: [item.x, item.y],
      imgUrl: item.iconUrl,
      data: {
        name: `${item.shengname}-${item.shiname}`,
        datatime: item.datatime,
        xzqdm: item.xzqdm
      },
      type: "yjdj"
    };
  });
}

/**
 * 将 prepared 中的 iconUrl 写回原 list 引用（供 3D addMaker）
 */
export function applyWarningCityIconPatches(sourceList, preparedList) {
  (sourceList || []).forEach(function(item, index) {
    const next = preparedList && preparedList[index];
    if (item && next) {
      item.iconUrl = next.iconUrl;
    }
  });
}

/**
 * 预警城市上图编排（原 processWarningCityData）
 * @returns {{
 *   clearThreeMaker: boolean,
 *   scrollTopList: Array,
 *   preparedList: Array,
 *   mapAction: 'threeMaker'|'facadeMarkers'|'noop',
 *   markerJobs: Array
 * }}
 */
export function planProcessWarningCityData(list, options) {
  const opts = options || {};
  const source = list || [];
  const prepared = prepareWarningCityDisplay(source, {
    isMapType: !!opts.isMapType,
    prefix: opts.prefix || ""
  });
  applyWarningCityIconPatches(source, prepared.list);

  let mapAction = "noop";
  let markerJobs = [];
  const hasThree = !!opts.hasThreeMap;
  if (opts.isMapType && hasThree) {
    mapAction = "threeMaker";
  } else if (!opts.isMapType && opts.shouldAddMarker !== false) {
    mapAction = "facadeMarkers";
    markerJobs = buildFloodWarningMarkerJobs(prepared.list);
  }

  return {
    clearThreeMaker: !!(opts.isMapType && hasThree),
    scrollTopList: prepared.scrollTopList,
    preparedList: prepared.list,
    sourceList: source,
    mapAction: mapAction,
    markerJobs: markerJobs
  };
}

/**
 * 短临暴雨预警城市：轮播 + marker 任务
 * @returns {{ scrollTopList: Array, markerJobs: Array }}
 */
export function prepareRainstormWarningDisplay(list) {
  const scrollTopList = [];
  const markerJobs = [];
  const iconUrl = require("@/assets/images/earth/byyj.png");
  (list || []).forEach(function(item, index) {
    const name = `${item.shengname}-${item.shiname}`;
    scrollTopList.push({
      index: index,
      class: "byyj-bg",
      name: name,
      type: "byyj"
    });
    markerJobs.push({
      coordinate: [item.x, item.y],
      imgUrl: iconUrl,
      data: {
        name: name,
        dateTime: item.yjtime,
        xzqdm: item.xzqdm,
        type: "byyj",
        lon: item.x,
        lat: item.y,
        index: index + 1,
        shengname: item.shengname,
        shiname: item.shiname,
        maxprcp: item.maxprcp,
        yjtime: item.yjtime
      },
      type: "byyj"
    });
  });
  return { scrollTopList: scrollTopList, markerJobs: markerJobs };
}

/** 气象台预警点 marker 任务 */
export function buildQxtYjMarkerJobs(list) {
  const iconUrl = require("@/assets/images/rapidAnalysis/qxyjIcon.png");
  return (list || []).map(function(item) {
    return {
      coordinate: [item.x, item.y],
      imgUrl: iconUrl,
      data: {
        lon: item.x,
        lat: item.y,
        conten: item.content,
        type: "qxyj"
      },
      type: "qxyj"
    };
  });
}

export default {
  resolveWarningLevelConfig,
  prepareWarningCityDisplay,
  buildFloodWarningMarkerJobs,
  applyWarningCityIconPatches,
  planProcessWarningCityData,
  prepareRainstormWarningDisplay,
  buildQxtYjMarkerJobs
};
