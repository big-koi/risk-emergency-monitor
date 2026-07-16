<template>
  <!-- prohibit -->
  <div
    :class="stepOperation ? 'simulationResult' : 'simulationResult prohibit'"
  >
    <a-spin class="spin" :spinning="spinshow" :tip="loadingTip">
      <!-- 操作行 -->
      <div class="operationBox">
        <div
          class="operationItem operationItemFlex"
          v-if="stepData.status == 1"
        >
          <a-tree-select
            style="width: 1.2rem; margin-right: 0.04rem"
            class="region-selecter"
            v-model="selectedRegions"
            :tree-data="regionTreeData"
            tree-checkable
            :treeCheckStrictly="true"
            multiple
            :show-checked-strategy="SHOW_ALL"
            search-placeholder="行政区划选择"
            placeholder="行政区划"
          />
          <a-cascader
            v-model="startTime"
            style="width: 1.5rem"
            :options="options"
            placeholder="开始时间"
            @change="onTimeChange"
          />
          <span style="margin: 0.04rem">-</span>
          <a-cascader
            v-model="endTime"
            style="width: 1.5rem"
            :options="options"
            placeholder="结束时间"
            @change="onTimeChange"
          />
          <div class="operationBtn" @click="exportPNGZip">
            <img src="../../assets/images/thematic/zip-export.png" />
            导出图片
          </div>
        </div>
        <div
          class="operationBtn"
          @click="simulationCalculate"
          v-if="stepFinish != 4"
        >
          <img src="../../assets/images/thematic/model-icon.png" />
          开始评估
        </div>
      </div>
      <div class="renderGrade">
        <div>
          渲染分级
          <!-- <img @click="showTips" src="../../assets/images/thematic/question.png" /> -->
        </div>
        <div class="edit" @click="editChange" v-if="stepFinish != 4">
          <img
            src="../../assets/images/thematic/edit-icon.png"
            v-if="!isEdit"
          />
          <div v-if="!isEdit">编辑</div>
          <img src="../../assets/images/rapidAnalysis/save.png" v-if="isEdit" />
          <div v-if="isEdit">保存</div>
        </div>
      </div>
      <div class="gradeTitle">积水深度(m)</div>
      <div class="gradeBox">
        <div class="gradeItem" v-for="(item, index) in ponding" :key="index">
          <div class="colorCard" :style="'background:' + item.color"></div>
          <div class="gradeValue" v-if="index < ponding.length - 1">
            <a-input v-model="item.startValue" :disabled="!isEdit" />
            <div>-</div>
            <a-input
              v-model="ponding[index + 1].startValue"
              :disabled="!isEdit"
            />
          </div>
          <div class="gradeValue" v-else>
            <div>></div>
            <a-input v-model="item.startValue" :disabled="!isEdit" />
          </div>
        </div>
      </div>
      <div
        class="template-png-wrapper"
        id="template-png-wrapper"
        v-if="showPNGWrapper"
      >
        <div class="left-map-box">
          <div class="map-x-top">
            <div class="x-title">
              <span
                class="x-title-text"
                v-for="(item, index) in xList"
                :key="index"
                >{{ item }}东</span
              >
            </div>
            <div class="x-scale">
              <span
                class="x-scale-item"
                v-for="(item, index) in xList"
                :key="index"
              >
              </span>
            </div>
          </div>
          <div class="map-y-left">
            <div class="y-title">
              <span
                class="y-title-text"
                v-for="(item, index) in yList"
                :key="index"
                >{{ item }}北</span
              >
            </div>
            <div class="y-scale">
              <div
                class="y-scale-item"
                v-for="(item, index) in yList"
                :key="index"
              ></div>
            </div>
          </div>
          <div class="map-box">
            <zf-earth
              ref="earth"
              @onLoad="earthLoaded"
              :showMapTool="false"
              :legendShow="false"
              :basemapShows="basemapShows"
            >
            </zf-earth>
          </div>
          <div class="map-y-right">
            <div class="y-scale">
              <div
                class="y-scale-item"
                v-for="(item, index) in yList"
                :key="index"
              ></div>
            </div>
            <div class="y-title">
              <span
                class="y-title-text"
                v-for="(item, index) in yList"
                :key="index"
                >{{ item }}北</span
              >
            </div>
          </div>
          <div class="map-x-bottom">
            <div class="x-scale">
              <span
                class="x-scale-item"
                v-for="(item, index) in xList"
                :key="index"
              >
              </span>
            </div>
            <div class="x-title">
              <span
                class="x-title-text"
                v-for="(item, index) in xList"
                :key="index"
                >{{ item }}东</span
              >
            </div>
          </div>
        </div>
        <div class="right-info-box">
          <div class="png-title">
            <p class="date">{{ currentDate }}</p>
            <p class="name">{{ currentRegionName }}内涝积水分布</p>
          </div>
          <div class="map-label-box">
            <p class="time">{{ currentTime }}，</p>
            <p class="name">最大积水深度</p>
            <p class="value">{{ currentMaxDepth }}m</p>
          </div>
          <div class="legend-box">
            <div class="legend-level">
              <p class="title">积水深度(米)</p>
              <div
                class="level-item"
                v-for="(item, index) in legendInfo"
                :key="index"
              >
                <div
                  class="color"
                  :style="{ 'background-color': item.color }"
                ></div>
                <span class="value">{{ item.value }}</span>
              </div>
            </div>
            <div class="legend-info">
              <div class="info-item region">
                <div class="color"></div>
                <span class="value">{{ currentRegionName }}</span>
              </div>
              <div class="info-item water">
                <div class="color"></div>
                <span class="value">水体</span>
              </div>
              <div class="info-item zone">
                <div class="color"></div>
                <span class="value">区界</span>
              </div>
            </div>
          </div>
        </div>
        <div class="label-line"></div>
      </div>
    </a-spin>
    <!-- 提示弹窗 -->
    <a-modal
      centered
      title="渲染分级提示 "
      :visible="tipModal"
      :footer="null"
      @cancel="handleCancel"
      :closeIcon="
        h =>
          h('a-icon', {
            props: {
              type: 'close-circle' // 样式
            },
            style: {
              color: '#fff' // 背景色
            }
          })
      "
      wrapClassName="tipModal"
    >
      <div class="tips">请注意，分段为左开右闭区间，需要保证间断点的连续！</div>
      <div class="ruleBox">
        <div class="ruleItem" v-for="(item, index) in ponding" :key="index">
          <template v-if="index != ponding.length - 1">
            <div class="ruleItemLeft">{{ item.startValueDefault }}</div>
            <div>&lt;</div>
            <div class="ruleItemCenter">a</div>
            <div>≤</div>
            <div class="ruleItemRight">{{ item.endValueDefault }}</div>
          </template>
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script>
import moment from "moment";
import {
  simulationCalculate,
  getSimulationResultData,
  getSimulationResultLineData,
  exportResultMaxDepthExcel,
  getRegionTreeData,
  getComputeStatus,
  getThirdStepImage,
  exportThirdStepImage
} from "@/api/rapidAnalysis/index.js";
import diitgis from "@/components/Layer/LayerManagerForDiitGIS";
import ZfEarth from "../Earth/pngEarth.vue";
import domtoimage from "dom-to-image";
import { TreeSelect } from 'ant-design-vue';
const SHOW_ALL = TreeSelect.SHOW_ALL;
export default {
  props: {
    stepData: {
      type: Object,
      default: null
    },
    regions: {
      type: Array,
      default: []
    },
    basemapShows: {
      type: Array,
      default: []
    }
  },
  components: { ZfEarth },
  computed: {
    regionTreeData () {
      return this.buildRegionTree(this.regions);
    }
  },
  data() {
    return {
      SHOW_ALL,
      earthMap: {},
      stepFinish: "",
      stepOperation: true,
      spinshow: false,
      tipModal: false,
      isEdit: false,
      ponding: [
        {
          color: "rgb(59, 157, 255)",
          startValue: "0.1",
          startValueDefault: 0,
          endValueDefault: 0.447
        },
        {
          color: "rgb(8, 8, 255)",
          startValue: "0.27",
          startValueDefault: 0.447,
          endValueDefault: 0.551
        },
        {
          color: "rgb(231, 255, 74)",
          startValue: "0.5",
          startValueDefault: 0.551,
          endValueDefault: 0.587
        },
        {
          color: "rgb(255, 166, 0)",
          startValue: "1.0",
          startValueDefault: 0.587,
          endValueDefault: 0.681
        },
        {
          color: "rgb(255, 0, 0)",
          startValue: "2.0",
          startValueDefault: 0.681,
          endValueDefault: 1
        },
        {
          color: "rgb(76, 0, 115)",
          startValue: "3.0",
          startValueDefault: 0,
          endValueDefault: 0.447
        }
      ],
      lineXais: [],
      regionOptionsAll: [],
      maxAccWater: [],
      timer: null,
      timeListAll: [],
      startTime: [],
      endTime: [],
      options: [],
      pngList: [],
      loadingTip: "loading",
      showPNGWrapper: false,
      yList: [],
      xList: [],
      legendInfo: [],
      scaleList: [4850, 9700, 19400],
      currentRegionName: "",
      currentTime: "07月20日08时",
      currentMaxDepth: 0,
      currentDate: "2023年1月1日",
      base64pngList: [],
      addedBorderFeatures: {},
      selectedRegions: []
    };
  },
  watch: {
    stepData() {
      this.getTimeRange()
    }
  },
  mounted() {
    this.showPNGWrapper = true;
    let taskInfo = JSON.parse(sessionStorage.getItem("taskInfo"));
    this.stepFinish = taskInfo.step;
    if (taskInfo.step < 2) {
      this.stepOperation = false;
    }
    if (this.stepData.status == 1) {
      let taskInfo = JSON.parse(sessionStorage.getItem("taskInfo"));
      taskInfo.color_levels.map((item, index) => {
        this.ponding[index].startValue = item;
      });
      // this.getSimulationResultData();
      this.getRegionTreeDataAll();
      // this.$parent.structureTimeLine();
    }
    const legendInfo = [];
    for (let i = 0; i < this.ponding.length; i++) {
      if (i == this.ponding.length - 1) {
        legendInfo.push({
          value: `> ${this.ponding[i].startValue}`,
          color: this.ponding[i].color
        });
      } else {
        legendInfo.push({
          value: `${this.ponding[i].startValue} - ${
            this.ponding[i + 1].startValue
          }`,
          color: this.ponding[i].color
        });
      }
    }
    this.legendInfo = legendInfo;
  },
  activated() {
    let taskInfo = JSON.parse(sessionStorage.getItem("taskInfo"));
    this.stepFinish = taskInfo.step;
    if (taskInfo.step < 2) {
      this.stepOperation = false;
    }
    if (this.stepData.status == 1) {
      // this.getSimulationResultData();
      this.getRegionTreeDataAll();
      this.$parent.$refs.timeAxis.structureTimeLine();
      this.getTimeRange();
    }
  },
  methods: {
    // 生成行政区树
    buildRegionTree(data) {
      // 构建一个以省份为根的树形结构
      const tree = data.reduce((accum, item) => {
        const { province, city, county, code } = item;

        // 为省份创建一个节点
        if (!accum[province]) {
          accum[province] = {
            title: province,
            value: code.substr(0,2) + '0000',
            key: code.substr(0,2) + '0000',
            children: []
          };
        }

        // 为城市创建一个节点
        if (!accum[city]) {
          accum[city] = {
            title: city,
            value: code.substr(0,4) + '00',
            key: code.substr(0,4) + '00',
            children: []
          };
          accum[province].children.push(accum[city]);
        }

        // 为县/市创建一个节点
        const countyNode = {
          title: county,
          value: code,
          key: code
        };
        accum[city].children.push(countyNode);

        return accum;
      }, {});
      return Object.values(tree).filter(t => t.value.endsWith('0000'))
    },
    // 导出图片
    printImg(fileName) {
      const vm = this
      let mapDiv = "template-png-wrapper";
      let width = 1100,
        height = 780;
      var exportOptions = {
        filter: (element) => {
          return true;
        },
        width: Number(width),
        height: Number(height)
      };
      var node = document.getElementById(mapDiv);
      // 是否是火狐  ，火狐内核Gecko
      var isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
      if (isFirefox) {
        domtoimage.draw(node, exportOptions).then(() => {
          domtoimage.toPng(node).then(dataURL => {
            vm.base64pngList.push({
              filename: fileName,
              base64str: dataURL
            });
          }).catch(e => {
            console.log(e);
          });
        });
      } else {
        domtoimage.toPng(node).then(dataURL => {
          vm.base64pngList.push({
            filename: fileName,
            base64str: dataURL
          });
        }).catch(e => {
          console.log(e);
        });
      }
    },
    // 地图加载
    earthLoaded(map) {
      this.earthMap = map;
      this.earthMap.setZoom(5);
      // this.earthMap.zoomToExtent([98.55, 34.32]);
    },
    // 点击导出
    exportPNGZip() {
      const vm = this;
      vm.pngList = [];
      vm.base64pngList = [];
      if (this.startTime.length == 0 || this.endTime.length == 0) {
        this.$message.error("请选择时间范围");
        return;
      }
      // 获取 格式化后的时间序列
      const dates = this.generateTimeSequence(
        this.startTime[1],
        this.endTime[1]
      );
      this.spinshow = true;
      // 请求图片信息
      dates.forEach(date => {
        const param = {
          pageNum: 1,
          pageSize: 10,
          taskId: this.$route.query.taskId,
          seq: false,
          code: "",
          date: date.time
        };
        getSimulationResultData(param)
          .then(res => {
            if (res.code == 200) {
              vm.pngList.push({
                date: date,
                pngInfo: res.data.pngIds,
                pageData: res.data.pageData,
              });
            } else {
              vm.pngList.push({
                date: date,
                pngInfo: []
              });
            }
            // 加载状态
            vm.loadingTip = `正在获取图片信息（${vm.pngList.length} / ${dates.length}）`;
            // 全部获取完成
            if (vm.pngList.length == dates.length) {
              vm.loadingTip = "loading";
              vm.spinshow = false;
              vm.setTemplatePngs(vm.pngList);
            }
          })
          .catch(err => {
            console.log(err);
            vm.pngList.push({
              date: date,
              pngInfo: []
            });
          });
      });
    },
    // 延时函数
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    generateInfo (data, code) {
      const record = data.pageData.records.find(r => r.code == code)
      if (!record) return ''
      this.currentRegionName = (record.county && record.county !== '--') ? record.county
        : (record.city && record.city !== '--') ? record.city
        : (record.province && record.province !== '--') ? record.province : ''
      const [month, day, hour] = data.date.time.split("/");
      this.currentTime = `${month}月${day}日${hour}时`
      this.currentMaxDepth = record.depth
      this.currentDate = `${data.date.year}年${month}月${day}日`
      return `${data.date.year}年${month}月${day}日${hour}时${this.currentRegionName}内涝积水分布.png`
    },
    // 移除边界
    removeGeoJsonBorderLayers() {
      if (!this.addedBorderFeatures['ol_uid']) return
      const selectedLayer = pngMe.earth.layerManager.getSelectedLayer();
      selectedLayer.myLayer.getSource().removeFeature(this.addedBorderFeatures)
      this.addedBorderFeatures = {};
    },
    // 添加边界
    addBorder (code) {
      const vm = this
      if ( code.substr(-4) === "0000" || code.substr(-2) === "00" ) {
          // 省市县行政区情形：显示行政区边框并缩放到对应范围
          let url = `${location.origin}${location.pathname}static/adArea/${code}.json`;
          $.get(url).then(function(res) {
            const data = res.features[0];
            // const extent = pngMe.earth.getGeometryExtent(data.geometry);
            vm.removeGeoJsonBorderLayers();
            // pngMe.earth.zoomToExtent(extent);
            vm.addedBorderFeatures = pngMe.earth.zoomToFeatures([data], {
              zoom: true,
              style: {
                lineColor: "#FF0000",
                lineWidth: 4,
                fillColor: "rgba(255, 255, 0, 0)"
              }
            })
          });
        } else {
          let shicode = code.substr(0, 4) + "00";
          // 省市县行政区情形：显示行政区边框并缩放到对应范围
          let url = `${location.origin}${location.pathname}static/adArea/xian/${shicode}.json`;
          $.get(url).then(function(res) {
            const data = res;
            let xianindex = data.features.findIndex(
              i => i.properties.id === code
            );
            if (xianindex > -1) {
              const geojson = data.features[xianindex];
              // const extent = pngMe.earth.getGeometryExtent(geojson.geometry);
              vm.removeGeoJsonBorderLayers();
              // pngMe.earth.zoomToExtent(extent);
              vm.addedBorderFeatures = pngMe.earth.zoomToFeatures([geojson], {
                zoom: true,
                style: {
                  lineColor: "#FF0000",
                  lineWidth: 4,
                  fillColor: "rgba(255, 255, 0, 0)"
                }
              })
            } else {
              console.log(" 缺少县级数据:>> ", shicode);
            }
          });
        }
    },
    // 行政区过滤
    regionFilter (code) {
      let res = false
      if (this.selectedRegions.length === 0) {
        res = true
      } else {
        const filterCodes = this.selectedRegions.map(v => v.value)
        if (code.endsWith("0000")) {
          res = filterCodes.includes(code)
        } else if (code.endsWith("00")) {
          const provCode = code.substr(0,2) + '0000'
          res = filterCodes.includes(provCode) || filterCodes.includes(code)
        } else {
          const provCode = code.substr(0,2) + '0000'
          const shiCode = code.substr(0,4) + '00'
          res = filterCodes.includes(provCode) || filterCodes.includes(shiCode) || filterCodes.includes(code)
        }
      }
      return res
    },
    // 异步处理单个pngInfo项
    async processPngInfo(data) {
      const vm = this
      const pngInfos = data.pngInfo
      for (const pngInfo of pngInfos) {
      // for (let index = 0; index < pngInfos.length; index++) {
        // const code = pngInfos[index].code
        const code = pngInfo.code
        if (vm.regionFilter(code)) {
          vm.addBorder(code)
          const fileName = vm.generateInfo(data, code)
          if (fileName) {
            // const pngInfo = pngInfos[index]
            const boxArr = pngInfo.box.split(",");
            const url =
              window.servicesConfig.servicesUrl +
              "/v1/resultSource/assets?id=" +
              pngInfo.id;
            const imageExtent = [
              Number(boxArr[0]),
              Number(boxArr[1]),
              Number(boxArr[2]),
              Number(boxArr[3])
            ];
            // pngMe.earth.zoomToExtent(imageExtent);
            const xTicks = vm.generateTicks(Number(boxArr[0]), Number(boxArr[2]), 7);
            const yTicks = vm.generateTicks(Number(boxArr[1]), Number(boxArr[3]), 6);
            vm.xList = xTicks.map(tick => {
              const dms = vm.toDMS(tick);
              const { degrees, minutes, seconds } = dms;
              return `${degrees}°${minutes}'${seconds}"`;
            });
            vm.yList = yTicks.map(tick => {
              const dms = vm.toDMS(tick);
              const { degrees, minutes, seconds } = dms;
              return `${degrees}°${minutes}'${seconds}"`;
            });
            pngMe.earth.removeAllLayer()
            const layer = pngMe.earth.layerManager.createLayer(pngInfo.id, 8, url, {
              visible: true,
              name: "内涝积水分布",
              projection: 4326,
              imageExtent
            });
            pngMe.earth.addLayer(layer);
            await this.delay(600); // 处理完一个pngInfo项后延时0.5秒
            vm.printImg(fileName)
            await this.delay(100);
          }

        }
      }
    },

    // // 处理数据项
    // async processItem(item) {
    //   await this.processPngInfo(item);
    // },

    // 处理所有数据项
    async processAllItems(data) {
      const vm = this
      vm.spinshow = true;
      for (let index = 0; index < data.length; index++) {
        // 加载状态
        vm.loadingTip = `正在生成图片（${index} / ${data.length}）`;
        await this.processPngInfo(data[index]); // 处理当前项
        await this.delay(500); // 每项处理完后延时0.5秒
      }
      vm.spinshow = false;
    },
    // 向模板中添加图片
    setTemplatePngs(list) {
      const vm = this;
      vm.processAllItems(list).then(() => {
        const params = {
          imageList: this.base64pngList,
          taskId: this.$route.query.taskId
        }
        vm.spinshow = true;
        vm.loadingTip = '正在导出图片';
        console.log(params);
        fetch(`${window.servicesConfig.servicesUrl}/v1/evalateTask/exportImage`, {
        // fetch(`http://192.9.100.97:7002/waterlogging/api/v1/evalateTask/exportImage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        }).then(response => {
          vm.spinshow = false;
          if (response.ok) {
            return response.blob(); // 解析JSON响应体
          }
          throw new Error('Network response was not ok.');
        }).then(blob => {
          vm.spinshow = false;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = '内涝积水分布.zip'
          a.click();
          window.URL.revokeObjectURL(url);
        }).catch((error) => {
          vm.spinshow = false;
          console.error('Error:', error);
        });
      }).catch(err => {
        console.error('导出错误:', err)
        vm.$message.error("导出失败，请重试");
      })
    },
    // 转DMS
    toDMS(degrees) {
      const d = Math.floor(degrees);
      const m = Math.floor((degrees - d) * 60);
      const s = Math.round(((degrees - d) * 60 - m) * 60);
      return {
        degrees: d,
        minutes: m,
        seconds: s
      };
    },
    // 生成刻度
    generateTicks(min, max, divisions) {
      const range = max - min;
      const step = range / divisions;
      return Array.from({ length: divisions + 1 }, (_, i) => min + i * step);
    },

    // 处理时间字符串MM/DD/HH to Date
    parseTimeString(timeString) {
      const [year ,month, day, hour] = timeString.split("/").map(Number);
      return new Date(year, month - 1, day, hour, 0, 0);
    },
    // 生成时间list
    generateTimeSequence(start, end) {
      const startDate = this.parseTimeString(start);
      const endDate = this.parseTimeString(end);
      const times = [this.formatTime(startDate)];

      while (startDate < endDate) {
        startDate.setHours(startDate.getHours() + 1);
        times.push(this.formatTime(startDate));
      }

      return times;
    },
    // 处理时间
    formatTime(date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();
      return {
        time: `${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}/${hour.toString().padStart(2, "0")}`,
        year: year.toString().padStart(4, "0")
      }
    },
    onTimeChange(value, dateString) {
      console.log("Selected Time: ", value);
      console.log("Formatted Selected Time: ", dateString);
    },
    onTimeOk(value) {
      console.log("onOk: ", value);
    },
    // 构建时间选项
    buildOptions(data) {
      const options = [];
      data.forEach(item => {
        const [date, time] = item.split(" ");
        const [year, month, day] = date.split("-");
        const [hour, minute] = time.split(":");
        const key = `${year}-${month}-${day}`;
        const thisDate = options.find(item => item.value === key);
        if (!thisDate) {
          options.push({
            label: `${month}月${day}日`,
            value: key,
            children: [
              { label: `${hour}时`, value: `${year}/${month}/${day}/${hour}` }
            ]
          });
        } else {
          thisDate.children.push({
            label: `${hour}时`,
            value: `${year}/${month}/${day}/${hour}`
          });
        }
      });
      return options;
    },
    // 时间范围选择
    getTimeRange() {
      const taskInfo = JSON.parse(sessionStorage.getItem("taskInfo"));
      const startDate =
        moment(taskInfo.startDate, "YYYYMMDDHH")
          .add(1, "hours")
          .format("YYYY-MM-DD HH") + ":00";
      const endDate =
        moment(taskInfo.endDate, "YYYYMMDDHH").format("YYYY-MM-DD HH") + ":00";
      this.timeListAll = this.gainAllDateBetRange(
        new Date(startDate),
        new Date(endDate)
      );
      this.options = this.buildOptions(this.timeListAll);
    },
    // 获取一个日期范围内的所有日期，入参为Date对象
    gainAllDateBetRange(startDate, endDate) {
      let dateArr = [];
      if (!(startDate instanceof Date && endDate instanceof Date))
        return dateArr; // 非时间格式返回空数组
      let startTime = startDate.getTime(); // 获取开始日期的毫秒数
      let endTime = endDate.getTime(); // 获取结束日期的毫秒数
      let oneTime = 60 * 60 * 1000; // 一天的毫秒数
      for (let time = startTime; time <= endTime; ) {
        dateArr.push(this.dateFormat(new Date(time))); // 将格式化后的时间存入结果数组
        time += oneTime; // 每次加一天
      }
      return dateArr;
    },
    // 格式化时间，YYYY-MM-DD HH:MM
    dateFormat(date) {
      var year = date.getFullYear() + "-";
      var month =
        (date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1) + "-";
      var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
      return year + month + day + " " + hour + ":00";
    },
    // 时间轴
    structureTimeLine() {
      this.$parent.structureTimeLine();
    },
    // 获取每个算子计算的状态
    getComputeStatus(flag) {
      const param = {
        taskId: this.$route.query.taskId
      };
      getComputeStatus(param).then(res => {
        if (res.code == 200) {
          if (res.data.status.running) {
            this.spinshow = true;
          } else {
            clearInterval(this.timer);
            this.spinshow = false;
            this.$message.success("评估完成");
            this.$parent.getCurrentStepMessage();
            // this.getSimulationResultData();
            this.getRegionTreeDataAll();
            this.structureTimeLine();
          }
        }
      });
    },
    // 编辑保存
    editChange() {
      this.isEdit = !this.isEdit;
      this.$parent.onloadLegend();
    },
    // 显示tip
    showTips() {
      this.tipModal = true;
    },
    // 关闭tip
    handleCancel() {
      this.tipModal = false;
    },
    // 雨洪仿真结果计算
    simulationCalculate() {
      this.spinshow = true;
      const param = {
        taskId: this.$route.query.taskId,
        color_levels: this.ponding.map(item => {
          return item.startValue;
        })
      };
      simulationCalculate(param)
        .then(res => {
          if (res.code == 200) {
            this.timer = setInterval(() => {
              this.getComputeStatus(0);
            }, 10000);
          } else {
            this.$message.error("计算失败");
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // findName找到行政区名称
    findName (pageData, row) {
      const code = row.code
      if (!code) return '积水深度'

      const record = pageData.records.find(item => item.code == code)
      if (record) {
        const xzqName = (record.county && record.county !== '--') ? record.county
          : (record.city && record.city !== '--') ? record.city
          : (record.province && record.province !== '--') ? record.province : ''
        return xzqName + '积水深度'
      }
    },
    // 查询表格数据
    getSimulationResultData(
      page = 1,
      pageSize = 10,
      region = [],
      date,
      filter = ""
    ) {
      const param = {
        pageNum: page,
        pageSize: pageSize,
        taskId: this.$route.query.taskId,
        seq: false,
        code: region.join(","),
        date: date
      };
      getSimulationResultData(param)
        .then(res => {
          if (res.code == 200) {
            this.$emit("update:tableData", res.data.pageData.records);
            if (!this.$parent.lineShow) {
              this.$emit("update:tableShow", true);
            }
            if (filter != "filter") {
              // me.earth.removeAllLayer();
              this.$emit('removeAllAddedLayers')
              res.data.pngIds.map((item, index) => {
                const boxArr = item.box.split(",");
                // const code = item.code
                // const record = res.data.pageData.records.find(item => item.code == code)
                const name = this.findName(res.data.pageData, item)
                diitgis.addImage({
                  name,
                  layerName: "最大积水" + index,
                  url:
                    window.servicesConfig.servicesUrl +
                    "/v1/resultSource/assets?id=" +
                    item.id,
                  imageExtent: [
                    Number(boxArr[0]),
                    Number(boxArr[1]),
                    Number(boxArr[2]),
                    Number(boxArr[3])
                  ]
                });
              });
            }
            this.$parent.total = res.data.pageData.total;
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 根据日期排序
    sortDate(dataList) {
      // 处理'MM/DD/HH'格式日期
      function parseDate(dateStr) {
        return dateStr.split("/").map(num => parseInt(num, 10));
      }

      dataList.sort((a, b) => {
        let dateA = parseDate(a.date);
        let dateB = parseDate(b.date);

        // 比较月份、日、小时
        if (dateA[0] !== dateB[0]) {
          return dateB[0] - dateA[0];
        } else if (dateA[1] !== dateB[1]) {
          return dateB[1] - dateA[1];
        } else {
          return dateB[2] - dateA[2];
        }
      });

      return dataList; // 返回排序后的数组
    },
    // 查询折线统计图数据
    getSimulationResultLineData(code) {
      const param = {
        taskId: this.$route.query.taskId,
        code: code
      };
      return new Promise((resolve, reject) => {
        getSimulationResultLineData(param).then(res => {
          if (res.code == 200) {
            const dataList = this.sortDate(res.data);
            this.lineXais = dataList.map(item => {
              return item.date;
            });
            this.maxAccWater = dataList.map(item => {
              return item.depth;
            });
            let maxPrcp = dataList.map(item => {
              return item.maxPrcp;
            });
            let meanPrcp = dataList.map(item => {
              return item.meanPrcp;
            });
            this.$emit("update:lineShow", true);
            this.$emit("update:tableShow", false);
            resolve({
              lineXais: this.lineXais,
              maxAccWater: this.maxAccWater,
              maxPrcp: maxPrcp,
              meanPrcp: meanPrcp
            });
          }
        });
      });
    },
    // 导出积水
    exportResultMaxDepthExcel() {
      const param = {
        taskId: this.$route.query.taskId
      };
      exportResultMaxDepthExcel(param).then(res => {
        const blob = new Blob([res]);
        // 下载下来的文件名称
        const fileName = "雨洪仿真结果" + ".xlsx";
        if ("download" in document.createElement("a")) {
          // 非IE下载
          // 获取heads中的filename文件名
          const elink = document.createElement("a");
          // 下载后文件名
          elink.download = fileName;
          elink.style.display = "none";
          // 创建下载的链接
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          // 点击下载
          elink.click();
          URL.revokeObjectURL(elink.href); // 释放URL 对象
          // 下载完成移除元素
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
        }
      });
    },
    // 获取所有的评估区域
    getRegionTreeDataAll() {
      let taskInfo = JSON.parse(sessionStorage.getItem("taskInfo"));
      let param = {
        code: window.sessionStorage.getItem("xzqdm"),
        taskId: this.$route.query.taskId,
        step: 3
      };
      if (taskInfo.jb.includes("流域")) {
        param.code = "--";
      }
      getRegionTreeData(param).then(res => {
        if (res.code == 200) {
          this.regionOptionsAll = res.data
            ? JSON.parse(JSON.stringify(res.data.children))
            : [];
          this.$emit("update:regionOptions", this.regionOptionsAll);
        }
      });
    },
    // 加载积水图层
    onloadPondingLayer(dateTime) {
      let flag = false;
      getThirdStepImage({ taskId: this.$route.query.taskId }).then(res => {
        if (res.code == 200) {
          for (const key in res.data) {
            if (Object.hasOwnProperty.call(res.data, key)) {
              if (key == dateTime) {
                flag = true;
                res.data[key].map((item, index) => {
                  const boxArr = item.box.split(",");
                  diitgis.addImage({
                    layerName: "最大积水" + index,
                    url:
                      window.servicesConfig.servicesUrl +
                      "/v1/resultSource/assets?id=" +
                      item.id,
                    imageExtent: [
                      Number(boxArr[0]),
                      Number(boxArr[1]),
                      Number(boxArr[2]),
                      Number(boxArr[3])
                    ]
                  });
                });
              }
            }
          }
          if (!flag) {
            this.$message.warning("该时间暂无数据");
          }
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.simulationResult {
  padding: 0 0.3rem;
  .spin {
    max-height: 3rem;
    overflow: hidden;
  }
  .operationBox {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.26rem;
    .operationItem {
      display: flex;
      margin-right: 0.04rem;
      .operationBtn {
        margin-left: 0.04rem;
      }
      /deep/.region-selecter {
        .ant-select-selection > ul {
          display: flex;
          flex-wrap: nowrap;
          overflow: hidden;
          li {
            min-width: 0.8rem;
          }
        }
      }
    }
    .operationBtn {
      width: 1rem;
      height: 0.32rem;
      background: #ffffff;
      border: 0.01rem solid #1270e9;
      border-radius: 0.04rem;
      box-shadow: 0rem 0.02rem 0.04rem 0rem rgba(19, 73, 141, 0.24);
      text-align: center;
      line-height: 0.32rem;
      color: #1270e9;
      cursor: pointer;
    }
  }

  .renderGrade {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 0.39rem;
    background: #f7f7f7;
    border-radius: 0.04rem;
    margin-top: 0.14rem;
    padding: 0 0.2rem;
    line-height: 0.39rem;
    font-size: 0.14rem;
    font-family: PingFang SC, PingFang SC-Semibold;
    font-weight: 600;
    color: #333333;

    img {
      margin-left: 0.12rem;
      cursor: pointer;
    }

    .edit {
      display: flex;
      align-items: center;
      font-family: Alibaba PuHuiTi 3, Alibaba PuHuiTi 3-Medium;
      font-weight: 500;
      color: #1270e9;
      cursor: pointer;

      img {
        margin-right: 0.08rem;
      }
    }
  }

  .gradeTitle {
    margin: 0.16rem 0;
    margin-left: 0.3rem;
    font-size: 0.14rem;
    font-family: Alibaba PuHuiTi 3, Alibaba PuHuiTi 3-Medium;
    font-weight: 500;
    color: #333333;
  }

  .gradeBox {
    display: flex;
    flex-wrap: wrap;
    padding: 0 0.3rem;

    .gradeItem {
      display: flex;
      align-items: center;
      width: 50%;
      margin-bottom: 0.16rem;

      .colorCard {
        width: 0.26rem;
        height: 0.2rem;
        border-radius: 0.04rem;
        margin-right: 0.14rem;
      }

      .gradeValue {
        display: flex;
        align-items: center;

        .ant-input {
          width: 0.8rem;
          border-color: #b2b2b2;
        }

        .ant-input[disabled] {
          border: none;
          background: #f6f6f6;
          color: #333333;
        }

        div {
          margin: 0 0.1rem;
        }
      }
    }
  }
}
</style>
<style lang="less">
.tipModal {
  .ant-modal-title {
    color: #fff;
  }

  .ant-modal-header {
    background: #1963e1;
    font-family: PingFang SC, PingFang SC-Semibold;
    font-weight: 600;
    color: #ffffff;
  }
}

.tips {
  margin-bottom: 0.18rem;
  font-size: 0.14rem;
  font-family: PingFang SC, PingFang SC-Semibold;
  font-weight: 600;
  color: #333333;
  text-align: center;
}

.ruleBox {
  .ruleItem {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 0.1rem;

    .ruleItemLeft,
    .ruleItemCenter,
    .ruleItemRight {
      width: 0.8rem;
      height: 0.24rem;
      background: #f6f6f6;
      border-radius: 0.03rem;
      padding: 0 0.1rem;
      line-height: 0.24rem;
      font-size: 0.14rem;
      font-family: Alibaba PuHuiTi 3, Alibaba PuHuiTi 3-Semibold;
      font-weight: 600;
      color: #333333;
    }

    .ruleItemLeft {
      text-align: right;
      margin-right: 0.08rem;
    }

    .ruleItemCenter {
      margin: 0 0.08rem;
    }

    .ruleItemRight {
      text-align: left;
      margin-left: 0.08rem;
    }
  }
}
.prohibit {
  pointer-events: none;
  filter: grayscale(100%);
}
.template-png-wrapper {
  /* position: fixed;
  top: 0;
  left: 8rem; */

  display: flex;
  flex-wrap: nowrap;
  padding: 0.16rem 0.24rem;
  width: 11rem;
  height: 8rem;
  background-color: #fff;
  .left-map-box {
    border: 2px solid #000;
    width: 7.6rem;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    .map-x-top {
      align-content: flex-end;
    }
    .map-x-bottom {
      align-content: flex-start;
    }
    .map-x-top,
    .map-x-bottom {
      width: 100%;
      height: 0.28rem;
      .x-title {
        font-size: 0.1rem;
        display: flex;
        justify-content: space-between;
        .x-title-text {
          text-align: center;
        }
      }
      .x-scale {
        padding: 0 0.2rem;
        display: flex;
        justify-content: space-between;
        .x-scale-item {
          height: 0.08rem;
          border: 1px solid #000;
        }
      }
    }
    .map-y-left,
    .map-y-right {
      position: relative;
      width: 0.16rem;
      height: 7.06rem;
      .y-title {
        font-size: 0.1rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .y-title-text {
          display: flex;
          height: 1rem;
        }
      }
      .y-scale {
        position: absolute;
        top: 0;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        height: 100%;
        justify-content: space-around;
        .y-scale-item {
          width: 0.04rem;
          border: 1px solid #000;
        }
      }
    }
    .map-y-left {
      .y-title-text {
        align-items: end;
        transform-origin: 0 calc(100% - 0.14rem);
        transform: rotateZ(270deg);
      }
      .y-scale {
        right: 0;
      }
    }
    .map-y-right {
      .y-title-text {
        align-items: start;
        transform-origin: 0 0.16rem;
        transform: rotateZ(90deg);
        height: 1.02rem;
      }
      .y-scale {
        left: 0;
      }
    }
    .map-box {
      border: 2px solid #000;
      width: 7.2rem;
      height: 7.06rem;
    }
  }
  .right-info-box {
    position: relative;
    height: 100%;
    width: 2.9rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .png-title {
      margin: 0.48rem 0 0.48rem 0.4rem;
      p {
        text-align: center;
        font-size: 0.24rem;
        font-weight: bold;
        font-family: fangsong;
      }
    }
    .map-label-box {
      position: absolute;
      top: 2.8rem;
      left: 0.6rem;
      width: 2rem;
      border: 1px solid #000;
      p {
        text-align: center;
        font-size: 0.24rem;
        font-family: fangsong;
      }
    }
    .map-scale-box {
      display: none;
      position: absolute;
      bottom: 0;
      height: 0.5rem;
      width: 100%;
      margin-left: 0.2rem;
      .scale-value {
        font-size: 0.16rem;
        font-family: fangsong;
        color: #333333;
        display: flex;
        position: relative;
        height: 50%;
        width: 85%;
        .value-item {
          position: absolute;
          text-wrap: nowrap;
          transform: translate(-50%, 0);
        }
      }
      .scale-item {
        height: 0.08rem;
        display: flex;
        width: 85%;
        .color-item {
          height: 100%;
          border: 1px solid #000;
        }
        .color-item:nth-child(2n) {
          background-color: #000;
        }
      }
    }
  }
  .label-line {
    position: absolute;
    top: 4.2rem;
    left: 4.5rem;
    opacity: 0.5;
    transform: rotateZ(350deg);
    transform-origin: 0 0;
    width: 4rem;
    border: 1px solid #000;
  }
}
.template-png-wrapper > .right-info-box > .legend-box {
  margin-left: 0.2rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  .legend-level {
    width: 50%;
    .title {
      font-size: 0.2rem;
      font-weight: bold;
      font-family: fangsong;
    }
    .level-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.1rem;
      .color {
        width: 0.4rem;
        height: 0.24rem;
        border: 1px solid #000;
      }
      .value {
        font-size: 0.16rem;
        font-family: fangsong;
        width: 0.8rem;
        color: #333333;
        margin-left: 0.1rem;
      }
    }
  }
  .legend-info {
    width: 40%;
    .info-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.1rem;
      .color {
        width: 0.4rem;
        height: 0.24rem;
        border: 2px solid red;
      }
      &.water > .color {
        height: 0;
        border-color: #66ccff;
      }
      &.zone > .color {
        height: 0.04rem;
        border: 1px solid #000;
        border-left: none;
        border-right: none;
        background-color: rgb(218, 219, 107);
      }
      .value {
        font-size: 0.16rem;
        font-family: fangsong;
        color: #333333;
        width: 0.64rem;
        text-align: end;
      }
    }
  }
}
</style>
