import { DISASTER_MODULE } from "./constants";

/**
 * 各灾种行政区查询与展示策略
 * queryLevel: 接口查询使用的粒度
 * mapLevel: 地图定位粒度（detail = 使用钻取目标）
 */
export const regionPolicies = {
  [DISASTER_MODULE.SHORT_TERM_FORECAST]: {
    queryLevel: "selected",
    mapLevel: "selected",
    warningLevel: "selected"
  },
  [DISASTER_MODULE.LIVE_RAINFALL]: {
    queryLevel: "selected",
    mapLevel: "selected",
    warningLevel: "selected"
  },
  [DISASTER_MODULE.URBAN_FLOOD]: {
    queryLevel: "city",
    detailLevel: "county",
    mapLevel: "detail",
    warningLevel: "city"
  },
  [DISASTER_MODULE.MOUNTAIN_FLOOD]: {
    queryLevel: "city",
    detailLevel: "county",
    mapLevel: "detail",
    warningLevel: "city"
  }
};

export function getRegionPolicy(module) {
  return regionPolicies[module] || regionPolicies[DISASTER_MODULE.SHORT_TERM_FORECAST];
}
