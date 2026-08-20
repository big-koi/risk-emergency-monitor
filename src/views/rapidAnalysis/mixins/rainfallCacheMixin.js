/**
 * 降雨/钻取时间轴图层缓存壳（委托 mapLayers.apply*Frame）
 */
import {
  resolveTimelineFrameAction,
  applyDrillVisibleFrame,
  applyShortTermVisibleFrame,
  applyShortTermPreloadFrame,
  applyDrillPreloadFrame,
  buildRainfallLayerCacheResetPatch
} from "../modules/mapLayers";
import {
  shouldReloadShortTermRainfallLayers,
  DEFAULT_SHORT_TERM_RESOLUTION
} from "../modules/shortTermForecast";
import { parseLayerImageExtent } from "../modules/urbanFlood";

export const rainfallCacheMixin = {
  methods: {
    /** 模块切换 removeAllLayer 后，缓存图层引用失效，需清空 */
    clearRainfallLayerCache() {
      this.layerCache.clear();
      Object.assign(this, buildRainfallLayerCacheResetPatch());
    },
    /** 确保降雨缓存图层仍挂载在地图上（切换模块后可能被 removeAllLayer 移除） */
    ensureRainfallLayerOnMap(targetLayer) {
      if (!targetLayer) {
        return;
      }
      this.addHostLayerViaFacade(targetLayer);
    },
    // 时间轴的当前时间
    updateDateTime(obj) {
      this.dateTime = obj.data;
      const dateArray = this.taskSelectedTime.split(/[- :]/);
      const frameAction = resolveTimelineFrameAction({
        disasterTypeIndex: this.disasterTypeIndex,
        isMapType: this.isMapType,
        isJsDetailsChart: this.isJsDetailsChart,
        obj: obj
      });

      if (frameAction.action === "shortTermCache") {
        this.cacheLayers([obj]);
        return;
      }
      if (frameAction.action === "threeMap") {
        this.$refs.threeMap.addModelResult(obj.filename);
        return;
      }
      if (frameAction.action === "drillVisible") {
        const that = this;
        const result = applyDrillVisibleFrame({
          obj: obj,
          xzqdm: (this.tableDirllObj && this.tableDirllObj.xzqdm) || "",
          layerCache: this.layerCache,
          currentVisibleKey: this.drillCurrentVisibleLayerKey,
          clearBusinessLayers: function() {
            that.clearBusinessLayersViaFacade();
          },
          addHostLayer: function(layer) {
            that.addHostLayerViaFacade(layer);
          }
        });
        if (result.status === "hit") {
          this.drillCurrentVisibleLayerKey = result.layerKey;
          return;
        }
        this.clearBusinessLayersViaFacade();
        this.getDljySJZZB(0, obj.filename[0], dateArray, obj, []);
        return;
      }
      if (frameAction.action === "floodFetch") {
        this.clearBusinessLayersViaFacade();
        this.getDljySJZZB(0, obj.filename[0], dateArray, obj, []);
      }
    },
    cacheLayers(list, index = 0) {
      const that = this;
      const result = applyShortTermVisibleFrame({
        list: list,
        index: index,
        baseUrl: this.baseUrl,
        imageExtent: this.imageExtent,
        layerCache: this.layerCache,
        currentVisibleKey: this.updateDateTimeCurrentVisibleLayerKey,
        createImageLayer: function(name, url, options) {
          return that.createImageLayerViaFacade(name, url, options);
        },
        ensureOnMap: function(layer) {
          that.ensureRainfallLayerOnMap(layer);
        },
        onCreatedLoadEnd: function(payload) {
          if (
            that.updateDateTimeCurrentVisibleLayerKey === payload.layerKey
          ) {
            payload.olLayer.setVisible(true);
            that.cacheLayers(payload.list, payload.index + 1);
          }
        }
      });
      if (!result) return;
      this.updateDateTimeCurrentVisibleLayerKey = result.layerKey;
      this.syncOlPreviewImageLayer(result.mapImgUrl, this.imageExtent);
    },
    cacheLayers2(list, index = 1) {
      const that = this;
      const result = applyShortTermPreloadFrame({
        list: list,
        index: index,
        baseUrl: this.baseUrl,
        imageExtent: this.imageExtent,
        layerCache: this.layerCache,
        currentVisibleKey: this.currentVisibleLayerKey,
        createImageLayer: function(name, url, options) {
          return that.createImageLayerViaFacade(name, url, options);
        },
        ensureOnMap: function(layer) {
          that.ensureRainfallLayerOnMap(layer);
        },
        onCreatedLoadEnd: function(payload) {
          payload.olLayer.setVisible(false);
          that.cacheLayers2(payload.list, payload.index + 1);
        }
      });
      if (!result) return;
      this.currentVisibleLayerKey = result.layerKey;
    },
    /** 切回短临预报时重新加载降雨时间轴与图层 */
    reloadShortTermRainfallLayers() {
      if (
        !shouldReloadShortTermRainfallLayers({
          disasterTypeIndex: this.disasterTypeIndex,
          isMapType: this.isMapType,
          taskSelectedTime: this.taskSelectedTime
        })
      ) {
        return;
      }
      this.duanlinTimeChange(
        this.dltimeTabActive || DEFAULT_SHORT_TERM_RESOLUTION
      );
    },
    /**
     * 预加载城市内涝和山洪钻取后的图层
     * @param {Array} list - 时间轴数据列表
     * @param {number} index - 当前索引
     */
    cacheDrillLayers(list, index = 0) {
      const that = this;
      const dateArray = this.taskSelectedTime.split(/[- :]/);
      const isPast =
        (this.disasterTypeIndex === 3 && this.csnlValue === 2) ||
        (this.disasterTypeIndex === 4 && this.shValue === 2);

      const result = applyDrillPreloadFrame({
        list: list,
        index: index,
        layerCache: this.layerCache,
        xzqdm: (this.tableDirllObj && this.tableDirllObj.xzqdm) || "",
        buildImageUrl: function(obj, filename) {
          return that._buildLayerImageUrl(dateArray, obj, filename, isPast);
        },
        fetchExtent: function(filename) {
          const config = that._getLayerConfig(filename);
          return config
            .apiMethod({
              taskTime: that.taskSelectedTime,
              type: config.timeType,
              xzqdm: config.xzqdm || ""
            })
            .then(function(res) {
              if (!res || res.code !== 200) return null;
              return parseLayerImageExtent(res.data);
            });
        },
        createImageLayer: function(name, url, options) {
          return that.createImageLayerViaFacade(name, url, options);
        },
        onEmpty: function() {
          console.log("⚠️ 预加载失败：时间轴数据为空或无效");
        },
        onContinue: function(nextIndex) {
          if (list && nextIndex < list.length) {
            that.cacheDrillLayers(list, nextIndex);
          }
        },
        onError: function(err) {
          console.error("预加载图层失败:", err);
        }
      });

      if (
        result &&
        result.status === "skip" &&
        list &&
        result.nextIndex < list.length
      ) {
        this.cacheDrillLayers(list, result.nextIndex);
      }
    }
  }
};

export default rainfallCacheMixin;
