<template>
  <div :style="{ width: '100%', height: '100%' }" id="zf-earth">
    <div id="map" ref="mapbox" class="diit-map">
      <div id="addMarker"></div>
    </div>
    <div v-if="showMapTool">
      <!--  <toolbar
        v-if="ToolIf"
        id="map-toolbar"
        :data="toolbarData"
        class="toolbar-operation"
      ></toolbar> -->
      <div :class="{ toolLeftMore: toolLeftMore }">
        <!--  <region-locate
          v-if="ToolIf && showLeftTool"
          id="region-locate"
          ref="regionLocateDom"
          :data="regionLocateData"
          class="regionLocate"
        >
        </region-locate> -->
        <toolbar v-if="ToolIf && showLeftTool" id="map-toolbar2" :data="toolbarData2" class="toolbar2"></toolbar>

        <!-- <toolbar
          v-if="ToolIf"
          id="map-toolbar3"
          :data="toolbarData3"
          class="toolbar3"
        ></toolbar> -->
        <!-- <base-map-panel v-if="BaseMapIf" id="map-basemap" class="map-baseMap" :data="baseMapPanelData"></base-map-panel> -->
        <base-map-panel v-if="BaseMapIf && showLeftTool" id="map-basemap" :class="mapToolHaveRight ? 'map-baseMap' : 'map-baseMapNoRight'" :data="baseMapPanelData">
        </base-map-panel>
        <current-space-info class="map-currentSpaceInfo" :data="currentSpaceInfo" v-if="mapInitCompleted"></current-space-info>
      </div>
      <div id="rightTool" :class="{ rightTool: true, toolRightMore: toolRightMore }">
        <!--   <toolbar
          v-if="ToolIf"
          id="map-toolbar1"
          :data="toolbarData1"
          class="toolbar1"
        ></toolbar> -->
        <layer-choice v-if="ToolIf && layerChoiceData != null" :mapData="layerChoiceData" :style="{ display: hideLayerChoice ? 'none' : 'block' }" @layerChange="layerChoiceChange">
        </layer-choice>
      </div>
      <!-- 图例 -->
      <div class="legendBtnBox">
        <img @click="closeLegend" src="@/assets/images/earth/legend.png" />
      </div>
      <div class="legendBox" v-if="legendShow">
        <div class="legendHeader">
          <div class="title">图例：</div>
          <img v-if="ToolIf" @click="closeLegend" src="@/assets/images/earth/close.png" />
        </div>
        <div v-for="item in legendBoxData" :key="item.name">
          <div class="stepName">{{item.name}}</div>
          <div class="legendContent" v-if="item.type=='Polygon'">
            <template>
              <div
                class="legendItem"
                v-for="(jtem, index) in item.legendDataArr"
                :style="{
                  width: item.name == '预警等级' ? '100%' : '50%',
                  paddingRight: item.name == '预警等级' ? '40px' : '0'
                }"
                :key="index"
                >
                <div class="legendRenderBox" :style="{ justifyContent: item.name == '预警等级' ? 'space-between' : 'start' }">
                  <span class="legendRenderItem" :style="'background:' + jtem.color"></span>
                  <span v-if="item.name == '预警等级' && !jtem.ranges" >{{ jtem.range }}</span>
                  <div v-if="item.name == '预警等级' &&  jtem.ranges">
                    <p>{{ jtem.ranges[0] }},</p>
                    <p>{{ jtem.ranges[1] }}</p>
                  </div>
                  <div>{{ jtem.alias }}</div>
                </div>
              </div>
            </template>
          </div>
          <div class="legendContent" v-if="item.type=='Line'">
            <div v-show="item.name=='一级流域'" class="river1"></div>
            <div v-show="item.name=='二级流域'" class="river2"></div>
            <div v-show="item.name=='省'" class="line1"></div>
            <div v-show="item.name=='市'" class="line2"></div>
            <div v-show="item.name=='县'" class="line3"></div>
          </div>
          <div class="legendContent" v-if="item.type=='Rect'">
            <div class="rect"></div>
          </div>
        </div>
      </div>
    </div>
    <!-- <ZoomIn></ZoomIn> -->
    <!-- <legend-warn></legend-warn> -->
  </div>
</template>

