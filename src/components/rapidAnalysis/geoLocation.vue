<template>
  <div
    class="map-toolbar geolocation-right-top-location"
    :class="showLeftTool ? 'map-toolbar-show' : ''"
    ref="geolocation-ref-wrapper"
  >
    <div
      ref="geolocation-ref-btn"
      class="toolabr-button"
      @click="_selectLocation"
    >
      <a-icon type="environment" />
      {{ locationName }}
      <a-icon type="down" />
    </div>
    <a-modal
      class="geolocation-panel"
      v-drag
      draggable="true"
      :width="modalWidth"
      :title="type == 'xzq' ? '行政区' : '流域'"
      :visible.sync="showPanel"
      :getContainer="() => $refs['geolocation-ref-wrapper']"
      :mask="false"
      :maskClosable="false"
      :closable="true"
      @cancel="closePanel"
      :footer="false"
      center
      :style="modalStyle"
    >
      <div class="switch">
        <a-switch @change="onSwitchChange" checked-children="行政区" un-checked-children="流域" default-checked />
        </div>
      <div class="top">
        <a class="btn-back" @click="_onBtnBackClick">返回</a>
        <div>
          地区：
          <span>
            {{ selected.province.code ? selected.province.name : "全国" }}
            {{
              selected.city.code && activeTab !== "province"
                ? "/" + selected.city.name
                : ""
            }}
            {{
              selected.county.code && activeTab === "county"
                ? "/" + selected.county.name
                : ""
            }}
          </span>
        </div>
      </div>
      <div class="ragion">
        <a-radio-group v-model="activeTab" @change="_onTabChange()">
          <a-radio-button label="province" value="province"
            >全国</a-radio-button
          >
          <a-radio-button
            label="city"
            value="city"
            :disabled="selected.province.code == null"
          >
            {{
              selected.province.name === ""
                ? `（${type == 'xzq' ? '城市' : '流域'}）`
                : selected.province["name-short"]
            }}
          </a-radio-button>
          <a-radio-button
            label="county"
            value="county"
            :disabled="selected.city.code == null"
          >
            {{
              selected.city.name === ""
                ? `（${type == 'xzq' ? '区县' : '水系'}）`
                : selected.city["name-short"]
            }}
          </a-radio-button>
        </a-radio-group>
      </div>
      <div class="list-province" v-if="type === 'xzq'" v-show="activeTab === 'province'">
        <dl
          class="region-select clearfix"
          v-for="alphabet in Object.keys(regions.province)"
          :key="alphabet"
        >
          <dt>{{ alphabet }}</dt>
          <dd>
            <a
              class="city-a"
              v-for="item in regions.province[alphabet] || []"
              :key="item.code"
              :title="item.name"
              :ad-code="item.code"
              @click="_onProvinceSelect(item)"
              :class="selected.province.code === item.code ? 'active' : ''"
              >{{ item["name-short"] }}</a
            >
          </dd>
        </dl>
      </div>
      <div class="list-province" v-else v-show="activeTab === 'province'">
        <dl
          class="region-select clearfix"
          v-for="alphabet in Object.keys(ly.province)"
          :key="alphabet"
        >
          <dt>{{ alphabet }}</dt>
          <dd>
            <a
              class="city-a"
              v-for="item in ly.province[alphabet] || []"
              :key="item.code"
              :title="item.name"
              :ad-code="item.code"
              @click="_onProvinceSelect(item)"
              :class="selected.province.code === item.code ? 'active' : ''"
              >{{ item["name-short"] }}</a
            >
          </dd>
        </dl>
      </div>
      <div class="list-city" v-show="activeTab === 'city'">
        <dl class="region-select clearfix">
          <dd>
            <a
              class="city-a"
              v-for="item in (type === 'xzq' ? regions : ly).regions[selected.province.code] || []"
              :key="item.code"
              :title="item.name"
              :ad-code="item.code"
              @click="_onCitySelect(item)"
              :class="selected.city.code === item.code ? 'active' : ''"
              >{{ item["name-short"] }}</a
            >
          </dd>
        </dl>
      </div>
      <div class="list-county" v-show="activeTab === 'county'">
        <dl class="region-select clearfix">
          <dd>
            <a
              class="city-a"
              v-for="item in (type === 'xzq' ? regions : ly).regions[selected.city.code] || []"
              :key="item.code"
              :title="item.name"
              :ad-code="item.code"
              @click="_onCountySelect(item)"
              :class="selected.county.code === item.code ? 'active' : ''"
              >{{ item["name-short"] }}</a
            >
          </dd>
        </dl>
      </div>
    </a-modal>
  </div>
