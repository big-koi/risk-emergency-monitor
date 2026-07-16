import MapFacade, { createMapFacade, getMapFacade, tryGetMapFacade } from "./core/MapFacade";
import LegacyMapAdapter from "./adapters/LegacyMapAdapter";
import OpenLayersAdapter from "./adapters/OpenLayersAdapter";

export {
  MapFacade,
  createMapFacade,
  getMapFacade,
  tryGetMapFacade,
  LegacyMapAdapter,
  OpenLayersAdapter
};

/** 使用旧地图适配器初始化全局 MapFacade */
export function initLegacyMap() {
  return createMapFacade(new LegacyMapAdapter());
}

/** 创建独立 OpenLayers 预览适配器（不替换主 facade） */
export function createOpenLayersPreview() {
  return new OpenLayersAdapter();
}

/** 安全调用主 facade 清业务图层 */
export function mapClearBusinessLayers() {
  const facade = tryGetMapFacade();
  if (facade) {
    return facade.clearBusinessLayers();
  }
}

/** 安全调用主 facade 回到全国 */
export function mapGoNationalView() {
  const facade = tryGetMapFacade();
  if (facade) {
    return facade.goNationalView();
  }
}