<script>
const _MapOrEarth = window.mapConfig.mapType;
const _ConfigUrl = window.mapConfig.absoluteUrls.json;
let _XZQDM = "";
import ThematicPanel from "../../components/ThematicPanel/right.vue";
import _Uuid from "uuid";
import _MapControl from "./map-control.js";
import { get as _ServerGet } from "../../utils/http-service";
import LayerChoice from "./LayerChoice";
// import LegendWarn from "./LegendWarn";
import LegendWarn from "./Legend.vue";
const mark = require("../../assets/images/mark/mark.png");

//地图对象（二三维切换）
const diitMap =
  _MapOrEarth == "Map"
    ? diit2DMap
    : _MapOrEarth == "Earth"
    ? diit3DMap
    : console.error("地图对象配置出错");

export default {
  name: "ZfEarth",
  components: {
    LayerChoice,
    LegendWarn,
    ThematicPanel,
  },
  provide() {
    return {
      // 如果是静态的，可以不返回方法
      mapInstance: () => this.earth,
    };
  },
  props: {
    config: null,
    legendShow: {
      type: Boolean,
      default: false,
    },
    legendBoxData: {
      type: Array,
      default: () => {
        return [];
      },
    },
    showMapTool: {
      type: Boolean,
      default: true,
    },
    // 只有earth时隐藏右下角名称
    hideLayerChoice: {
      type: Boolean,
      default: false,
    },
    // 当右边为空，传递此参数把地图切换放到右边
    mapToolHaveRight: {
      type: Boolean,
      default: true,
    },
    toolLeftMore: {
      type: Boolean,
      default: false,
    },
    toolRightMore: {
      type: Boolean,
      default: false,
    },
    notShowBaseMap: {
      type: Boolean,
      default: false,
    },
    layerChoiceData: {
      //地图编码集合
      type: Array,
      default: null,
    },
    legendWarnData: {
      type: Array,
      default: null,
    },
    flag: Boolean,
    showLeftTool: {
      type: Boolean,
      default: true,
    },
    basemapShows: {
      type: Array,
      default: [],
    }
  },
  data() {
    return {
      chartId: _Uuid.v4(),
      earth: null,
      earthLoadBsm: "earthLoaded",
      ToolIf: false,
      BaseMapIf: false,
      RegionLocateIf: false,
      drawControl: null,
      toolbarData: null,
      toolbarData1: null,
      toolbarData2: null,
      toolbarData3: null,
      baseMapPanelData: null,
      regionLocateData: null,
      currentSpaceInfo: null,
      mapInitCompleted: false,
      legendData: {},
      xzqdm: window.sessionStorage.getItem('xzqdm')
    };
  },
  mounted() {
    _XZQDM = mainConfig.regionCode;
    this.loadEarth();
  },
  methods: {
    closeLegend() {
      this.$emit('update:legendShow',!this.legendShow)
    },
    setScreen() {
      // 获取屏幕的宽度 计算缩放比例
      this.$nextTick(() => {
        let dom = this.$refs.mapbox;
        let max = Math.max(
          1920 / document.body.clientWidth,
          937 / document.body.clientHeight
        );
        dom.style.transform = `scale(${max})`;
      });
    },
    loadEarth() {
      let pngMe = this;
      let isLoaded = window.sessionStorage.getItem(pngMe.earthLoadBsm);
      pngMe.earth = new diitMap.Map("map", {
        //判断球是否加载过，加载过则不再旋转（适用于球）
        Animation: isLoaded == null,
      });

      let configurl = _ConfigUrl;
      //初始化加载默认行政区划内容
      if (window.localStorage.operationInfo != null) {
        let operationInfo = JSON.parse(window.localStorage.operationInfo);
        let xzq;
        if (operationInfo.organization.length == undefined) {
          xzq = operationInfo.organization.districtCode;
        } else {
          xzq = operationInfo.organization[0].districtCode;
        }
        //window.Zf_MainConfig.XZQ.XZQDM
        if (mainConfig.regionCode != xzq && xzq != undefined) {
          pngMe.earth._server.get(configurl).then(function (data) {
            pngMe.earth.init(data);
          });
        } else {
          pngMe.earth.init(configurl);
        }
      } else {
        pngMe.earth.init(configurl);
      }

      //if (pngMe.config != null) configurl = pngMe.config;
      window.pngMe = pngMe;
      pngMe.earth.eventManager.subscribe(
        pngMe.earth.eventManager.enumEventType.Map.MapInitCompltedEvent,
        function (map) {
          //设置球已加载过
          window.sessionStorage.setItem(pngMe.earthLoadBsm, "true");
          pngMe._viewer = map.data.map;
          if (pngMe.earth.MapType == 3) {
            pngMe.drawControl = new DiitEarth.Draw(map.data.map, {
              hasEdit: false,
            });
          }
          //加载底图
          if (me.baseMapPanelData.basemaps != null) {
            for (
              let i = 0;
              i < me.baseMapPanelData.basemaps.length;
              i++
            ) {
              let op = me.baseMapPanelData.basemaps[i];
              if (op.options.visible == true) {
                const layerOptions = {
                  name :  op.options.name || '底图',
                  visible : true
                };
                layerOptions.Map = pngMe.earth.map;
                let la = pngMe.earth.layerManager.createLayer(
                  op.id,
                  op.type,
                  op.url,
                  layerOptions
                );
                pngMe.earth.addBaseMapLayer(la);
              }
            }
          }

          //加载顶图
          if (pngMe.earth.dataConfig.defaultMap.topmaps != null) {
            for (
              let i = 0;
              i < pngMe.earth.dataConfig.defaultMap.topmaps.length;
              i++
            ) {
              let op = pngMe.earth.dataConfig.defaultMap.topmaps[i];
              if (op.options && op.options.visible == true) {
                op.options = op.options || {};
                op.options.Map = pngMe.earth.map;
                let la = pngMe.earth.layerManager.createLayer(
                  op.id,
                  op.type,
                  op.url,
                  op.options
                );
                pngMe.earth.addTopLayer(la);
              }
            }
          }

          //将xzqh的方法挂载到mapControl
          _MapControl["locateCity"] = function (xzqdm) {
            //发布行政区定位事件
            pngMe.earth.eventManager.publish(
              pngMe.earth.eventManager.enumEventType.Map.XZQHChangeEvent,
              {
                code: pngMe.earth.enumMessageCode.Success,
                message: "",
                data: { district_code: xzqdm, self: true },
              }
            );
          };
          _MapControl["getParentXzqInfoByXzqdm"] = function (xzqdm) {
            if (_XZQDM.substr(-4) == "0000") {
              return pngMe.$refs.regionLocateDom.getParentXzqInfoByXzqdm(xzqdm);
            } else {
              return pngMe.getParentXzqInfoByXzqdm(xzqdm);
            }
          };

          //订阅行政区定位事件
          pngMe.earth.eventManager.subscribe(
            pngMe.earth.eventManager.enumEventType.Map.XZQHChangeEvent,
            (XZQHChangeData) => {
              if (XZQHChangeData.data.self) return; //自己触发的不做任何操作
              const xzqdm = XZQHChangeData.data.district_code;
              const xzqmc = XZQHChangeData.data.district_name;
              pngMe.$emit("selectXzq", xzqdm, xzqmc);
            }
          );

          _MapControl.init(pngMe.earth, pngMe).then(() => {
            //mapControl初始化
            //工具条
            _ServerGet(pngMe.earth.dataConfig.mapConfig.toolbarConfig)
              .then((res) => {
                pngMe.toolbarData = {
                  domId: "map-toolbar",
                  myMap: pngMe.earth,
                  diitMap: diitMap,
                  dataConfig: res.items3,
                  diitWidgets: [],
                  direction: "horizontal",
                };
                pngMe.toolbarData1 = {
                  domId: "map-toolbar1",
                  myMap: pngMe.earth,
                  diitMap: diitMap,
                  dataConfig: res.items4,
                  diitWidgets: [],
                  direction: "Vertical",
                };
                pngMe.toolbarData2 = {
                  domId: "map-toolbar2",
                  myMap: pngMe.earth,
                  diitMap: diitMap,
                  dataConfig: res.items2,
                  diitWidgets: [],
                  direction: "horizontal",
                };
                pngMe.toolbarData3 = {
                  domId: "map-toolbar3",
                  myMap: pngMe.earth,
                  diitMap: diitMap,
                  dataConfig: res.items1,
                  diitWidgets: [],
                  direction: "horizontal",
                };
                pngMe.ToolIf = pngMe.showMapTool;
                // 初始化图例
                pngMe.legendData = {
                  domId: "Legend",
                  myMap: pngMe.earth,
                  diitMap: diitMap,
                  direction: "horizontal",
                  options: {
                    position: "bottom",
                    IsShowText: true,
                    visible: true,
                  },
                };
                //             {
                //   "id": "Legend",
                //   "name": "图例",
                //   "icon": "",
                //   "class": "Legend",

                // }
              })
              .catch(function (error) {
                console.error(error);
              });

            pngMe.mapInitCompleted = true;

            //底图顶图切换
            if (!pngMe.notShowBaseMap) {
              pngMe.baseMapPanelData = {
                domId: "map-baseMap",
                myMap: pngMe.earth,
                diitMap: diitMap,
                basemaps: pngMe.earth.dataConfig.defaultMap.basemaps.map((bmap,bindex) => {
                  bmap.options.visible = pngMe.basemapShows[bindex] || false
                }),
                topmaps: pngMe.earth.dataConfig.defaultMap.topmaps,
                options: {
                  isShowBlankMap: true,
                },
              };
              pngMe.BaseMapIf = pngMe.showMapTool;
              pngMe.BaseMapIfNoRight = pngMe.mapToolHaveRight;
            }
            pngMe.regionLocateData = {
              domId: "region-locate",
              myMap: pngMe.earth,
              diitMap: diitMap,
              options: {
                xzqhCode: _XZQDM,
              },
            };
            pngMe.RegionLocateIf = pngMe.showMapTool;

            pngMe.currentSpaceInfo = {
              domId: "map-currentSpaceInfo",
              myMap: pngMe.earth,
              options: {
                xlength: 7,
                ylength: 8,
              },
            };

            // pngMe.legendWarnData = []
            // pngMe.legendWarnData.push({
            //   img: mark,
            //   title: "震源点"
            // })

            // pngMe.getLayer()
            pngMe.$emit("onLoad", pngMe.earth);
            pngMe.$emit("earthLoaded", _MapControl);
            /*  if (pngMe.xzqdm != '000000') {
              debugger
            } else {
              debugger
              pngMe.$emit("earthLoaded", _MapControl);
              pngMe.$emit("onLoad", pngMe.earth);
            } */
            pngMe.$nextTick(() => {
              pngMe.delayFun();
            });
          });
        }
      );
    },
    getParentXzqInfoByXzqdm(xzqdm) {
      let pngMe = this;
      const root = pngMe.$refs.regionLocateDom.LoadXZQHData.cities[0];
      const cities = pngMe.$refs.regionLocateDom.LoadXZQHData.cities[0].childs;
      const xzqInfo = {};
      if (xzqdm.substr(-2) == "00") {
        xzqInfo.xzqmc = root.name;
        xzqInfo.xzqdm = root.code;
      } else if (xzqdm.length == 6) {
        //const pDm = xzqdm;
        const pDm = xzqdm.substr(0, 4) + "00";
        //const pInfo = cities.filter(city => city.code== pDm)[0];
        if (pDm == root.code) {
          xzqInfo.xzqmc = root.name;
          xzqInfo.xzqdm = root.code;
        }
      } else if (xzqdm.length == 9) {
        const pDm = xzqdm.substr(0, 6);
        const pInfo = cities.filter((city) => city.code == pDm)[0];
        if (pInfo != null) {
          xzqInfo.xzqmc = pInfo.name;
          xzqInfo.xzqdm = pInfo.code;
        }
      }
      return xzqInfo;
    },
    layerChoiceChange(code) {
      _MapControl.changeMap(code);
    },
    //工具栏显示处理
    delayFun() {
      let pngMe = this;
      if (pngMe.flag == true) {
        let dom = document.getElementById("rightTool");
        dom.style.right = "0.20rem";
      }
    },

    getLayer(LayerObj) {
      let that = this;

      let OperationLayers = that.earth.layerManager.getLayers();
      that.Layer = [];
      for (let i = OperationLayers.length - 1; i >= 0; i--) {
        that.Layer.push(OperationLayers[i]);
      }
      $("#mapLegend").html("");
      that.allLegendAr = [];
      for (let i = 0; i < that.Layer.length; i++) {
        that.Layer[i].name = that.Layer[i].options.name;
        if (that.Layer[i].options.legend) {
          that.Layer[i].LegendArry = that.Layer[i].options.legend;
          that.getLegendConfig(that.Layer[i]);
        } else {
          if (LayerObj != undefined) {
            if (LayerObj.id == that.Layer[i].id) {
              that.Layer[i].isShowLegend = LayerObj.isShowLegend;
            }
          } else {
            if (that.Layer[i].isShowLegend == undefined) {
              that.Layer[i].isShowLegend = true;
            }
          }
          if (that.Layer[i].isShowLegend) {
            that.getLegendJson(that.Layer[i]);
          }
        }
      }
      this.refreshLegend();
    },
    getLegendConfig(layer) {
      const that = this;
      const legends = layer.LegendArry;
      // that.legendAr = [];
      let legendom = "";
      for (let i = 0; i < legends.length; i++) {
        const le = legends[i];
        const label = le.label;
        let elem = "";
        if (le.type == "Point") {
          elem =
            '<div style="border-radius:10px;height:20px;width:20px;background:' +
            le.color +
            '"></div>';
        } else if (le.type == "LineString") {
          elem =
            '<div style="margin-top:8px;height:5px;width:20px;background:' +
            le.color +
            '"></div>';
        } else if (le.type == "Polygon" || le.type == null) {
          elem =
            '<div style="height:20px;width:20px;background:' +
            le.color +
            '"></div>';
        }
        let legends =
          '<div class="legend-item">' +
          '<div class="widget-legend-img">' +
          elem +
          "</div>" +
          '<div class="widget-legend-txt">' +
          label +
          "</div></div>";
        if (i == 0) {
          legendom = legends;
        } else {
          legendom += legends;
        }
      }
      layer.legendHtml = legendom;
    },
    getLegendJson(MapLayer) {
      let that = this;

      that.legendWarnData = [];
      let url = MapLayer.url + "/legend?f=json&callback=?";
      // that.legendAr = [];
      let legendom = "";
      if (
        that.earth.dataConfig.apiConfig.apiIsProxy &&
        url.indexOf("proxy") == -1
      ) {
        url = that.earth.dataConfig.apiConfig.proxyUrl + url;
      }
      $.ajax({
        url: url,
        type: "get",
        dataType: "json",
        success: function (data) {
          //let legendJson = JSON.parse(data.substring(2, data.length - 2));
          data.layers =
            data.layers == null || data.layers == undefined ? [] : data.layers;
          let legendJson = data;
          if (legendJson.layers == undefined) {
            return;
          }
          for (let i = 0; i < legendJson.layers.length; i++) {
            for (let j = 0; j < legendJson.layers[i].legend.length; j++) {
              let label = legendJson.layers[i].legend[j].label;
              // let lenHas = that.allLegendAr.filter(function (el) {
              //   return el.label == label;
              // });
              let imgs =
                MapLayer.url +
                "/" +
                legendJson.layers[i].layerId +
                "/images/" +
                legendJson.layers[i].legend[j].url;
              if (that.earth.dataConfig.apiConfig.apiIsProxy) {
                imgs = that.earth.dataConfig.apiConfig.proxyUrl + imgs;
              }
              let legends =
                '<div class="legend-item">' +
                '<div class="widget-legend-img"><img crossOrigin="anonymous"  src="' +
                imgs +
                '" /></div>' +
                '<div class="widget-legend-txt">' +
                legendJson.layers[i].legend[j].label +
                "</div></div>";
              let obj = {
                img: imgs,
                title: legendJson.layers[i].legend[j].label || "--",
              };

              that.legendWarnData.push(obj);

              if (i == 0 && j == 0) {
                legendom = legends;
              } else {
                legendom += legends;
              }
            }
          }
          MapLayer.legendHtml = legendom || "";

          that.legendWarnData.push({
            img: mark,
            title: "震源点",
          });
        },
        error: function (xhr, status, error) {
          console.error(XMLHttpRequest.responseText);
        },
      });
    },
    refreshLegend() {
      this.$nextTick(() => {
        $("#mapLegend").empty("");
        for (let i = 0; i < this.Layer.length; i++) {
          const layer = this.Layer[i];
          if (layer.isShowLegend) {
            $("#mapLegend").append(this.Layer[i].legendHtml);
          }
        }
      });
    },
  },
  watch: {
    basemapShows (newV) {
      const baseMaps = pngMe.earth.dataConfig.defaultMap.basemaps.map((bmap, bindex) => {
        bmap.options.visible = newV[bindex] || false
        return bmap
      })
      pngMe.earth.changeBasemap(baseMaps)
    }
  }
};
</script>

