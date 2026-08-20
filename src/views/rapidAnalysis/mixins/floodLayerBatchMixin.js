/**
 * 内涝/山洪积水深度与极值淹没图层批处理壳
 * 依赖页面：MapFacade mixin、getActiveFloodXzqdm、syncOlPreviewImageLayer、floodSubmerged*
 */
import { getDljySJZZB as fetchFloodExtentApi, getSKLSSJZZB } from "@/api/rapidAnalysis/index.js";
import {
  buildFloodDepthImageUrl,
  buildSubmergedExtremeImageUrl,
  parseLayerImageExtent,
  resolveFloodLayerConfig,
  buildFloodExtentQueryParams,
  isFloodSubmergedRequestStale,
  resolveFloodLayerBatchStep,
  runSubmergedLayersParallel,
  mergeLayerExtents
} from "../modules/urbanFlood";

export const floodLayerBatchMixin = {
  methods: {
    /**
     * 获取图层配置信息
     * @param {string} filename - 文件名
     * @returns {Object} 配置对象
     */
    _getLayerConfig(filename, obj) {
      const cfg = resolveFloodLayerConfig({
        filename: filename,
        obj: obj,
        disasterTypeIndex: this.disasterTypeIndex,
        csnlValue: this.csnlValue,
        shValue: this.shValue,
        timeTabActive: this.timeTabActive,
        isMapType: this.isMapType,
        isJsDetailsChart: this.isJsDetailsChart,
        drillXzqdm: this.tableDirllObj && this.tableDirllObj.xzqdm
      });
      return Object.assign({}, cfg, {
        apiMethod: cfg.isPast ? getSKLSSJZZB : fetchFloodExtentApi
      });
    },

    /**
     * 极值图（JZT 接口）图片地址
     */
    _buildSubmergedExtremeImageUrl(dateArray, obj, filename) {
      return buildSubmergedExtremeImageUrl({
        baseUrl: this.baseUrl,
        dateArray: dateArray,
        obj: obj,
        filename: filename,
        disasterTypeIndex: this.disasterTypeIndex,
        taskSelectedTime: this.taskSelectedTime
      });
    },

    /**
     * 构建图层图片URL
     */
    _buildLayerImageUrl(dateArray, obj, filename, isPast) {
      return buildFloodDepthImageUrl({
        baseUrl: this.baseUrl,
        dateArray: dateArray,
        obj: obj,
        filename: filename,
        isPast: isPast,
        disasterTypeIndex: this.disasterTypeIndex,
        shValue: this.shValue,
        timeTabActive: this.timeTabActive
      });
    },

    _getMapImageProjection() {
      return this.getViewProjectionViaFacade();
    },
    _clearFloodSubmergedMapLayers() {
      if (!this.floodSubmergedOlLayers || !this.floodSubmergedOlLayers.length) {
        return;
      }
      this.floodSubmergedOlLayers.forEach(layer => {
        this.removeHostLayerViaFacade(layer);
      });
      this.floodSubmergedOlLayers = [];
    },
    _isFloodSubmergedRequestStale(obj) {
      return isFloodSubmergedRequestStale(obj, this.floodSubmergedRequestId);
    },
    _parseLayerImageExtent(raw) {
      return parseLayerImageExtent(raw);
    },
    _addSubmergedImageLayer(item, zIndex) {
      if (!item || !item.imageExtent) {
        return null;
      }
      const projection = this._getMapImageProjection();
      const layer = this.createImageLayerViaFacade(item.layerName, item.url, {
        visible: true,
        opacity: 0.65,
        name: item.layerName,
        projection: projection === "EPSG:4490" ? 4490 : 4326,
        imageExtent: item.imageExtent
      });
      if (!layer) {
        return null;
      }
      const olLayer = layer.getLayer && layer.getLayer();
      if (olLayer && olLayer.setZIndex) {
        olLayer.setZIndex(1000 + zIndex);
      }
      this.floodSubmergedOlLayers.push(layer);
      if (olLayer) {
        const source = olLayer.getSource && olLayer.getSource();
        if (source && source.on) {
          source.on("imageloaderror", () => {
            console.warn("极值图图片加载失败:", item.layerName, item.url);
          });
        }
      }
      return layer;
    },
    _fitMapToSubmergedLayers(layerArray) {
      const extent = mergeLayerExtents(layerArray);
      if (!extent) {
        return;
      }
      const activeCode = this.getActiveFloodXzqdm();
      this.fitExtentViaFacade(extent, {
        padding: [60, 60, 60, 60],
        maxZoom: activeCode ? 12 : 7,
        duration: 300
      });
    },
    _fetchSubmergedLayerItem(filename, index, dateArray, obj) {
      const config = this._getLayerConfig(filename, obj);
      const zbParams = buildFloodExtentQueryParams({
        taskTime: this.taskSelectedTime,
        timeType: config.timeType,
        xzqdm: config.xzqdm,
        disasterTypeIndex: this.disasterTypeIndex
      });
      return config
        .apiMethod(zbParams)
        .then(res => {
          if (!(res && res.code === 200 && res.data)) {
            console.warn("极值图范围查询失败，跳过:", filename, res);
            return null;
          }
          const mapImgUrl = this._buildLayerImageUrl(
            dateArray,
            obj,
            filename,
            config.isPast
          );
          const imageExtent = this._parseLayerImageExtent(res.data);
          if (!imageExtent) {
            console.warn("极值图范围无效，跳过:", filename, res.data);
            return null;
          }
          const step = resolveFloodLayerBatchStep({
            res: res,
            index: index,
            filename: filename,
            mapImgUrl: mapImgUrl,
            obj: obj,
            imageExtent: imageExtent
          });
          return step.item;
        })
        .catch(err => {
          console.error("加载图层数据失败:", filename, err);
          return null;
        });
    },
    /** 极值图：并行查四至，逐张叠加图层 */
    _loadSubmergedLayersParallel(filenames, dateArray, obj) {
      if (this._isFloodSubmergedRequestStale(obj)) {
        return;
      }
      const that = this;
      runSubmergedLayersParallel({
        filenames: filenames,
        isStale: function() {
          return that._isFloodSubmergedRequestStale(obj);
        },
        fetchItem: function(filename, index) {
          return that._fetchSubmergedLayerItem(filename, index, dateArray, obj);
        },
        onItem: function(item) {
          that._addSubmergedImageLayer(item, that.floodSubmergedOlLayers.length);
        },
        onEmpty: function() {
          that.floodMapNoSubmergedData = true;
        },
        onDone: function(layerArray) {
          that._finishSubmergedLayersLoaded(obj, layerArray);
        }
      });
    },
    _finishSubmergedLayersLoaded(obj, layerArray) {
      if (this._isFloodSubmergedRequestStale(obj)) {
        return;
      }
      if (!layerArray || !layerArray.length) {
        this.floodMapNoSubmergedData = true;
        return;
      }
      this.$nextTick(() => {
        this._fitMapToSubmergedLayers(layerArray);
      });
      // 极值淹没图：同步首图层到 OL 预览
      if (layerArray[0] && layerArray[0].url) {
        this.syncOlPreviewImageLayer(
          layerArray[0].url,
          layerArray[0].imageExtent
        );
      }
    },
    _finishFloodLayerBatch(obj, layerArray) {
      if (this._isFloodSubmergedRequestStale(obj)) {
        return;
      }
      if (!layerArray || !layerArray.length) {
        if (obj && obj.submergedExtreme) {
          this.floodMapNoSubmergedData = true;
        }
        return;
      }
      if (obj && obj.submergedExtreme) {
        return;
      }
      this.addImageLayerViaFacade({
        layerName: layerArray[0].layerName,
        url: layerArray[0].url,
        imageExtent: layerArray[0].imageExtent,
        name: null,
        index: 0,
        layerArray: layerArray
      });
      // 重构：内涝/山洪积水图同步 OL 预览（取首帧）
      this.syncOlPreviewImageLayer(
        layerArray[0].url,
        layerArray[0].imageExtent
      );
    },
    _continueFloodLayerBatch(index, obj, dateArray, layerArray) {
      if (this._isFloodSubmergedRequestStale(obj)) {
        return;
      }
      if (index < obj.filename.length - 1) {
        this.getDljySJZZB(
          index + 1,
          obj.filename[index + 1],
          dateArray,
          obj,
          layerArray
        );
      } else {
        this._finishFloodLayerBatch(obj, layerArray);
      }
    },

    /**
     * 处理图层数据响应
     */
    _handleLayerResponse(
      res,
      index,
      filename,
      dateArray,
      obj,
      layerArray,
      isPast
    ) {
      if (this._isFloodSubmergedRequestStale(obj)) {
        return;
      }
      const mapImgUrl =
        res && res.code === 200 && res.data
          ? this._buildLayerImageUrl(dateArray, obj, filename, isPast)
          : "";
      if (res && res.code === 200 && res.data) {
        this.jsImageExtent = [res.data];
        if (this.disasterTypeIndex === 3 && this.csnlValue === 2) {
          console.log("mapImgUrl", mapImgUrl);
        }
      } else if (obj && obj.submergedExtreme) {
        console.warn("极值图范围查询失败，跳过:", filename, res);
      }

      const step = resolveFloodLayerBatchStep({
        res: res,
        index: index,
        filename: filename,
        mapImgUrl: mapImgUrl,
        obj: obj
      });
      if (step.item) {
        layerArray.push(step.item);
      } else if (
        obj &&
        obj.submergedExtreme &&
        res &&
        res.code === 200 &&
        res.data
      ) {
        console.warn("极值图范围无效，跳过:", filename, res.data);
      }

      if (!step.continueBatch) {
        return;
      }
      this._continueFloodLayerBatch(index, obj, dateArray, layerArray);
    },

    /**
     * 获取积水深度图层数据
     */
    getDljySJZZB(index, filename, dateArray, obj, layerArray) {
      // 只处理城市内涝和山洪
      if (this.disasterTypeIndex !== 3 && this.disasterTypeIndex !== 4) {
        return;
      }

      const config = this._getLayerConfig(filename, obj);
      const zbParams = buildFloodExtentQueryParams({
        taskTime: this.taskSelectedTime,
        timeType: config.timeType,
        xzqdm: config.xzqdm,
        disasterTypeIndex: this.disasterTypeIndex
      });

      config
        .apiMethod(zbParams)
        .then(res => {
          this._handleLayerResponse(
            res,
            index,
            filename,
            dateArray,
            obj,
            layerArray,
            config.isPast
          );
        })
        .catch(err => {
          console.error("加载图层数据失败:", filename, err);
          this._handleLayerResponse(
            { code: 500 },
            index,
            filename,
            dateArray,
            obj,
            layerArray,
            config.isPast
          );
        });
    }
  }
};

export default floodLayerBatchMixin;
