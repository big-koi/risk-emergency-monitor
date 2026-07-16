<template>
  <div class="legend-wrap">
    <div v-show="IsShowText">
      <div class="diit-widget-btn">
        <a-button @click="onClick">
          <diit-icon
            type="tuli"
            class="toolIcon"
          />图例
        </a-button>
      </div>
    </div>
    <div v-show="!IsShowText">
      <a-tooltip
        :placement="point"
        title="图例"
      >
        <div class="diit-widget-btn">
          <a-button @click="onClick">
            <diit-icon
              type="tuli"
              class="toolIcon"
            />
          </a-button>
        </div>
      </a-tooltip>
    </div>

    <div
      class="test"
      v-if="visible && data.options.mode === 'panel' "
    >
      <div class="title">
        <div>
          <img
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAACEElEQVQ4T32STWtTQRSG3zO5H0kaqIIYsYgQulCqTTRcu6ngVwUjeGOUgi4FuxX8Bf4Y3URbk1QRbYJ2UcW0aYKWiIIa7cqNxRjb3EnuHLlXExoszmaGc+Y583EeSjzc2KVEKDqim40nKXLwd5zKcmTDcG4GqFtatSNvevHeTPGCMwaFIwR3vWqHXhERe8lEQVrsqjITvgqoa7V0+OV2mJJZHnZ1eZoJJuvUyKT05TtEipkpkZNzANsgvN8tm9aL6b2t/oneYqLI0a1fzgQxhTTdqFcu0ls/nm9F26zdA+MsQBVD8fTyleAnL0e9CvH5zRG4gUkwWBDWqmmz7uXOP+Whb5tyEeAkgFItbU55z+mD3qbj+faoCxpnhhCsVmqXQw0vnnzsHO1KzgGIEeE+eGtmAPThOeewKzAOhU4waBRfp6jZL6qwAOAAkbj1D5h80DzU1cw4CB0tbJQqU/TDA63ZdkwSFkA4KEjcHgCtRxyTUiaEgNCFUSlfos8+VHDGOi7nGBgFkFO6eaMPHnvG+9WmPOl9js6or2TMNf998xzuduVzgE8QsJhOm2e8dvmglW3tc4ygRXDDAcK7Vdv0TfHa4SjtLgPnANQ0E1crqeBHvx3J7PdhVx/6I4BBXzIX9HJfgLycBXMahA+RPaa1NEk/d1BOrFdtbWflSF2v2eGlAeX+K7nmzAQCVOxdfTv4G9bx8WzLFsNLAAAAAElFTkSuQmCC"
            alt
          />
          <span>图例</span>
        </div>
        <div
          class="cancel"
          @click="visible = false"
        >
          <img
            src="../../../../assets/images/mapSearch/close.png"
            alt
          />
        </div>
      </div>
      <div style="max-height: 200px;overflow:auto">
        <div v-for="(Layers, $layerIndex) in Layer">
          <div v-for="(item, $index)  in Layers.LegendArry">
            <div
              v-for="(legend, lindex) in item"
              class="leg-item"
            >
              <div class="lefticon">
                <div
                  class="widget-legend-img"
                  v-if="legend.img != null && legend.type !== 'Line'"
                >
                  <img :src="legend.img" />
                </div>
                <div
                  class="widget-legend-img"
                  v-if="legend.img == null && legend.color != null && legend.type !== 'Line'"
                >
                  <div
                    class="legend-color"
                    v-if="legend.type == 'Point'"
                    :style="'border-radius:18px;height:24px;width:24px;background:'+legend.color"
                  ></div>
                  <div
                    class="legend-color"
                    v-if="legend.type == 'LineString'"
                    :style="'margin-top:8px;height:6px;width:48px;background:'+legend.color"
                  ></div>
                  <div
                    class="legend-color"
                    v-if="legend.type == 'Polygon' || legend.type == null"
                    :style="'border:'+legend.border+';background:'+legend.color"
                  ></div>
                </div>
                <div v-if="legend.type === 'Line'">
                  <div class="line_legend">
                    <div
                      class="line"
                      :style=" 'background: linear-gradient(to bottom,' + legend.startcolor + ',' + legend.endcolor + ');'"
                    >
                    </div>
                    <div class="line-lable">
                      <div>{{legend.startlabel }}</div>
                      <div>{{legend.endlabel }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-if="legend.type !== 'Line'"
                class="widget-legend-txt"
              >{{ legend.label }}</div>
            </div>
          </div>
        </div>
      </div>
      <!--      <a-collapse v-model="activeKey" @change="collapseChange" accordion>-->
      <!--        <a-collapse-panel-->
      <!--          v-for="(Layers, $layerIndex) in Layer"-->
      <!--          :key="String($layerIndex)"-->
      <!--          :header="Layer[$layerIndex].name"-->
      <!--        >-->
      <!--          <a-Row v-for="(item, $index) in Layers.LegendArry" :key="$index">-->
      <!--            <a-Col span="8" v-for="(legend, lindex) in item" :key="lindex">-->
      <!--              <div class="widget-legend-img" v-if="legend.img != null">-->
      <!--                <img :src="legend.img" />-->
      <!--              </div>-->
      <!--              <div class="widget-legend-img" v-if="legend.img == null && legend.color != null">-->
      <!--                <div v-if="legend.type == 'Point'" :style="'border-radius:10px;height:36px;width:36px;background:'+legend.color"></div>-->
      <!--                <div v-if="legend.type == 'LineString'" :style="'margin-top:8px;height:5px;width:36px;background:'+legend.color"></div>-->
      <!--                <div v-if="legend.type == 'Polygon' || legend.type == null" :style="'height:36px;width:64px;background:'+legend.color"></div>-->
      <!--              </div>-->
      <!--              <div class="widget-legend-txt">{{ legend.label }}</div>-->
      <!--            </a-Col>-->
      <!--          </a-Row>-->
      <!--        </a-collapse-panel>-->
      <!--      </a-collapse>-->
    </div>
    <div class="diit-widget-drawer">
      <widgets-modal
        title="图例"
        :visible="visible && data.options.mode !== 'panel' "
        right="80px"
        top="100px"
        :modalProps="{
          width: '500px',
          mask: false,
          footer: null,
          bodyStyle: {
            maxHeight: '600px',
            overflow: 'auto',
          },
          wrapClassName: 'legend-drawer',
        }"
        @cancel="onClose"
      >
        <a-collapse @change="collapseChange">
          <a-collapse-panel
            v-if="Layer.length>0"
            v-for="(Layers, $layerIndex) in Layer"
            :key="String($layerIndex)"
            :header="Layer[$layerIndex].name"
          >
            <a-Row
              v-for="(item, $index) in Layers.LegendArry"
              :key="$index"
            >
              <a-Col
                span="8"
                v-for="(legend, lindex) in item"
                :key="lindex"
              >
                <div
                  class="widget-legend-img"
                  v-if="legend.img != null"
                >
                  <img :src="legend.img" />
                </div>
                <div
                  class="widget-legend-img"
                  v-if="legend.img == null && legend.color != null"
                >
                  <div
                    v-if="legend.type == 'Point'"
                    :style="'border-radius:10px;height:20px;width:20px;background:'+legend.color"
                  ></div>
                  <div
                    v-if="legend.type == 'LineString'"
                    :style="'margin-top:8px;height:5px;width:20px;background:'+legend.color"
                  ></div>
                  <div
                    v-if="legend.type == 'Polygon' || legend.type == null"
                    :style="'height:20px;width:20px;background:'+legend.color"
                  ></div>
                </div>
                <div class="widget-legend-txt">{{ legend.label }}</div>
              </a-Col>
            </a-Row>
          </a-collapse-panel>
        </a-collapse>
      </widgets-modal>
    </div>
  </div>