</template>

<script>
// const { ol } = window;
const regionsJosn = require("@/../static/regions.json");
const lyJson = require("@/../static/config/json/ly.json");
export default {
  data() {
    return {
      type: 'xzq',
      diitMap: null,
      GEOJSON_BORDER_LAYER_ID: "LAYER_GEOJSON_BORDER",
      defaultFullExtent: [],
      fullExtent: [],
      locationCode: "100000",
      locationName: "全国",
      showPanel: false,
      activeTab: "province",
      selected: {
        province: { code: null, name: "", "name-short": "" },
        city: { code: null, name: "", "name-short": "" },
        county: { code: null, name: "", "name-short": "" }
      },
      regions: {
        province: {},
        regions: {}
      },
      ly: {
        province: {},
        regions: {}
      },
      addedFeatures: [],
      addedFeaturesOutside: []
    };
  },
  directives: {
    drag: {
      // 指令的定义
      bind: function(el) {
        let oDiv = el; // 当前元素
        // 禁止选择网页上的文字
        document.onselectstart = function() {
          return false;
        };
        const regex = /translate\((-?\d+px),\s*(-?\d+px)\)/;
        oDiv.onmousedown = function(e0) {
          const match = oDiv.style.transform.match(regex) || [, 0, 0];
          const x = parseInt(match[1], 10);
          const y = parseInt(match[2], 10);
          // 鼠标按下，计算当前元素距离可视区的距离
          let disX = e0.clientX - oDiv.offsetLeft;
          let disY = e0.clientY - oDiv.offsetTop;
          // 鼠标移动，元素跟随鼠标移动
          document.onmousemove = function(e) {
            // 通过事件委托，计算移动的距离
            let l = e.clientX - disX + x;
            let t = e.clientY - disY - 43 + y;
            // 边界处理
            l = Math.max(-1560, Math.min(l, 60));
            t = Math.max(-60, Math.min(t, 480));
            // 移动元素
            oDiv.style.transform = "translate(" + l + "px, " + t + "px)";
          };
          document.onmouseup = function(e) {
            document.onmousemove = null;
            document.onmouseup = null;
          };
          // return false不加的话可能导致黏连，就是拖到一个地方时div粘在鼠标上不下来，相当于onmouseup失效
          return false;
        };
      }
    }
  },
  props: {
    showLeftTool: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    _onLYSelect(item) {
      const vm = this;
      vm.locationCode = item["code"];
      vm.locationName = item["name"];

      vm.selected.province = item;
      vm.selected.city = { code: null, name: "", "name-short": "" };
      vm.selected.county = { code: null, name: "", "name-short": "" };
      vm.activeTab = "city";
      console.log('onLYSelect', item);
    },
    onSwitchChange (checked) {
      this.type = checked ? 'xzq' : 'ly'
      this._onBtnBackClick()
    },
    init() {
      const vm = this;
      vm.diitMap = me.earth;
      vm.defaultFullExtent = [
        64.87659296875,
        17.934666406250003,
        144.90100703125,
        53.39853359375
      ];
      vm.fullExtent = vm.defaultFullExtent;
      vm._loadRegionData();
    },
    _selectLocation() {
      const vm = this;
      vm.showPanel = true;
    },
    closePanel() {
      this.showPanel = false;
    },
    // _onPanelOpen() {
    //   const vm = this;
    //   // 指定弹窗初始显示位置
    //   const buttonDomRect = vm.$refs[
    //     "geolocation-ref-btn"
    //   ].getBoundingClientRect();
    //   const panelDom = document.querySelector(".geolocation-panel");
    //   panelDom.style.top = "0px";
    //   panelDom.style.left = `calc(${buttonDomRect.left}px - 50vw)`;
    // },
    _onTabChange() {
      const vm = this;
      let item = { code: "100000", name: "全国", "name-short": "全国" };
      switch (vm.activeTab) {
        case "province":
          if (vm.selected.province.code) {
            item = vm.selected.province;
          }
          vm.selected.city = { code: null, name: "", "name-short": "" };
          vm.selected.county = { code: null, name: "", "name-short": "" };
          break;
        case "city":
          if (vm.selected.city.code) {
            item = vm.selected.city;
          } else if (vm.selected.province.code) {
            item = vm.selected.province;
          }
          vm.selected.county = { code: null, name: "", "name-short": "" };
          break;
        case "county":
          if (vm.selected.county.code) {
            item = vm.selected.county;
          } else if (vm.selected.city.code) {
            item = vm.selected.city;
          } else if (vm.selected.province.code) {
            item = vm.selected.province;
          }
          break;
      }

      vm.locationCode = item["code"];
      vm.locationName = item["name"];

      vm._mapLocate(false);
    },
    _onProvinceSelect(item) {
      const vm = this;
      vm.locationCode = item["code"];
      vm.locationName = item["name"];

      vm.selected.province = item;
      vm.selected.city = { code: null, name: "", "name-short": "" };
      vm.selected.county = { code: null, name: "", "name-short": "" };
      vm.activeTab = "city";

      vm._mapLocate(false);
    },
    _onCitySelect(item) {
      const vm = this;
      vm.locationCode = item["code"];
      vm.locationName = item["name"];

      vm.selected.city = item;
      vm.selected.county = { code: null, name: "", "name-short": "" };
      vm.activeTab = "county";

      vm._mapLocate(false);
    },
    _onCountySelect(item) {
      const vm = this;
      vm.locationCode = item["code"];
      vm.locationName = item["name"];

      vm.selected.county = item;

      vm._mapLocate(false);
    },
    _onBtnBackClick(type = true) {
      const vm = this;
      let item = { code: "100000", name: "全国", "name-short": "全国" };
      vm.locationCode = item["code"];
      vm.locationName = item["name"];

      vm.selected = {
        province: { code: null, name: "", "name-short": "" },
        city: { code: null, name: "", "name-short": "" },
        county: { code: null, name: "", "name-short": "" }
      };

      vm.activeTab = "province";
      if (type) {
        vm._mapLocate(false);
      }
      // 向外暴露返回操作事件
      vm.$emit("backClick");
    },
    _loadRegionData() {
      this.regions = regionsJosn;
      this.ly = lyJson;
    },
    addGeoJsonBorderLayersOutside (list) {
      const codeList = list.map(v => v.code)
      codeList.forEach(code => this.mapLocate(code, true, false))
    },
    /**
     * 对外接口：传入行政区代码 ,是否显示边界
     * this.$refs.geoLocation.mapLocate('100000')
     */
    mapLocate(adCode, showborder = false, zoom = false) {
      const vm = this;
      let locationName = null;
      if (/^[A-Za-z]/.test(adCode)) {
        let url = `${window.servicesConfig.servicesUrl}/v1/sysRegion/getGeoJsonByCode?code=${adCode}`
        $.get(url).then(function(res) {
          const data = res;
          const geojson = data.features[0];
          const extent = me.earth.getGeometryExtent(geojson.geometry);
          vm._removeGeoJsonBorderLayers();
          if (zoom) {
            me.earth.zoomToExtent(extent);
            vm.addedFeatures.push(
              me.earth.zoomToFeatures([geojson], {
                zoom: zoom,
                style: {
                  lineColor: "#0000FF",
                  lineWidth: showborder ? 5 : 0,
                  fillColor: "rgba(255, 255, 0, 0)"
                }
              })
            );
          } else {
            vm.addedFeaturesOutside.push(
              me.earth.zoomToFeatures([geojson], {
                zoom: zoom,
                style: {
                  lineColor: "#0000FF",
                  lineWidth: showborder ? 5 : 0,
                  fillColor: "rgba(255, 255, 0, 0)"
                }
              })
            );
          }
          if (updateFullExtent) {
            vm.fullExtent = extent;
          }
        })
      } else {
        if (adCode === "100000") {
          locationName = "全国";
        } else if (adCode.substr(-4) === "0000") {
          // 省
          let provinces = [];
          Object.keys(vm.regions.province).forEach(alphabet => {
            provinces = provinces.concat(vm.regions.province[alphabet]);
          });
          let region = provinces.filter(i => i.code === adCode)[0];
          if (region) {
            locationName = region.name;
          }
        } else if (adCode.substr(-2) === "00") {
          // 市
          let region = vm.regions.regions[adCode.substr(0, 2) + "0000"].filter(
            i => i.code === adCode
          )[0];
          if (region) {
            locationName = region.name;
          }
        } else {
          // 县
          let region = vm.regions.regions[adCode.substr(0, 4) + "00"].filter(
            i => i.code === adCode
          )[0];
          if (region) {
            locationName = region.name;
          }
        }
        if (locationName != null) {
          vm.locationCode = adCode;
          vm.locationName = locationName;
          vm._mapLocate(false, showborder, zoom, adCode);
        } else {
          vm.$message({
            type: "error",
            message: "行政区代码“" + adCode + "”定位失败"
          });
        }
      }

    },
    resetExtent() {
      // const vm = this
      // this.diitMap.getView().fit(vm.fullExtent, { size: vm.diitMap.getSize(), duration: 1000 })
      // // 向外暴露全幅操作事件
      // this._removeGeoJsonBorderLayers()
      this._onBtnBackClick();
      this.showPanel = false;
      // this.$emit('resetExtent')
    },
    _mapLocate(updateFullExtent, showborder = true, zoom = true, code) {
      const vm = this;
      const locationCode = code || vm.locationCode
      if (locationCode === "100000") {
        // 全国范围情形：不显示边框
        me.earth.zoomToExtent(vm.defaultFullExtent);
        // vm.diitMap
        //   .getView()
        //   .fit(vm.defaultFullExtent, {
        //     size: vm.diitMap.getSize(),
        //     duration: 1000
        //   });
        vm._removeGeoJsonBorderLayers();
      } else if (vm.type == "ly") {
        let url = `${window.servicesConfig.servicesUrl}/v1/sysRegion/getGeoJsonByCode?code=${locationCode}`
        $.get(url).then(function(res) {
          const data = res;
          const geojson = data.features[0];
          const extent = me.earth.getGeometryExtent(geojson.geometry);
          vm._removeGeoJsonBorderLayers();
          if (zoom) {
            me.earth.zoomToExtent(extent);
            vm.addedFeatures.push(
              me.earth.zoomToFeatures([geojson], {
                zoom: zoom,
                style: {
                  lineColor: "#0000FF",
                  lineWidth: showborder ? 5 : 0,
                  fillColor: "rgba(255, 255, 0, 0)"
                }
              })
            );
          } else {
            vm.addedFeaturesOutside.push(
              me.earth.zoomToFeatures([geojson], {
                zoom: zoom,
                style: {
                  lineColor: "#0000FF",
                  lineWidth: showborder ? 5 : 0,
                  fillColor: "rgba(255, 255, 0, 0)"
                }
              })
            );
          }
          if (updateFullExtent) {
            vm.fullExtent = extent;
          }
        })

      } else {
        if (
          locationCode.substr(-4) === "0000" ||
          locationCode.substr(-2) === "00"
        ) {
          // 省市县行政区情形：显示行政区边框并缩放到对应范围
          let url = `${location.origin}${location.pathname}static/adArea/${locationCode}.json`;
          $.get(url).then(function(res) {
            const data = res.features[0];
            const extent = me.earth.getGeometryExtent(data.geometry);
            vm._removeGeoJsonBorderLayers();
            if (zoom) {
              me.earth.zoomToExtent(extent);
              vm.addedFeatures.push(
                me.earth.zoomToFeatures([data], {
                  zoom: zoom,
                  style: {
                    lineColor: "#ff579b",
                    lineWidth: showborder ? 5 : 0,
                    fillColor: "rgba(255, 255, 0, 0)"
                  }
                })
              );
            } else {
              vm.addedFeaturesOutside.push(
                me.earth.zoomToFeatures([data], {
                  zoom: zoom,
                  style: {
                    lineColor: "#FFA000",
                    lineWidth: showborder ? 5 : 0,
                    fillColor: "rgba(255, 255, 0, 0)"
                  }
                })
              );
            }
            if (updateFullExtent) {
              vm.fullExtent = extent;
            }
          });
        } else {
          let shicode = locationCode.substr(0, 4) + "00";
          // 省市县行政区情形：显示行政区边框并缩放到对应范围
          let url = `${location.origin}${location.pathname}static/adArea/xian/${shicode}.json`;
          $.get(url).then(function(res) {
            const data = res;
            let xianindex = data.features.findIndex(
              i => i.properties.id === locationCode
            );
            if (xianindex > -1) {
              const geojson = data.features[xianindex];
              const extent = me.earth.getGeometryExtent(geojson.geometry);
              vm._removeGeoJsonBorderLayers();
              if (zoom) {
                me.earth.zoomToExtent(extent);
                vm.addedFeatures.push(
                  me.earth.zoomToFeatures([geojson], {
                    zoom: zoom,
                    style: {
                      lineColor: "#ff579b",
                      lineWidth: showborder ? 5 : 0,
                      fillColor: "rgba(255, 255, 0, 0)"
                    }
                  })
                );
              } else {
                vm.addedFeaturesOutside.push(
                  me.earth.zoomToFeatures([geojson], {
                    zoom: zoom,
                    style: {
                      lineColor: "#FFA000",
                      lineWidth: showborder ? 5 : 0,
                      fillColor: "rgba(255, 255, 0, 0)"
                    }
                  })
                );
              }
              if (updateFullExtent) {
                vm.fullExtent = extent;
              }
            } else {
              console.log(" 缺少县级数据:>> ", shicode);
            }
          });
        }
      }
    },
    _removeGeoJsonBorderLayers() {
      const selectedLayer = me.earth.layerManager.getSelectedLayer();
      me.earth.layerManager.removeFeatures(selectedLayer, this.addedFeatures);
      this.addedFeatures = [];
    },
    _removeGeoJsonBorderLayersOutside() {
      const selectedLayer =
        (me.earth.layerManager && me.earth.layerManager.getSelectedLayer()) ||
        null;
      if (!selectedLayer) return;
      me.earth.layerManager.removeFeatures(
        selectedLayer,
        this.addedFeaturesOutside
      );
      this.addedFeaturesOutside = [];
    }
  },
  computed: {
    modalWidth() {
      return (this.type == 'ly') ? '500px' : '300px'
    },
    modalStyle() {
      return {
        '--modal-right': (this.type == 'ly') ? '380px' : '180px'
      }
    }
  },
  mounted: function() {
    const vm = this;
    vm.init();
  },
  beforeDestroy: function() {}
};
</script>