<style lang="less" scoped>
#zf-earth {
  position: relative;
  // background-image: url("../../assets/images/earth/map_bg.png");
  background-size: 100% 100%;

  /deep/ .widget-box {
    height: auto !important;
  }

  /deep/ .ol-zoom.ol-unselectable.ol-control {
    display: none;
  }

  .diit-map {
    // background: url(/static/img/map_bg.c514f50.png) no-repeat center center;
    width: 100%;
    height: 100%;
    position: relative;
    background-size: 100% 100%;
  }

  .toolbar-operation {
    position: absolute;
    top: 0.24rem;
    right: 1.5rem;
    z-index: 100;
    width: max-content;
    border-radius: 0.04rem;
    box-shadow: 0 0.01rem 0.03rem 0 rgba(0, 0, 0, 0.18);
  }

  .toolbar1 {
    position: absolute;
    bottom: 3rem;
    right: 0.2rem;
    z-index: 100;
    text-align: center;
    width: 0.5rem;
    box-shadow: 0 0.01rem 0.03rem 0 rgba(0, 0, 0, 0.18);
    border-radius: 0.04rem;
    overflow: hidden;
  }

  .toolbar2 {
    position: absolute;
    top: 1rem;
    box-shadow: 0 0.01rem 0.03rem 0 rgba(0, 0, 0, 0.18);
    border-radius: 0.04rem;
    overflow: hidden;
  }

  .toolbar3 {
    position: absolute;
    top: 0.24rem;
    background: transparent !important;
  }

  .map-baseMap {
    position: absolute;
    bottom: 0.4rem;
    z-index: 100;
    text-align: left;
  }

  .map-baseMapNoRight {
    right: 0.3rem;
    position: absolute;
    bottom: 0.2rem;
    z-index: 100;
    text-align: left;
  }

  .regionLocate {
    position: absolute;
    top: 0.24rem;
    background: #fff;
  }

  .toolLeftMore {
    .toolbar2,
    .toolbar3,
    .map-baseMap,
    .regionLocate {
      right: 0.24rem;
    }
  }

  .toolLeftMore {
    .toolbar2 {
      top: 0.2rem;
    }
  }

  .rightTool {
    position: absolute;
    bottom: 0.1rem;
    right: 0.1rem;
  }

  .toolRightMore {
    right: 3.4rem;
  }

  // /deep/ .ant-btn-group {
  //   display: inline-block;
  // }
}