</template>
<script>
import WidgetsModal from "../../../WidgetsModal";
export default {
  name: "Legend",
  components: {
    WidgetsModal,
  },
  props: {
    data: {
      type: Object,
      default: {},
    },
  },
  // computed:{
  //   panleShow(){
  //     console.log(this.$store.state.tlPanleShow,'panleshow')
  //     return this.$store.state.tlPanleShow
  //   }
  // },
  // watch:{
  //   panleShow(){
  //     this.onClick()
  //   }
  // },
  data() {
    return {
      domId: this.data.domId,
      myMap: this.data.myMap,
      visible: false,
      activeKey: ["0"],
      Layer: [],
      LegendArry: [],
      point:
        this.data.options.position != undefined
          ? this.data.options.position
          : "left",
      IsShowText:
        this.data.options.IsShowText != undefined
          ? this.data.options.IsShowText
          : true,
      legendConfig: [],
    };
  },
  watch:{
    Layer(newnew){
      this.Layer = newnew
    }
  },
  mounted() {
    var that = this;
    that.myMap.eventManager.subscribe(
      that.myMap.eventManager.enumEventType.Map.AddLayerEvent,
      that.getLayer
    );
    that.myMap.eventManager.subscribe(
      that.myMap.eventManager.enumEventType.Map.RemoveLayerEvent,
      that.removeLayerEvent
    );
    that.myMap.eventManager.subscribe(
      that.myMap.eventManager.enumEventType.Map.ClearLayerEvent,
      that.getLayer
    );

    // that.myMap.eventManager.subscribe(
    //   that.myMap.eventManager.enumEventType.Widgets.TreeOnCheckEvent,
    //   (data)=> {
    //     that.onClick
    //   }
    // );
  },
  methods: {
    onClick() {
      console.log(this);
      var that = this;
      debugger
      this.myMap.currentTool = this;
      this.myMap.drawManager.clearDraw();
      this.myMap.measureManager.clearMeasure();
      let OperationLayers = that.myMap.layerManager.getOperationLayers();
      console.log(OperationLayers,'OperationLayers')
      if (OperationLayers.length <= 0) {
        //this.$message.error("请添加数据资源");
        return;
      }
      that.getLayer();
      that.myMap.eventManager.subscribe(
        that.myMap.eventManager.enumEventType.Map.AddLayerEvent,
        that.getLayer
      );
      that.myMap.eventManager.subscribe(
        that.myMap.eventManager.enumEventType.Map.RemoveLayerEvent,
        that.removeLayerEvent
      );
      that.myMap.eventManager.subscribe(
        that.myMap.eventManager.enumEventType.Map.ClearLayerEvent,
          that.getLayer()
      );
      that.visible = true;
    },
    onClose() {
      let that = this;
      this.visible = false;
      this.$store.state.tlPanleShow = false
    },
    removeLayerEvent() {
      let that = this;
      let OperationLayers = [];
      OperationLayers = that.myMap.layerManager.getOperationLayers();
      if (OperationLayers.length <= 0) {
        this.onClose();
      } else {
        this.getLayer();
      }
    },
    getLayer() {
      let that = this;
      let OperationLayers = that.myMap.layerManager.getOperationLayers();
      // console.log('-----OperationLayers--------')
      // console.log(OperationLayers);
      if (OperationLayers.length <= 0) {
        // this.$message.error("请添加数据资源");
        return;
      }
      that.Layer = [];
      for (let i = OperationLayers.length - 1; i >= 0; i--) {
        that.Layer.push(OperationLayers[i]);
        console.log(that.Layer, 'LAYER1')

        OperationLayers[i].name = OperationLayers[i].options.name;
        if (OperationLayers[i].options.legend) {
          OperationLayers[i].LegendArry = that.getLegendConfig(
            OperationLayers[i].options.legend
          );
        } else {
          let Layer = OperationLayers[i];
          Layer.options = Layer.options == undefined ? {} : Layer.options;
          let flag = false;
          if (Layer.options.jwServer != undefined) {
            flag = true;
          } else if (Layer.options.options != undefined) {
            try {
              let ops = JSON.parse(Layer.options.options);
              if (ops.jwServer) {
                flag = true;
              }
            } catch (error) {
              let ops = Layer.options.options;
              if (ops.jwServer) {
                flag = true;
              }
            }
          }
          if (flag) {
            that.getLegendJsonJw(OperationLayers[i]);
          } else {
            that.getLegendJson(OperationLayers[i]);
          }
        }
        console.log(that.Layer, 'LAYER2')
      }

    },
    getLegendConfig(legend) {
      const nl = [[]];
      if (legend == null || legend.length == 0) return nl;
      for (let i = 0; i < legend.length; i++) {
        const le = legend[i];
        if (nl[nl.length - 1].length < 3) {
          nl[nl.length - 1].push(legend[i]);
        } else {
          nl.push([legend[i]]);
        }
      }
      return nl;
    },
    getLegendJson(MapLayer) {
      let that = this;
      if (MapLayer.url == null || MapLayer.url == "") {
        return;
      }
      let url = MapLayer.url + "/legend?f=json&callback=?";
      if (
        that.myMap.dataConfig.apiConfig.apiIsProxy &&
        url.indexOf("proxy") == -1
      ) {
        url = that.myMap.dataConfig.apiConfig.proxyUrl + url;
      }
      let legendConf = that.legendConfig.filter(
        (lc) => lc.url == MapLayer.url
      )[0];
      if (legendConf != null) {
        MapLayer.LegendArry = legendConf.legend;
        return;
      }
      let legendAr = [];
      $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function (data) {
          that.LegendArry = [];
          // let legendJson = JSON.parse(data.substring(2, data.length - 2));
          data.layers = data.layers == null || data.layers == undefined ? [] : data.layers;
          let legendJson = data;
          for (let i = 0; i < legendJson.layers.length; i++) {
            for (let j = 0; j < legendJson.layers[i].legend.length; j++) {
              var imgurl =
                MapLayer.url +
                "/" +
                legendJson.layers[i].layerId +
                "/images/" +
                legendJson.layers[i].legend[j].url;
              if (
                that.myMap.dataConfig.apiConfig.apiIsProxy &&
                url.indexOf("proxy") == -1
              ) {
                imgurl = that.myMap.dataConfig.apiConfig.proxyUrl + imgurl;
              }
              let lg = {
                img: imgurl,
                label: legendJson.layers[i].legend[j].label,
              };

              legendAr.push(lg);
            }
          }
          let col = [];
          for (let x = 0; x < legendAr.length; x++) {
            let len = col.length;
            if (len != 0 && len % 3 == 0) {
              that.LegendArry.push(col);
              col = [];
              col.push(legendAr[x]);
            } else {
              col.push(legendAr[x]);
            }
          }
          if (col.length < 4) {
            that.LegendArry.push(col);
            col = [];
          }
          console.log(that.LegendArry,'arry')
          MapLayer.LegendArry = that.LegendArry;
          that.activeKey = ["0"];
        },
        error: function (xhr, textStatus, errorThrown) {
          console.error(xhr, "图例查询错误");
          console.error("请求状态：" + textStatus);
          console.error(errorThrown, "图例查询请求错误");
        },
      });
      $.get(url, function(data) {
        that.LegendArry = [];
        let legendJson = JSON.parse(data.substring(2, data.length - 2));
        for (let i = 0; i < legendJson.layers.length; i++) {
          for (let j = 0; j < legendJson.layers[i].legend.length; j++) {
            let lg = {
              img:
                MapLayer.url +
                "/" +
                legendJson.layers[i].layerId +
                "/images/" +
                legendJson.layers[i].legend[j].url,
              label: legendJson.layers[i].legend[j].label
            };
            legendAr.push(lg);
          }
        }
        let col = [];
        for (let x = 0; x < legendAr.length; x++) {
          if (col.length >= 3) {
            that.LegendArry.push(col);
            col = [];
          } else {
            col.push(legendAr[x]);
          }
        }
        if (col.length <= 3) {
          that.LegendArry.push(col);
          col = [];
        }
        console.log(that.LegendArry,'lg')
        MapLayer.LegendArry = that.LegendArry;
        that.activeKey = ["0"];
      });
    },

    getLegendJsonJw(MapLayer) {
      let that = this;
      if (MapLayer.url == null || MapLayer.url == "") {
        return;
      }

      let param = {
        layer: MapLayer,
      };

      that.myMap.jwAnalysisManager.getLegendJw(param, function (data) {
        // console.log(data);

        that.LegendArry = [];

        let legendAr = [];
        let legendJson = data;
        for (let i = 0; i < legendJson.legends.length; i++) {
          var imgurl = legendJson.legends[i].ico;

          let lg = {
            img: imgurl,
            label: legendJson.legends[i].name,
          };
          legendAr.push(lg);
        }
        let col = [];
        for (let x = 0; x < legendAr.length; x++) {
          let len = col.length;
          if (len != 0 && len % 3 == 0) {
            that.LegendArry.push(col);
            col = [];
            col.push(legendAr[x]);
          } else {
            col.push(legendAr[x]);
          }
        }
        if (col.length < 4) {
          that.LegendArry.push(col);
          col = [];
        }
        MapLayer.LegendArry = that.LegendArry;
        that.activeKey = ["0"];
      });
    },
    collapseChange(key) {},
  },
};
</script>
<style lang="less">
/deep/.ant-row {
  margin-top: 10px;
}
.line_legend {
  padding-left: 6px;
  display: flex;
  .line {
    width: 35px;
    background: red;
    height: 100px;
    border-radius: 3px;
  }
  .line-lable {
    padding-left: 8px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    div {
      white-space: nowrap;
    }
  }
}

