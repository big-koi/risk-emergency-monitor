<!-- 地震 -->
<template>
  <div class="task" style="width: 100%;height: 100%;">
    <!-- 左侧组件 -->
    <thematic-analysis v-if="thematicAnalysisLoad" :option="thematicOpt" @locate2="locate">
    </thematic-analysis>
    <!-- 地图 -->
    <zf-earth ref="earth" :class="{ 'hide-tool': isHideTool }" tool-left-more @onLoad="earthLoaded">
    </zf-earth>
    <resource-menu ref="resourceMenu"></resource-menu>
  </div>
</template>

<script>
import ThematicAnalysis from "../../components/ThematicAnalysis";
import ZfEarth from "../../components/Earth/Earth";
import _Uuid from "uuid";
import ResourceMenu from "../../components/rapidAnalysis/resourceMenu.vue";

const mark = require("../../assets/images/mark/mark.png");
// 地图实例
let earthMap = {}

export default {
  name: "task",
  components: { ZfEarth, ThematicAnalysis, ResourceMenu },
  data() {
    return {
      // 专题配置项
      thematicOpt: {},
      thematicAnalysisLoad: false,
      // 是否隐藏工具条
      isHideTool: false,
      locateMark: [],
      xzqdm: window.sessionStorage.getItem("xzqdm")
    }
  },
  mounted() {
    // 初始化 专题配置项
    this.initThematicOpt();
    let xzqdm = window.sessionStorage.getItem("xzqdm")
    sessionStorage.setItem('xzqdm', xzqdm || this.$route.query.xzqdm);
  },
  methods: {
    // 初始化 专题配置项
    initThematicOpt() {
      this.thematicOpt = {
        filter: {
          xzq: {
            label: '行政区'
          },
          selectTime: {
            label: '时间范围'
          },
        },
        list: {
          type: '1',
          info: {
            option: [
              [
                { label: '创建人', value: '--', labelSpan: '5', valueSpan: '10', valField: 'createUser' },
              ],
              [
                { label: '创建时间', value: '-', labelSpan: '5', valueSpan: '17', valField: 'createDate' },
              ],
              [
                { label: '开始时间', value: '-', labelSpan: '5', valueSpan: '17', valField: 'startDate' },
              ],
              [
                { label: '结束时间', value: '-', labelSpan: '5', valueSpan: '17', valField: 'endDate' },
              ],
              [
                { label: '分析区域', value: '-', labelSpan: '5', valueSpan: '17', valField: 'codeNames' },
              ],
            ]
          }
        },
        addModal: {
          type: '1',
          form: {
            inputName: {
              label: '评估过程名称',
            },
            selectTime: {
              label: '评估日期',
              placeholder: '请选择日期'
            },
          }
        },
        rapidAnalysis: {
          type: '1',
          steps: {
            name: ['致灾因子数据导入', '预警范围提取', '权重计算', '风险等级评估', '报告生成'],
            icon: ['', '', '', '', '']
          },
          form: {}
        },
        report: {
          type: '1',
        }
      };
      sessionStorage.setItem('rapidAnalysisOpt', JSON.stringify(this.thematicOpt.rapidAnalysis));
      sessionStorage.setItem('thematicReportOpt', JSON.stringify(this.thematicOpt.report));
      this.thematicAnalysisLoad = true;
    },
    locate(item) {
      // 定位点
      let pos = {
        lng: item.lng,
        lat: item.lat
      }
      this.common.addImage(earthMap, mark, _Uuid, pos, this.locateMark);
      earthMap.setZoom(5);
      me.earth.layerManager.clearSelectLayer();
      // 绘制
      let features = JSON.parse(sessionStorage.getItem("features"));
      me.earth.zoomToFeatures([features], {
        zoom: true,
        style: {
          lineColor: "red",
          fillColor: 'transparent'
        }
      });
      me.earth.map.getView().animate({ zoom: mapConfig.zoom * 1.5 || 9 });
      if (item.center) {
        earthMap.zoomToExtent(item.center);
      } else {
        earthMap.zoomToExtent([98.55, 34.32]);
      }
      // 设置级别
      // earthMap.zoomToExtent([119.51291666746599,31.10236111138379,120.60208333415025,31.99708333359757]);
    },
    earthLoaded(map) {
      earthMap = map
      earthMap.setZoom(5);
      if (this.xzqdm != '000000') {
        me.earth.layerManager.clearSelectLayer();
        // 绘制
        let features = JSON.parse(sessionStorage.getItem("features"));
        me.earth.zoomToFeatures([features], {
          zoom: true,
          style: {
            lineColor: "red",
            fillColor: 'transparent'
          }
        });
        // 设置级别
        me.earth.map.getView().animate({ zoom: mapConfig.zoom * 1.5 || 9 });
        let xzqRange = sessionStorage.getItem('xzqRange').split(',').map(Number)
        earthMap.zoomToExtent(xzqRange);
      } else {
        earthMap.zoomToExtent([98.55, 34.32]);
      }
    }
  }
}
</script>

<style scoped lang="less">
/deep/ #map-toolbar1 {
  display: none;
}

.hide-tool {

  /deep/ #map-toolbar,
  /deep/ .toolLeftMore {
    display: none;
  }
}
</style>
