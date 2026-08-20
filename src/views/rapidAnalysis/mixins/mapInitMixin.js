/**
 * 地图初始化与 2D/3D 切换
 */
import { tryGetMapFacade, initLegacyMap } from "@/map";
import { resolveTaskTypeForModule } from "../modules/taskSession";

export const mapInitMixin = {
  methods: {
    // 初始化加载地图
    earthLoaded(map) {
      let that = this;
      this.earthMap = map;
      // 重构：注入 MapControl 到 Legacy 适配器
      const facade = tryGetMapFacade() || initLegacyMap();
      if (facade && facade.adapter && typeof facade.adapter.setMapHost === "function") {
        facade.adapter.setMapHost(map);
      }
      if (facade && typeof facade.init === "function") {
        facade.init();
      }
      this.goNationalViewViaFacade();
      map.map.on("singleclick", function (evt) {
        map.map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) { });

        const identifyRef = that.getIdentifyRef && that.getIdentifyRef();
        if (
          identifyRef &&
          identifyRef.searchType == 1 &&
          identifyRef.isstartPickPoint
        ) {
          identifyRef.getJwData(evt);
        }
      });
      const identifyDom = document.getElementById("mapMarkerModel");
      this.identifyOverlay = new ol.Overlay({
        element: identifyDom,
        positioning: "right-center", // 根据position属性的位置来进行相对点位
        // offset: [0, -30],// 在positioning之上再进行偏移
        autoPan: true,
        className: "custom-overlay", // 自定义 CSS 类
        autoPanAnimation: {
          duration: 250
          //当Popup超出地图边界时，为了Popup全部可见，地图移动的速度.
        },
        zIndex: 9999
      });
      this.earthMap.map.addOverlay(this.identifyOverlay);
    },
    changMapShow() {
      this.isMapType = !this.isMapType;
      if (this.isMapType) {
        this.$refs.threeMap.clearEffect();
        this.$refs.threeMap.resetApi();
      }
      if (
        (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) &&
        this.isJsDetailsChart &&
        this.tableDirllObj
      ) {
        this.openDetailsChart(this.tableDirllObj);
        return;
      }
      if (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) {
        const taskType = resolveTaskTypeForModule({
          disasterTypeIndex: this.disasterTypeIndex,
          csnlValue: this.csnlValue,
          shValue: this.shValue
        });
        this.getTaskList(taskType);
      }
    },
  }
};

export default mapInitMixin;