.legend-wrap {
  position: relative;
  .test {
    display: none;
    position: absolute;
    top: 120%;
    right: 0;
    background: #fff;
    min-width: 120px;
    // z-index: 9999;
    //width: 500px;
    padding: 10px;
    .lefticon {
      margin-right: 10px;
    }
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 0 10px 0;
      span {
        color: var(--fontColor);
        font-size: 16px;
      }
      img {
        margin-right: 10px;
      }
      .cancel {
        color: var(--fontColor);
        font-size: 16px;
      }
    }
    .leg-item {
      display: flex;
      box-sizing: content-box;
      padding: 6px 0;
    }
    .widget-legend-img {
      width: 64px;
      height: 28px;
      overflow: hidden;
      // border-radius: 14px;
      img {
        display: block;
        width: 100%;
        height: 100%;
      }
      .legend-color {
        width: 64px;
        height: 28px;
      }
    }
    .widget-legend-txt {
      white-space: nowrap;
      min-width: 90px;
    }
  }
}

.legend-drawer {
  margin-top: 74px;
}
.legend-drawer {
  .ant-drawer-content-wrapper {
    margin: 50px 0px 0px 0px !important;
    background: linear-gradient(
      180deg,
      rgba(0, 50, 124, 0.91) 5%,
      rgba(0, 72, 158, 0.69) 93%
    );
    width: 380px !important;
  }
  .ant-drawer-content-wrapper,
  .ant-drawer-content,
  .ant-drawer-header,
  .ant-collapse-icon-position-left,
  .ant-collapse-content {
    background: var(--bgColor);
    color: var(--fontColor);
    font-size: 14px;
  }
  .ant-collapse > .ant-collapse-item > .ant-collapse-header,
  .ant-drawer-title,
  .ant-drawer-close {
    color: var(--fontColor);
  }
  .ant-drawer-body {
    overflow: auto;
    height: 500px;
    padding: 0px;
    margin-bottom: 10px;
    margin-top: 10px;
  }
  /*  .ant-collapse-content {
    margin-left: 15px;
    margin-right: 15px;
  } */
  .ant-drawer-header {
    margin-left: 10px;
    margin-right: 10px;
    border-bottom: 1px solid var(--bdColor);
    background: url("../../../../assets/images/mark.png") no-repeat 10px center;
    padding-left: 40px;
    .ant-drawer-title {
      color: var(--fontColor);
    }
  }
  .ant-collapse {
    background: transparent;
    /* border: 0px; */
  }
  .ant-col {
    display: flex;
    margin-bottom: 15px;
    .widget-legend-txt {
      margin-left: 10px;
      color: var(--fontColor);
      text-align: left;
      line-height: 28px;
    }
  }
  .ant-collapse-content {
    border-top: 1px solid var(--bdColor);
  }
  .widget-legend-txt {
    color: var(--fontColor);
  }
}
</style>