<style scoped lang="less">
.geolocation-panel {
  /deep/.ant-modal-wrap {
    --fontColor: #fff;
    top: unset !important;
    bottom: unset !important;
    right: unset !important;
    left: unset !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible;
    text-align: start;

    .ant-modal-header {
      background: #0072cb;
      height: 46px;
      border-top-left-radius: 4px !important;
      border-top-right-radius: 4px !important;
      padding: 12px 16px;

      .ant-modal-title {
        color: #ffffff;
      }
    }

    .ant-modal-body {
      padding: 10px !important;
      background: rgba(0, 58, 133, 1);
      color: #ffffff;
    }

    .ant-modal-close-x {
      width: 42px;
      height: 46px;
      color: #ffffff;
    }
  }
}

.map-toolbar {
  background: #0072cb;
  border-radius: 4px;
  cursor: pointer;
  position: fixed;
  top: 0.86rem;
  right: 0.5rem;
}
.map-toolbar-show {
  right: 5.72rem;
}

.geolocation-right-top-location {
  min-width: 120px;
  height: 42px;
  margin-right: 10px;
  color: #fff;
  text-align: center;
  margin-right: 10px;

  .toolabr-button {
    line-height: 42px;
  }

  /deep/.ant-modal {
    transform-origin: unset !important;
    top: unset !important;
    right: var(--modal-right) !important;
  }
}

.geolocation-panel .region-select dt {
  line-height: 20px;
}

.geolocation-panel .region-select dd {
  display: flex;
  flex-wrap: wrap;
  line-height: 20px;
}

.geolocation-panel .region-select dd > a {
  margin-left: 10px;
  padding: 1px 5px;
  border-radius: 5px;
  color: #ffff;
}

.geolocation-panel .region-select dd > a.active {
  background-color: #d8edff;
  color: #006cbf;
  border-radius: 2px;
  font-weight: bold;
}

.geolocation-panel .top > * {
  line-height: 20px;
}

.geolocation-panel .top > .btn-back {
  float: right;
}

.toolabr-button:hover {
  color: #65fdfd;
}
</style>