/deep/ [data-v-5f34abfe] .toolbarclassVertical .ant-btn:hover {
  background-color: #e6f7ff;
}

.map-currentSpaceInfo {
  text-align: right;
}
.legendBtnBox {
  position: absolute;
  bottom: 150px;
  right: 20px;
  width: 40px;
  height: 30px;
  background: #ffffff;
  box-shadow: 0px 2px 5px 0px rgba(185, 185, 185, 0.88);
  text-align: center;
  line-height: 30px;
  cursor: pointer;
}

.legendBox {
  position: absolute;
  bottom: 140px;
  right: 20px;
  min-width: 240px;
  max-width: 310px;
  background: #ffffff;
  box-shadow: 0px 2px 5px 0px rgba(185, 185, 185, 0.88);
  padding: 10px 20px 10px 20px;

  .title {
    font-size: 20px;
    font-family: Microsoft YaHei, Microsoft YaHei-Bold;
    font-weight: 700;
    color: #3a3e43;
  }

  .stepName {
    margin: 10px 0 15px 0;
    font-size: 16px;
    font-family: Microsoft YaHei, Microsoft YaHei-Regular;
    color: #3a3e43;
  }

  .legendContent {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .line1 {
      width: 20px;
      height: 2px;
      background: #888e96;
      border-bottom: 1px solid #6c7074;
    }
    .line2 {
      width: 20px;
      height: 2px;
      background: #a0a6ae;
    }
    .line3 {
      width: 20px;
      height: 1px;
      background: #9aa2ac;
    }
    .river1 {
       width: 20px;
      height: 2px;
      background: #2271e8;
    }
    .river2 {
       width: 20px;
      height: 2px;
      background: #2286e8;
    }
    .rect{
      width: 20px;
      height: 20px;
      border: 2px solid #7fb7fc;
    }
    .legendItem {
      width: 50%;
      margin-bottom: 20px;
      text-align: left;
      font-weight: 400;
      font-size: 14px;
      .legendRenderBox {
        display: flex;
        align-items: center;
        .legendRenderItem {
          margin-right: 10px;
          display: inline-block;
          width: 20px;
          height: 20px;
        }
      }

      img {
        width: 16px;
      }
    }
  }
  .legendHeader {
    display: flex;
    justify-content: space-between;

    img {
      height: 20px;
      cursor: pointer;
    }
  }
}
</style>
