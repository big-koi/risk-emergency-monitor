<template>
  <div class="box">
    <div class="radio">
      <a-radio-group
        v-model="radiovalue"
        button-style="solid"
        @change="onChange"
      >
        <a-radio-button value="1">
          流域区划
        </a-radio-button>
        <a-radio-button value="2">
          河网
        </a-radio-button>
        <a-radio-button value="3">
          监测设备
        </a-radio-button>
        <a-radio-button value="4">
          交通
        </a-radio-button>
      </a-radio-group>
      <a-icon type="close" style="color: #fff;" @click="openLayer" />
    </div>
    <div class="content">
      <div v-show="radiovalue == 1">
        <a-checkbox
          :id="item.id"
          :value="index"
          :key="item.id"
          v-for="(item, index) in plainOptions1"
          @change="oncheckboxChange"
          :checked="item.isCheck"
        >
          {{ item.text }}
        </a-checkbox>
      </div>
      <div v-show="radiovalue == 2">
        <a-checkbox
          :id="item.id"
          :value="index"
          :key="item.id"
          v-for="(item, index) in plainOptions2"
          @change="oncheckboxChange2"
          :checked="item.isCheck"
        >
          {{ item.text }}
        </a-checkbox>
      </div>
      <div v-show="radiovalue == 3" class="jczd-box">
        <a-checkbox
          :id="item.id"
          :value="item.value"
          :key="item.index"
          v-for="(item, index) in plainOptions3"
          @change="e => oncheckboxChange3(e, item)"
          :checked="item.isCheck"
        >
          {{ item.text }}
        </a-checkbox>
        <div class="search-box">
          <a-input v-model="searchValue" placeholder="请输入设备ID或设备名称" />
          <a-button type="primary" class="search-btn" @click="searchDevice()"
            >查询</a-button
          >
        </div>
        <ul class="search-result-list-box">
          <li v-for="(item, index) in sbData" @click="showJczd(item)">
            <span>{{ item.devId }}</span>
            <span>{{ item.devName }}</span>
            <span>{{ item.subType }}</span>
          </li>
        </ul>
      </div>
      <div v-show="radiovalue == 4">
        <a-checkbox
          :id="item.id"
          :value="index"
          :key="item.id"
          v-for="(item, index) in plainOptions4"
          @change="oncheckboxChange4"
          :checked="item.isCheck"
        >
          {{ item.text }}
        </a-checkbox>
      </div>
    </div>
    <a-modal
      v-model="jczdVisible"
      title="监测信息"
      centered
      :width="1200"
      :bodyStyle="{
        height: 600,
        overflow: 'auto',
        padding: '20px'
      }"
      @ok="jczdVisible = false"
      wrapClassName="jcdw-model"
      :footer="null"
    >
      <ul class="jcdw-tab-box">
        <li :class="jcdwTabIndex === '1' ? 'active' : ''" @click="changeJcdwTabIndex('1')">
          水文信息
        </li>
        <li :class="jcdwTabIndex === '4' ? 'active' : ''" @click="changeJcdwTabIndex('4')">
          气象信息
        </li>
        <li :class="jcdwTabIndex === '2' ? 'active' : ''" @click="changeJcdwTabIndex('2')">
          监控视频
        </li>
        <li :class="jcdwTabIndex === '3' ? 'active' : ''" @click="changeJcdwTabIndex('3')">
          预警列表
        </li>
      </ul>
      <div class="jcdw-body-box" v-show="jcdwTabIndex === '1'">
        <div class="left-box">
          <div class="main-title">
            <i></i>
            <span>水位流量过程折线图</span>
          </div>
          <div class="chart-box" id="stageDischargeChart"></div>
        </div>
        <div class="rigth-box">
          <div class="jcxx-top-box">
            <div class="main-title">
              <i></i>
              <span>设备基础信息</span>
            </div>
            <a-descriptions bordered size="small" :column="2">
              <a-descriptions-item label="设备ID">
                {{ jbxxObj.devId || "--" }}
              </a-descriptions-item>
              <a-descriptions-item label="设备名称">
                {{ jbxxObj.devName || "--" }}
              </a-descriptions-item>
              <a-descriptions-item label="设备类型">
                {{ jbxxObj.subType || "--" }}
              </a-descriptions-item>
              <a-descriptions-item label="海拔">
                {{ jbxxObj.asl || "--" }}
              </a-descriptions-item>
              <a-descriptions-item label="经度">
                {{ jbxxObj.lon || "--" }}
              </a-descriptions-item>
              <a-descriptions-item label="纬度">
                {{ jbxxObj.lat || "--" }}
              </a-descriptions-item>
            </a-descriptions>
          </div>
          <div class="xqxx-bottom-box">
            <div class="main-title">
              <i></i>
              <span>水位流量信息</span>
            </div>
            <a-table
              :columns="stageDischargeColumns"
              :data-source="stageDischargeData"
              :scroll="{
                y: 300
              }"
              :pagination="false"
            >
              <span slot="ss" slot-scope="text, record">
                <span v-if="record.ss === '涨'" style="color: #00FFA6;">{{
                  record.ss
                }}</span>
                <span v-else-if="record.ss === '落'" style="color: #FF6400;">{{
                  record.ss
                }}</span>
                <span v-else>{{ record.ss }}</span>
              </span>
            </a-table>
          </div>
        </div>
      </div>
      <div class="video-body-box" v-show="jcdwTabIndex === '2'">
        <div class="top-box">
          <a-select v-model="videoDevId" placeholder="请选择视频类型" style="min-width: 200px;" @change="changeVideoDevId">
            <a-select-option :value="item.devId" v-for="item in videoList" :key="item.devId">{{ item.devName }}</a-select-option>
          </a-select>
        </div>
        <div class="bottom-box">
          <!-- <video :src="videoUrl" controls></video> -->
           <iframe :src="videoUrl" frameborder="0" style="width: 100%;height: 100%;"></iframe>
        </div>
      </div>
      <div class="weather-body-box" v-show="jcdwTabIndex === '4'">
        <!-- 实时数据展示 -->
        <div class="weather-realtime-box">
          <a-descriptions bordered size="small" :column="4">
            <a-descriptions-item :label="item.name" v-for="(item,index) in weatherRealtimeDataList" :key="item.id">
              {{ item.value || "--" }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
        <!-- 历史信息 -->
        <div class="weather-history-box">
          <div class="main-title">
            <div class="title-left">
              <i></i>
              <span>历史信息</span>
            </div>
            <div class="history-controls">
              <a-range-picker
                v-model="weatherHistoryDateRange"
                format="YYYY年MM月DD日"
                :placeholder="['开始日期', '结束日期']"
                style="width: 350px; margin-right: 10px;"
                @change="onWeatherHistoryDateRangeChange"
              />
              <a-select
                v-model="weatherHistoryParam"
                style="width: 150px;"
                @change="onWeatherHistoryParamChange"
                placeholder="请选择参数"
              >
                <a-select-option v-for="(item,index) in weatherHistoryParamList" :key="item.code" :value="item.code">{{ item.name }}</a-select-option>
              </a-select>
            </div>
          </div>
          <div class="history-content">
            <div class="history-chart-box">
              <div class="chart-box" id="weatherHistoryChart"></div>
            </div>
            <div class="history-table-box">
              <a-table
                :columns="weatherHistoryColumns"
                :data-source="weatherHistoryData"
                :scroll="{
                  y: 300
                }"
                :pagination="false"
                size="small"
              >
              </a-table>
            </div>
          </div>
        </div>
      </div>
      <div class="yj-list-body-box" v-show="jcdwTabIndex === '3'">
        <a-table
          :columns="yjListColumns"
          :data-source="yjListDataForTable"
          :scroll="{
            y: 500
          }"
          :pagination="false"
        >
        </a-table>
      </div>
    </a-modal>
    <!-- 预警信息 -->
    <div
      class="yj-body-box"
      v-if="isYjlx"
      :style="{ top: yjTop + 'px', left: yjLeft + 'px' }"
      @mouseenter="handleYjBoxMouseEnter"
      @mouseleave="handleYjBoxMouseLeave"
    >
      <div class="yj-body-box-header">
        <div class="yj-body-box-header-title">预警信息</div>
        <div class="yj-body-box-header-close" @click="isYjlx = false"><a-icon type="close" /></div>
      </div>
      <ul class="yj-tab-box">
        <li
          v-for="(item, index) in displayYjTabs"
          :key="index"
          :class="yjTabIndex === index ? 'active' : ''"
          @click="changeYjTabIndex(index)"
        >
          {{ item.name }}
        </li>
        <li
          v-if="yjListData.length > 3"
          class="more-tab"
          @click="openJczdModalFromYj"
        >
          更多
        </li>
      </ul>
      <div class="yj-body-box-content">
        <div class="yj-body-box-item" v-if="currentYjData">
          <div class="yj-item-row">
            <span class="yj-label">告警来源：</span><span class="yj-value">{{ currentYjData.iotName }}</span>
          </div>
          <div class="yj-item-row">
            <span class="yj-label">告警编号：</span><span class="yj-value">{{ currentYjData.alarmSrc }}</span>
          </div>
          <div class="yj-item-row">
            <span class="yj-label">告警类型：</span><span class="yj-value">{{ currentYjData.alarmName }}</span>
          </div>
          <div class="yj-item-row">
            <span class="yj-label">告警信息：</span><span class="yj-value">{{ currentYjData.name }}</span>
          </div>
          <div class="yj-item-row">
            <span class="yj-label">事件发生时间：</span><span class="yj-value">{{ currentYjData.createTime }}</span>
          </div>
        </div>
        <div v-else class="yj-no-data">暂无预警数据</div>
      </div>
    </div>
  </div>
</template>
<script>
const stageDischargeColumns = [
  {
    title: "时间",
    dataIndex: "time",
    key: "time",
    width: 200
  },
  {
    title: "水位(cm)",
    dataIndex: "sw",
    key: "sw"
  },
  {
    title: "流量(立方米/s)",
    dataIndex: "ll",
    key: "ll"
  },
  {
    title: "水势",
    key: "ss",
    scopedSlots: { customRender: "ss" }
  }
];
const sbColumns = [];
const yjListColumns = [
  {
    title: "告警来源",
    dataIndex: "iotName",
    key: "iotName",
    width: 150
  },
  {
    title: "告警编号",
    dataIndex: "alarmSrc",
    key: "alarmSrc",
    width: 150
  },
  {
    title: "告警类型",
    dataIndex: "alarmName",
    key: "alarmName",
    width: 200
  },
  {
    title: "告警信息",
    dataIndex: "name",
    key: "name",
    width: 200
  },
  {
    title: "事件发生时间",
    dataIndex: "createTime",
    key: "createTime",
    width: 180
  }
];
const weatherHistoryColumns = [
  {
    title: "时间",
    dataIndex: "time",
    key: "time",
    width: "50%",
    align: "center"
  },
  {
    title: "数值",
    dataIndex: "value",
    width: "50%",
    align: "center",
    key: "value"
  }
];

import diitgis from "@/components/Layer/LayerManagerForDiitGIS";
import {
  searchDeviceTyep,
  searchDeviceInfo,
  searchDeviceDataInfo,
  searchDeviceDataToken,
  searchDeviceInfoSXT,
  searchDeviceYjInfo,
  indicatorList,
  obtainRealTimeData,
  historyObtainRealTimeData
} from "../api/rapidAnalysis/jczd";
import * as echarts from "echarts";
import moment from "moment";
export default {
  props: {
    earthMap: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      arrData: [],
      radiovalue: "1",
      checkedList1: "",
      checkedList2: "",
      plainOptions1: [
        {
          value: 0,
          id: "1",
          isCheck: false,
          text: "一级流域",
          serviceType: 2,
          serviceURL:
            window.servicesConfig.defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/first_level_watershed/MapServer"
        },
        {
          value: 1,
          id: "2",
          text: "二级流域",
          serviceType: 2,
          isCheck: false,
          serviceURL:
            window.servicesConfig.defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/second_level_watershed/MapServer",
          children: null
        },
        {
          value: 2,
          id: "3",
          text: "三级流域",
          isCheck: false,
          serviceType: 2,
          serviceURL:
            window.servicesConfig.defaultProxyPath +
            "/dtfw30/arcgis/rest/services/mapserver/san_ji_liu_yu/MapServer"
        }
      ],
      plainOptions2: [
        {
          text: "河流",
          value: 0,
          id: "4",
          isCheck: false,
          serviceType: 2,
          // serviceURL: "https://jcyj.ndrcc.org.cn:4001/dtfw30/arcgis/rest/services/Flood_Screen/he_liu_shui_xi_qpfa/MapServer"
          serviceURL:
            window.servicesConfig.defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/he_liu_shui_xi/MapServer"
        }
      ],
      plainOptions3: [],
      plainOptions4: [
      {
          value: 0,
          id: "5",
          isCheck: false,
          text: "国道",
          serviceType: 2,
          serviceURL:
            window.servicesConfig.defaultProxyPath +
            "/dtfw/arcgis/rest/services/Base/Road_Groad/MapServer"
        },
        {
          value: 1,
          id: "6",
          text: "省道",
          serviceType: 2,
          isCheck: false,
          serviceURL:
            window.servicesConfig.defaultProxyPath +
            "/dtfw/arcgis/rest/services/Base/Road_Proad/MapServer",
          children: null
        },
        {
          value: 2,
          id: "7",
          text: "高速公路",
          isCheck: false,
          serviceType: 2,
          serviceURL:
            window.servicesConfig.defaultProxyPath +
            "/dtfw/arcgis/rest/services/Base/Road_motorways/MapServer"
        }
      ],
      jczdVisible: false,
      jbxxObj: {
        devId: 3434,
        subType: 301,
        lon: 114.447953,
        devName: "武汉测试设备SN002",
        lat: 30.421654,
        baseType: 300
      },
      stageDischargeColumns,
      stageDischargeData: [
        {
          ll: 20,
          ss: "平",
          sw: 62.132,
          time: "2025-09-16 09:00"
        },
        {
          ll: 20,
          ss: "涨",
          sw: 62.132,
          time: "2025-09-16 08:00"
        },
        {
          ll: 20,
          ss: "落",
          sw: 62.132,
          time: "2025-09-16 07:00"
        },
        {
          ll: 20,
          ss: "平",
          sw: 62.132,
          time: "2025-09-16 06:00"
        },
        {
          ll: 20,
          ss: "平",
          sw: 62.132,
          time: "2025-09-16 05:00"
        },
        {
          ll: 20,
          ss: "平",
          sw: 62.132,
          time: "2025-09-16 05:00"
        },
        {
          ll: 20,
          ss: "平",
          sw: 62.132,
          time: "2025-09-16 05:00"
        },
        {
          ll: 20,
          ss: "平",
          sw: 62.132,
          time: "2025-09-16 05:00"
        },
        {
          ll: 20,
          ss: "平",
          sw: 62.132,
          time: "2025-09-16 05:00"
        },
        {
          ll: 20,
          ss: "平",
          sw: 62.132,
          time: "2025-09-16 05:00"
        }
      ],
      jcdwType: "1",
      jcdwTabIndex: "1",
      searchValue: "",
      copyJcdwListData: [],
      jcdwListData: [],
      sbData: [],
      videoDevId: null,
      videoToken: "",
      videoList: [],
      videoUrl: "",
      yjListData: [],
      isYjlx: false,
      yjTop: 0,
      yjLeft: 0,
      timer3: null, // 监测设备数据定时器
      yjTabIndex: 0, // 当前选中的预警tab索引
      yjListColumns, // 预警列表表格列定义
      isMouseOnYjBox: false, // 鼠标是否在预警弹窗上
      hideYjBoxTimer: null, // 隐藏弹窗的延迟定时器
      mouseOverHandler: null, // 鼠标滑过事件处理器
      mouseOutHandler: null, // 鼠标移出事件处理器
      clickHandler: null, // 点击事件处理器
      currentMarkerElement: null, // 当前鼠标所在的标记元素
      // 气象信息相关数据
      weatherRealtimeDataList: [], // 存储接口返回的原始数据
      weatherHistoryDateRange: null, // 时间范围选择器，默认一周
      weatherHistoryParam: undefined,
      weatherHistoryParamList: [],
      weatherHistoryColumns,
      weatherHistoryData: []
    };
  },
  computed: {
    // 显示的预警tab列表（最多3个）
    displayYjTabs() {
      const maxTabs = 3;
      const tabs = [];
      for (let i = 0; i < Math.min(this.yjListData.length, maxTabs); i++) {
        tabs.push({
          name: `预警${i + 1}`,
          index: i,
          data: this.yjListData[i]
        });
      }
      return tabs;
    },
    // 当前选中的预警数据
    currentYjData() {
      if (this.yjTabIndex >= 0 && this.yjTabIndex < this.displayYjTabs.length) {
        return this.displayYjTabs[this.yjTabIndex].data;
      }
      return null;
    },
    // 预警列表表格数据
    yjListDataForTable() {
      return this.yjListData.map((item, index) => ({
        ...item,
        key: item.id || index
      }));
    }
  },
  methods: {
    changeJcdwTabIndex(index) {
      this.jcdwTabIndex = index;
      if(index === '2'){
        searchDeviceDataToken({
        }).then(res => {
          this.videoToken = res;
          this.getSearchDeviceInfoSXT();
        });
      } else if(index === '3'){
        // 预警列表tab，确保数据已加载
        if(this.yjListData.length === 0 && this.jbxxObj.devId) {
          searchDeviceYjInfo({
            devId: this.jbxxObj.devId
          }).then(res => {
            this.yjListData = res;
          });
        }
      } else if(index === '4'){
        // 气象信息tab，初始化数据
        this.initWeatherData();
        this.getWeatherRealtimeData();
      }
    },
    changeYjTabIndex(index) {
      this.yjTabIndex = index;
    },
    openJczdModalFromYj() {
      // 关闭预警弹窗
      this.isYjlx = false;
      // 打开监测信息弹窗，并切换到预警列表tab
      this.jczdVisible = true;
      this.jcdwTabIndex = '3';
      // 加载设备基础信息（水文信息等）
      if(this.jbxxObj.devId) {
        this.getSearchDeviceDataInfo();
        // 如果预警数据未加载，则加载数据
        if(this.yjListData.length === 0) {
          searchDeviceYjInfo({
            devId: this.jbxxObj.devId
          }).then(res => {
            this.yjListData = res;
          });
        }
      }
    },
    getSearchDeviceInfoSXT(){
      searchDeviceInfoSXT({
        devId:  this.jbxxObj.devId
      }).then(res => {
        this.videoList = res;
        this.videoDevId = this.videoList[0].devId;
        this.videoUrl = window.servicesConfig.jczdUrl + "?device_id=" + this.videoDevId + "&access_token=" + this.videoToken;
      });
    },
    changeVideoDevId(value) {
      this.videoDevId = value;
      this.videoUrl = window.servicesConfig.jczdUrl + "?device_id=" + this.videoDevId + "&access_token=" + this.videoToken;
    },
    openLayer() {
      // 清除定时器
      if (this.timer3) {
        clearInterval(this.timer3);
        this.timer3 = null;
      }
      this.clearMapPoint();
      this.$emit("openLayer");
    },
    onChange(e) {
      console.log(e);
      // 如果切换到非"3"选项，清除定时器
      if (e.target.value !== "3" && this.timer3) {
        clearInterval(this.timer3);
        this.timer3 = null;
        this.clearMapPoint();
      }
      if (e.target.value === "3") {
        this.getPlainOptions3Data();
      }
    },
    oncheckboxChange(e) {
      let isFlag = e.target.checked;
      let value = e.target.value;
      let id = e.target.id;
      this.plainOptions1[value].isCheck = isFlag;
      if (isFlag) {
        let nodedome = this.plainOptions1[value];
        diitgis.addArcgisLayer(nodedome, this.earthMap);
        // 基础图层添加图列
        this.arrData.push(this.plainOptions1[value]);
        this.$emit("ischeck", this.arrData);
      } else {
        let nodedome = this.plainOptions1[value];
        diitgis.removeArcgisLayer(nodedome);
        const index = this.arrData.findIndex(item => item.id === id);
        this.arrData.splice(index, 1);
        this.$emit("ischeck", this.arrData);
      }
    },
    oncheckboxChange2(e) {
      let isFlag = e.target.checked;
      let value = e.target.value;
      let id = e.target.id;
      this.plainOptions2[value].isCheck = isFlag;
      if (isFlag) {
        let nodedome = this.plainOptions2[value];
        diitgis.addArcgisLayer(nodedome, this.earthMap);
        this.arrData.push(this.plainOptions2[value]);
        this.$emit("ischeck", this.arrData);
      } else {
        let nodedome = this.plainOptions2[value];
        diitgis.removeArcgisLayer(nodedome);
        const index = this.arrData.findIndex(item => item.id === id);
        this.arrData.splice(index, 1);
        this.$emit("ischeck", this.arrData);
      }
    },
    oncheckboxChange3(e, item) {
      let isFlag = e.target.checked;
      let value = e.target.value;
      this.plainOptions3[item.index].isCheck = isFlag;
      if (isFlag) {
        if (item.isClear) {
          this.$emit("setJcsbLegendShow", true);
          this.getSearchDeviceInfo(item.value);
        }
      } else {
        if (item.isClear) {
          this.clearMapPoint();
        }
      }
    },
    oncheckboxChange4(e) {
      let isFlag = e.target.checked;
      let value = e.target.value;
      let id = e.target.id;
      this.plainOptions4[value].isCheck = isFlag;
      if (isFlag) {
        let nodedome = this.plainOptions4[value];
        diitgis.addArcgisLayer(nodedome, this.earthMap);
        // 基础图层添加图列
        this.arrData.push(this.plainOptions4[value]);
        this.$emit("ischeck", this.arrData);
      } else {
        let nodedome = this.plainOptions4[value];
        diitgis.removeArcgisLayer(nodedome);
        const index = this.arrData.findIndex(item => item.id === id);
        this.arrData.splice(index, 1);
        this.$emit("ischeck", this.arrData);
      }
    },
    getPlainOptions3Data() {
      searchDeviceTyep({
        name: this.searchValue
      }).then(res => {
        this.plainOptions3 = res.map((item, index) => {
          return {
            text: item.name,
            value: item.code,
            id: item.id,
            isCheck: true,
            index: index,
            isClear: item.name === "中小河流监测装置" ? true : false
          };
        });
        this.getSearchDeviceInfo(this.plainOptions3[0].value);

        // 清除之前的定时器（如果存在）
        if (this.timer3) {
          clearInterval(this.timer3);
        }
        // 设置定时器，每5秒执行一次
        this.timer3 = setInterval(() => {
          this.getPlainOptions3Data();
        }, 5000);
      });
    },
    getSearchDeviceInfo(code) {
      const that = this;
      searchDeviceInfo({
        subType: code
      }).then(res => {
        this.clearMapPoint();
        res.forEach(item => {
          let className = "jcdw";
          let iconUrl = require("../assets/images/mark/jcdw_fyj.png");
          if(item.yj != 0){
            iconUrl = require("../assets/images/mark/jcdw_yj.png");
            className = "jcdw_yj";
          }
          let obj = {
            devId: item.devId,
            subType: item.subType,
            lon: item.lon,
            devName: item.devName,
            lat: item.lat,
            baseType: item.baseType,
            yj: item.yj // 0: 非预警 1: 预警
          };
          diitgis.addMarker([item.lon, item.lat], iconUrl, obj, className);
        });
        this.$emit("setJcsbLegendShow", true);

        // 移除之前的事件监听器（如果存在）
        if (this.clickHandler) {
          document.removeEventListener("click", this.clickHandler);
        }
        if (this.mouseOverHandler) {
          document.removeEventListener("mouseover", this.mouseOverHandler);
        }
        if (this.mouseOutHandler) {
          document.removeEventListener("mouseout", this.mouseOutHandler);
        }

        //绑定事件
        this.clickHandler = function(e) {
          // 检查 e.target 是否是有效的 DOM 元素
          if (!e.target || typeof e.target.closest !== 'function') {
            return;
          }
          const clickedElement = e.target.closest(".jcdw") || e.target.closest(".jcdw_yj");
          if (!clickedElement) return;
          e.preventDefault();
          const itemStr = clickedElement.getAttribute("item");
          if (!itemStr) {
            console.error("未找到 item 属性");
            return;
          }
          try {
            const item = JSON.parse(itemStr);
            if (typeof that !== "undefined" && that.jbxxObj !== undefined) {
              that.jbxxObj = item;
              that.jczdVisible = true;
              that.jcdwTabIndex = '1'
              that.getSearchDeviceDataInfo();
              // 加载预警数据，以便在预警列表tab中显示
              searchDeviceYjInfo({
                devId: item.devId
              }).then(res => {
                that.yjListData = res;
              });
            } else {
              console.log(
                "当前 this 上下文可能不正确，无法设置 jbxxObj 和 jczdVisible"
              );
              console.log("解析得到的数据：", item);
            }
          } catch (error) {
            console.error("解析 item JSON 失败：", error);
          }
        };
        document.addEventListener("click", this.clickHandler);

        // 绑定鼠标滑过事件
        this.mouseOverHandler = function(e) {
          // 检查 e.target 是否是有效的 DOM 元素
          if (!e.target || typeof e.target.closest !== 'function') {
            return;
          }

          // 如果鼠标在弹窗上，不处理
          const yjBox = e.target.closest(".yj-body-box");
          if (yjBox) {
            // 取消隐藏定时器
            if (that.hideYjBoxTimer) {
              clearTimeout(that.hideYjBoxTimer);
              that.hideYjBoxTimer = null;
            }
            return;
          }

          const clickedElement = e.target.closest(".jcdw_yj");
          if (!clickedElement) {
            // 如果鼠标不在标记点上，清除当前标记元素引用
            that.currentMarkerElement = null;
            return;
          }

          // 如果鼠标还在同一个标记点上，不重复触发
          if (that.currentMarkerElement === clickedElement) {
            // 取消隐藏定时器
            if (that.hideYjBoxTimer) {
              clearTimeout(that.hideYjBoxTimer);
              that.hideYjBoxTimer = null;
            }
            return;
          }

          // 更新当前标记元素引用
          that.currentMarkerElement = clickedElement;

          // 取消隐藏定时器
          if (that.hideYjBoxTimer) {
            clearTimeout(that.hideYjBoxTimer);
            that.hideYjBoxTimer = null;
          }

          e.preventDefault();
          const itemStr = clickedElement.getAttribute("item");
          if (!itemStr) {
            console.error("未找到 item 属性");
            return;
          }
          try {
            const item = JSON.parse(itemStr);
            if (typeof that !== "undefined" && that.jbxxObj !== undefined) {
              searchDeviceYjInfo({
                devId: item.devId
              }).then(res => {
                that.yjListData = res;
                that.yjTabIndex = 0; // 重置为第一个tab
                that.isYjlx = true;
                that.yjTop = e.clientY;
                that.yjLeft = e.clientX;
              });
            } else {
              console.log(
                "当前 this 上下文可能不正确，无法设置 jbxxObj 和 jczdVisible"
              );
              console.log("解析得到的数据：", item);
            }
          } catch (error) {
            console.error("解析 item JSON 失败：", error);
          }
        };
        document.addEventListener("mouseover", this.mouseOverHandler);

        // 绑定鼠标移出事件
        this.mouseOutHandler = function(e) {
          // 检查 e.target 是否是有效的 DOM 元素
          if (!e.target || typeof e.target.closest !== 'function') {
            return;
          }

          // 如果鼠标在弹窗上，不处理
          const yjBox = e.target.closest(".yj-body-box");
          if (yjBox) {
            return;
          }

          const clickedElement = e.target.closest(".jcdw_yj");
          if (!clickedElement) {
            // 如果鼠标不在标记点上，清除当前标记元素引用
            that.currentMarkerElement = null;
            // 如果弹窗已显示且鼠标不在弹窗上，延迟隐藏
            if (that.isYjlx && !that.isMouseOnYjBox) {
              if (that.hideYjBoxTimer) {
                clearTimeout(that.hideYjBoxTimer);
              }
              that.hideYjBoxTimer = setTimeout(() => {
                if (!that.isMouseOnYjBox && that.isYjlx && !that.currentMarkerElement) {
                  that.isYjlx = false;
                }
                that.hideYjBoxTimer = null;
              }, 200);
            }
            return;
          }

          // 检查鼠标移到的目标
          const relatedTarget = e.relatedTarget;

          // 如果鼠标移到了弹窗上，不隐藏
          if (relatedTarget && typeof relatedTarget.closest === 'function') {
            const yjBox = relatedTarget.closest(".yj-body-box");
            if (yjBox) {
              return; // 鼠标移到了弹窗上，不处理
            }

            // 如果鼠标移到了其他监测点位上，不隐藏
            const isMovingToMarker = relatedTarget.closest(".jcdw") || relatedTarget.closest(".jcdw_yj");
            if (isMovingToMarker) {
              // 如果移到了其他标记点，清除当前标记元素引用
              that.currentMarkerElement = null;
              return; // 鼠标移到了其他监测点位上，不处理
            }
          }

          // 清除当前标记元素引用
          if (that.currentMarkerElement === clickedElement) {
            that.currentMarkerElement = null;
          }

          // 延迟隐藏弹窗，给鼠标移动到弹窗的时间
          if (that.hideYjBoxTimer) {
            clearTimeout(that.hideYjBoxTimer);
          }
          that.hideYjBoxTimer = setTimeout(() => {
            // 再次检查鼠标是否在弹窗上或标记点上
            if (that.isMouseOnYjBox) {
              that.hideYjBoxTimer = null;
              return;
            }
            // 如果当前标记元素引用还存在，说明鼠标可能还在标记点上
            if (that.currentMarkerElement) {
              that.hideYjBoxTimer = null;
              return;
            }
            // 使用 elementFromPoint 检查当前鼠标位置下的元素（使用事件坐标）
            let activeElement = null;
            if (e.clientX !== undefined && e.clientY !== undefined) {
              try {
                activeElement = document.elementFromPoint(e.clientX, e.clientY);
              } catch (err) {
                // 忽略错误
              }
            }
            if (activeElement && typeof activeElement.closest === 'function') {
              const marker = activeElement.closest(".jcdw_yj");
              if (marker) {
                that.currentMarkerElement = marker;
                that.hideYjBoxTimer = null;
                return;
              }
              const yjBox = activeElement.closest(".yj-body-box");
              if (yjBox) {
                that.hideYjBoxTimer = null;
                return;
              }
            }
            // 隐藏弹窗
            if (typeof that !== "undefined" && that.isYjlx) {
              that.isYjlx = false;
            }
            that.hideYjBoxTimer = null;
          }, 200); // 延迟200ms，给鼠标移动到弹窗的时间
        };
        document.addEventListener("mouseout", this.mouseOutHandler);
        // document.addEventListener("mouseout", function(e) {
        //   // 如果鼠标在弹窗上，不处理
        //   if (that.isMouseOnYjBox) {
        //     return;
        //   }

        //   // 检查 e.target 是否是有效的 DOM 元素
        //   if (!e.target || typeof e.target.closest !== 'function') {
        //     return;
        //   }

        //   const clickedElement = e.target.closest(".jcdw") || e.target.closest(".jcdw_yj");
        //   if (!clickedElement) return;

        //   // 检查鼠标移到的目标
        //   const relatedTarget = e.relatedTarget;
        //   if (!relatedTarget) {
        //     // 如果 relatedTarget 为空，说明鼠标移出了页面，隐藏弹窗
        //     if (typeof that !== "undefined" && !that.isMouseOnYjBox) {
        //       that.isYjlx = false;
        //     }
        //     return;
        //   }

        //   // 检查 relatedTarget 是否是有效的 DOM 元素
        //   if (typeof relatedTarget.closest !== 'function') {
        //     // 如果 relatedTarget 没有 closest 方法，且鼠标不在弹窗上，隐藏弹窗
        //     if (typeof that !== "undefined" && !that.isMouseOnYjBox) {
        //       that.isYjlx = false;
        //     }
        //     return;
        //   }

        //   // 检查鼠标是否移到了弹窗上
        //   const yjBox = relatedTarget.closest(".yj-body-box");
        //   const isMovingToYjBox = yjBox !== null;

        //   // 检查鼠标是否移到了其他监测点位上
        //   const isMovingToMarker = relatedTarget.closest(".jcdw") || relatedTarget.closest(".jcdw_yj");

        //   // 如果鼠标既没有移到弹窗上，也没有移到其他监测点位上，且鼠标不在弹窗上，则隐藏弹窗
        //   if (!isMovingToYjBox && !isMovingToMarker && !that.isMouseOnYjBox) {
        //     if (typeof that !== "undefined") {
        //       that.isYjlx = false;
        //     }
        //   }
        // });
      });
    },
    getSearchDeviceDataInfo() {
      searchDeviceDataInfo({
        devId: this.jbxxObj.devId
      }).then(res => {
        this.stageDischargeData = res;
        this.getStageDischargeChart(res);
      });
    },
    getStageDischargeChart(list) {
      const myChart = echarts.init(
        document.getElementById("stageDischargeChart")
      );

      if (list.length === 0) {
        return;
      }

      // 1. 定义数据
      // const categories = ["100年", "600年", "1100年", "1600年"];
      // const series = [
      //   { name: "水位", data: [10, 10, 30, 12] },
      //   { name: "流量", data: [5, 12, 11, 14] }
      // ];
      const categories = [];
      const categoriesTime = [];
      const series = [
        { name: "水位", data: [] },
        { name: "流量", data: [] }
      ];
      list.forEach(item => {
        series[0].data.push(item.sw);
        series[1].data.push(item.ll);
        categoriesTime.push(item.time);
        categories.push(moment(item.time).format("MM-DD"));
      });
      const colorList = ["#FFB729", "#00B6FF"];

      // 2. 根据数据构造 ECharts 的 series 数组，并附加区域渐变
      const seriesArr = series.map((item, idx) => ({
        name: item.name,
        type: "line",
        data: item.data,
        // symbolSize: 4,
        symbol: "circle",
        smooth: false,
        // 最后一条（这里只两条，所以 idx===1 的为右侧 Y 轴）
        yAxisIndex: idx === series.length - 1 ? 1 : 0,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
            { offset: 0, color: colorList[idx] },
            { offset: 1, color: colorList[idx] }
          ])
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colorList[idx] + "80" }, // 半透明
            { offset: 1, color: colorList[idx] + "10" } // 更透明
          ])
        }
        // itemStyle: {
        //   color: colorList[idx],
        //   borderColor: "#ffffff",
        //   borderWidth: 2
        // }
      }));

      // 方法：将重复的日期替换为空字符串
      const processedDates = categories.map((date, index) => {
        // 检查当前日期是否是第一次出现
        const isFirstOccurrence = categories.indexOf(date) === index;
        return isFirstOccurrence ? date : "";
      });

      // 保存完整时间数组，供 tooltip 使用
      const fullTimeList = categoriesTime.map(time => {
        try {
          return moment(time).format('YYYY-MM-DD HH:mm');
        } catch (e) {
          return time || '';
        }
      });

      // 3. 最终构造完整的 option
      const option = {
        legend: {
          icon: "circle",
          top: "0%",
          x: "center",
          itemWidth: 6,
          itemGap: 20,
          textStyle: { color: "#fff" }
        },
        grid: {
          top: "10%",
          bottom: 50,
          left: "10%",
          right: "10%"
        },
        tooltip: {
          trigger: "axis",
          color: "#fff",
          textStyle: { color: "#fff" },
          borderWidth: 0,
          axisPointer: { type: "shadow" },
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          formatter: function(params) {
            if (!params || params.length === 0) {
              return '';
            }
            // 获取完整时间
            const timeIndex = params[0].dataIndex;
            const fullTime = fullTimeList[timeIndex] || params[0].axisValue || '';

            let result = `时间: ${fullTime}<br/>`;
            params.forEach(param => {
              if (param.value !== null && param.value !== undefined) {
                const unit = param.seriesName === '水位' ? 'cm' : '立方米/s';
                result += `${param.seriesName}: ${param.value}${unit}<br/>`;
              }
            });
            return result;
          }
        },
        xAxis: [
          {
            type: "category",
            name: "日期",
            nameLocation: "start",
            nameGap: 10,
            nameTextStyle: {
              color: "#fff",
              fontSize: 12
            },
            data: processedDates,
            axisLine: { lineStyle: { color: "#8FD14F" } },
            axisTick: { show: false },
            axisLabel: {
              interval: 0,
              textStyle: { color: "#fff", fontSize: 12 },
              formatter: function(value, index) {
                if (index === 0) {
                  return "2025-" + value;
                } else {
                  return value || "";
                }
              }
            }
            // axisPointer: {
            //   label: {
            //     padding: [0, 0, 10, 0],
            //     margin: 15,
            //     fontSize: 12,
            //     backgroundColor: {
            //       type: "linear",
            //       x: 0,
            //       y: 0,
            //       x2: 0,
            //       y2: 1,
            //       colorStops: [
            //         { offset: 0, color: "#fff" },
            //         { offset: 0.86, color: "#fff" },
            //         { offset: 0.86, color: "#33c0cd" },
            //         { offset: 1, color: "#33c0cd" }
            //       ]
            //     }
            //   }
            // },
            // boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: "value",
            name: "水位高度：cm",
            nameTextStyle: { color: "#fff" },
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
              textStyle: { color: "#fff" },
              formatter: function(value) {
                // 去掉0值显示
                if (value === 0) {
                  return '';
                }
                return value;
              }
            },
            splitLine: {
              show: true,
              lineStyle: { type: "dashed", color: "rgba(255,255,255,0.3)" }
            }
          },
          {
            type: "value",
            name: "水位流量：立方米/s",
            nameTextStyle: { color: "#fff" },
            position: "right",
            axisTick: { show: false },
            axisLabel: {
              textStyle: { color: "#fff" },
              formatter: function(value) {
                // 去掉0值显示
                if (value === 0) {
                  return '';
                }
                return value;
              }
            },
            axisLine: { show: false },
            splitLine: { show: false }
          }
        ],
        series: seriesArr
      };

      myChart.setOption(option);
    },
    // 获取实时气象数据
    getWeatherRealtimeData() {
      if (!this.jbxxObj.devId) {
        return;
      }
      obtainRealTimeData({
        devId: this.jbxxObj.devId
      }).then(res => {
        if (res && Array.isArray(res)) {
          this.weatherRealtimeDataList = res;
        }
      }).catch(err => {
        console.error('获取实时气象数据失败:', err);
      });
    },
    getWeatherHistoryParamList() {
      indicatorList().then(res => {
        if (res && Array.isArray(res) && res.length > 0) {
          this.weatherHistoryParamList = res;
          // 如果还没有选择参数，默认选择第一个
          if (!this.weatherHistoryParam) {
            this.weatherHistoryParam = res[0].code;
          }
          // 参数列表加载完成后，获取历史数据
          this.getWeatherHistoryData();
        }
      }).catch(err => {
        console.error('获取参数列表失败:', err);
        this.$message.error('获取参数列表失败，请稍后重试');
      });
    },
    // 初始化气象数据
    initWeatherData() {
      // 默认设置为最近一周（今天往前推7天）
      if (!this.weatherHistoryDateRange) {
        const endDate = moment();
        const startDate = moment().subtract(6, 'days'); // 往前推6天，加上今天共7天
        this.weatherHistoryDateRange = [startDate, endDate];
      }
      // 获取参数列表（参数列表加载完成后会自动调用获取历史数据）
      this.$nextTick(() => {
        this.getWeatherHistoryParamList();
      });
    },
    // 获取气象历史数据
    getWeatherHistoryData() {
      // 检查必要的参数
      if (!this.jbxxObj.devId) {
        console.warn('设备ID不存在，无法获取历史数据');
        return;
      }

      if (!this.weatherHistoryParam) {
        console.warn('未选择参数，无法获取历史数据');
        return;
      }

      const dateRange = this.getWeatherHistoryDateRange();
      if (!dateRange) {
        console.warn('未选择时间范围，无法获取历史数据');
        return;
      }

      // 调用真实接口获取历史数据
      historyObtainRealTimeData({
        devId: this.jbxxObj.devId,
        startTime: dateRange.startDate.format('YYYY-MM-DD'),
        endTime: dateRange.endDate.format('YYYY-MM-DD'),
        type: this.weatherHistoryParam
      }).then(data => {
        if (data && data && Array.isArray(data)) {
          // 处理接口返回的数据，转换为图表和表格需要的格式
          const processedData = this.processHistoryData(data);
          this.weatherHistoryData = processedData;
          this.$nextTick(() => {
            this.getWeatherHistoryChart(processedData);
          });
        } else {
          console.warn('接口返回数据格式不正确', data);
          this.weatherHistoryData = [];
          this.$nextTick(() => {
            this.getWeatherHistoryChart([]);
          });
        }
      }).catch(err => {
        console.error('获取气象历史数据失败:', err);
        this.$message.error('获取历史数据失败，请稍后重试');
        this.weatherHistoryData = [];
        this.$nextTick(() => {
          this.getWeatherHistoryChart([]);
        });
      });
    },
    // 处理历史数据，转换为图表和表格需要的格式
    processHistoryData(dataList) {
      if (!dataList || dataList.length === 0) {
        return [];
      }
      // 获取当前选中参数的标签和单位
      const selectedParam = this.weatherHistoryParamList.find(item => item.code === this.weatherHistoryParam);
      const paramLabel = selectedParam ? selectedParam.name : '数值';

      // 更新表格列标题（需要创建新数组，因为Vue的响应式系统）
      this.weatherHistoryColumns = [
        {
          title: "时间",
          dataIndex: "time",
          key: "time",
          width: "50%",
          align: "center"
        },
        {
          title: paramLabel,
          dataIndex: "value",
          key: "value",
          width: "50%",
          align: "center"
        }
      ];

      // 转换数据格式
      const processedData = dataList.map((item, index) => {
        // 处理时间格式
        let timeStr = '--';
        if (item.time) {
          try {
            timeStr = moment(item.time).format('YYYY-MM-DD HH:mm');
          } catch (e) {
            console.warn('时间格式解析失败:', item.time);
            timeStr = item.time || '--';
          }
        }

        return {
          time: timeStr,
          value: item.zb,
          key: index
        };
      });

      // 按时间排序
      processedData.sort((a, b) => {
        if (a.time === '--' || b.time === '--') return 0;
        return moment(a.time).valueOf() - moment(b.time).valueOf();
      });

      return processedData;
    },
    // 绘制气象历史图表
    getWeatherHistoryChart(list) {
      const chartElement = document.getElementById("weatherHistoryChart");
      if (!chartElement) {
        return;
      }

      // 如果图表已经初始化，先销毁
      const existingChart = echarts.getInstanceByDom(chartElement);
      if (existingChart) {
        existingChart.dispose();
      }

      const myChart = echarts.init(chartElement);

      if (!list || list.length === 0) {
        // 清空图表
        myChart.setOption({
          title: {
            text: '暂无数据',
            left: 'center',
            top: 'middle',
            textStyle: {
              color: '#fff',
              fontSize: 16
            }
          }
        });
        return;
      }

      // 获取当前选中参数的标签和单位
      const selectedParam = this.weatherHistoryParamList.find(item => item.code === this.weatherHistoryParam);
      const paramInfo = selectedParam || { name: '数值', unit: '' };

      // 如果没有单位信息，根据参数类型推断
      // const paramMap = {
      //   pressure: { label: '气压', unit: 'hPa', name: '气压' },
      //   temperature: { label: '温度', unit: '°C', name: '温度' },
      //   humidity: { label: '湿度', unit: '%', name: '湿度' },
      //   windSpeed: { label: '风速', unit: 'm/s', name: '风速' },
      //   windDirection: { label: '风向', unit: '°', name: '风向' },
      //   rainfall: { label: '降雨量', unit: 'mm', name: '降雨量' }
      // };
      const defaultParam = { label: '数值', unit: '', name: '数值' };
      const finalParam = {
        name: paramInfo.name || defaultParam.name,
        label: defaultParam.label,
        unit: paramInfo.unit || defaultParam.unit
      };

      const categories = [];
      const seriesData = [];

      list.forEach(item => {
        // 处理数值
        const value = item.value === '--' || item.value === null || item.value === undefined ? null : item.value;
        if (!isNaN(value)) {
          seriesData.push(value);
        } else {
          seriesData.push(null); // 使用null表示缺失数据
        }

        // 处理时间，格式为 MM-DD HH:mm
        let timeStr = '';
        if (item.time && item.time !== '--') {
          try {
            timeStr = moment(item.time).format("MM-DD HH:mm");
          } catch (e) {
            timeStr = item.time;
          }
        }
        categories.push(timeStr);
      });

      const colorList = ["#FFB729"];

      const seriesArr = [{
        name: finalParam.name,
        type: "line",
        data: seriesData,
        symbol: "circle",
        smooth: false,
        showSymbol: false, // 不显示折线上的点
        connectNulls: true, // 连接空值
        lineStyle: {
          width: 2,
          color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
            { offset: 0, color: colorList[0] },
            { offset: 1, color: colorList[0] }
          ])
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colorList[0] + "80" },
            { offset: 1, color: colorList[0] + "10" }
          ])
        }
      }];

      // 判断是否需要显示滚动条（数据点超过10个时显示滚动条）
      const needScroll = categories.length > 10;

      // 计算初始显示范围（如果需要滚动条，默认显示最前面10个数据点）
      const startIndex = 0;
      const endIndex = needScroll ? Math.min(9, categories.length - 1) : categories.length - 1;

      const option = {
        legend: {
          icon: "circle",
          top: "0%",
          x: "center",
          itemWidth: 6,
          itemGap: 20,
          textStyle: { color: "#fff" }
        },
        grid: {
          top: "10%",
          bottom: needScroll ? 100 : 80, // 如果有滚动条，底部留更多空间
          left: "12%",
          right: "10%"
        },
        tooltip: {
          trigger: "axis",
          color: "#fff",
          textStyle: { color: "#fff" },
          borderWidth: 0,
          axisPointer: { type: "line" },
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          formatter: function(params) {
            if (params && params.length > 0 && params[0].value !== null) {
              const value = params[0].value;
              const time = params[0].axisValue || '';
              return `${time}<br/>${finalParam.name}: ${value}`;
            }
            return '';
          }
        },
        dataZoom: needScroll ? [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: ((endIndex + 1) / categories.length) * 100,
            bottom: 20,
            height: 20,
            handleStyle: {
              color: '#8FD14F'
            },
            textStyle: {
              color: '#fff'
            },
            borderColor: '#8FD14F',
            fillerColor: 'rgba(143, 209, 79, 0.2)',
            dataBackground: {
              lineStyle: {
                color: '#8FD14F'
              },
              areaStyle: {
                color: 'rgba(143, 209, 79, 0.1)'
              }
            },
            selectedDataBackground: {
              lineStyle: {
                color: '#8FD14F'
              },
              areaStyle: {
                color: 'rgba(143, 209, 79, 0.3)'
              }
            }
          },
          {
            type: 'inside',
            xAxisIndex: [0],
            start: 0,
            end: ((endIndex + 1) / categories.length) * 100
          }
        ] : [],
        xAxis: [
          {
            type: "category",
            name: "日期",
            nameLocation: "start",
            nameGap: 10,
            nameTextStyle: {
              color: "#fff",
              fontSize: 12
            },
            data: categories, // 直接使用所有数据，不处理
            axisLine: { lineStyle: { color: "#8FD14F" } },
            axisTick: { show: false },
            axisLabel: {
              interval: 0, // 显示所有标签
              textStyle: { color: "#fff", fontSize: 12 },
              rotate: needScroll ? 45 : (categories.length > 10 ? 45 : 0), // 有滚动条时旋转45度
              formatter: function(value) {
                return value || '';
              }
            },
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: "value",
            name: finalParam.name,
            nameTextStyle: { color: "#fff" },
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
              textStyle: { color: "#fff" },
              formatter: function(value) {
                // 去掉0值显示
                if (value === 0) {
                  return '';
                }
                return value;
              }
            },
            splitLine: {
              show: true,
              lineStyle: { type: "dashed", color: "rgba(255,255,255,0.3)" }
            }
          }
        ],
        series: seriesArr
      };

      myChart.setOption(option);

      // 响应式调整
      window.addEventListener('resize', () => {
        myChart.resize();
      });
    },
    // 气象历史日期范围变更
    onWeatherHistoryDateRangeChange(dates, dateStrings) {
      if (dates && dates.length === 2) {
        // dates[0] 是开始时间，dates[1] 是结束时间
        // dateStrings[0] 是开始时间字符串，dateStrings[1] 是结束时间字符串
        this.getWeatherHistoryData();
      }
    },
    // 获取时间范围的开始时间和结束时间
    getWeatherHistoryDateRange() {
      if (this.weatherHistoryDateRange && this.weatherHistoryDateRange.length === 2) {
        return {
          startTime: this.weatherHistoryDateRange[0].format('YYYY-MM-DD HH:mm:ss'),
          endTime: this.weatherHistoryDateRange[1].format('YYYY-MM-DD HH:mm:ss'),
          startDate: this.weatherHistoryDateRange[0],
          endDate: this.weatherHistoryDateRange[1]
        };
      }
      return null;
    },
    // 气象历史参数变更
    onWeatherHistoryParamChange(value) {
      this.getWeatherHistoryData();
    },
    searchDevice() {
      // const that = this;
      const checkedList = this.plainOptions3.filter(item => item.isCheck);
      if (checkedList.length === 0) {
        this.$message.error("请选择设备类型");
        return;
      }
      if (this.searchValue === "") {
        this.sbData = [];
        this.getSearchDeviceInfo(this.plainOptions3[0].value);
        return false;
      }
      this.getSearchDeviceInfo(this.plainOptions3[0].value);
      setTimeout(() => {
        searchDeviceInfo({
          subType: this.plainOptions3[0].value,
          name: this.searchValue
        }).then(res => {
          this.sbData = res;
          this.sbData.forEach(item => {
            let iconUrl = require("../assets/images/mark/jcdw_fyj.png");
            let obj = {
              devId: item.devId,
              subType: item.subType,
              lon: item.lon,
              devName: item.devName,
              lat: item.lat,
              baseType: item.baseType
            };
            diitgis.addMarker([item.lon, item.lat], iconUrl, obj, "jcdw");
          });
        });
      }, 1000);
    },
    showJczd(item) {
      this.getSearchDeviceInfo(this.plainOptions3[0].value);
      setTimeout(() => {
        let iconUrl = require("../assets/images/mark/jcdw_yj.png");
        let obj = {
          devId: item.devId,
          subType: item.subType,
          lon: item.lon,
          devName: item.devName,
          lat: item.lat,
          baseType: item.baseType
        };
        diitgis.addMarker([item.lon, item.lat], iconUrl, obj, "jcdw");
        this.earthMap.setZoom(10);
        this.earthMap.zoomToExtent([item.lon, item.lat]);
      }, 1000);
    },
    clearMapPoint() {
      //获取class元素
      let jcdw = document.getElementsByClassName("jcdw");
      let jcdw_yj = document.getElementsByClassName("jcdw_yj");
      for (let i = 0; i < jcdw_yj.length; i++) {
        jcdw_yj[i].style.display = "none";
      }
      for (let i = 0; i < jcdw.length; i++) {
        jcdw[i].style.display = "none";
      }

      // 移除事件监听器
      if (this.clickHandler) {
        document.removeEventListener("click", this.clickHandler);
        this.clickHandler = null;
      }
      if (this.mouseOverHandler) {
        document.removeEventListener("mouseover", this.mouseOverHandler);
        this.mouseOverHandler = null;
      }
      if (this.mouseOutHandler) {
        document.removeEventListener("mouseout", this.mouseOutHandler);
        this.mouseOutHandler = null;
      }

      // 清除定时器和状态
      if (this.hideYjBoxTimer) {
        clearTimeout(this.hideYjBoxTimer);
        this.hideYjBoxTimer = null;
      }
      this.isYjlx = false;
      this.isMouseOnYjBox = false;
      this.currentMarkerElement = null;

      this.$emit("setJcsbLegendShow", false);
    },
    // 处理弹窗鼠标进入事件
    handleYjBoxMouseEnter(e) {
      // 取消隐藏定时器
      if (this.hideYjBoxTimer) {
        clearTimeout(this.hideYjBoxTimer);
        this.hideYjBoxTimer = null;
      }
      this.isMouseOnYjBox = true;
    },
    // 处理弹窗鼠标离开事件
    handleYjBoxMouseLeave(e) {
      // 先设置标志为 false
      this.isMouseOnYjBox = false;

      // 检查鼠标是否移到了监测点位上
      const relatedTarget = e.relatedTarget;

      if (relatedTarget && typeof relatedTarget.closest === 'function') {
        const isMovingToMarker = relatedTarget.closest(".jcdw") || relatedTarget.closest(".jcdw_yj");
        // 如果鼠标移到了监测点位上，不隐藏弹窗
        if (isMovingToMarker) {
          return;
        }
      }

      // 延迟隐藏弹窗，给鼠标移动到监测点位的时间
      if (this.hideYjBoxTimer) {
        clearTimeout(this.hideYjBoxTimer);
      }

      const that = this;
      this.hideYjBoxTimer = setTimeout(() => {
        // 再次检查鼠标是否在弹窗上（可能在延迟期间鼠标又移回来了）
        if (that.isMouseOnYjBox) {
          that.hideYjBoxTimer = null;
          return;
        }

        // 检查鼠标是否在监测点位上（使用全局鼠标位置）
        if (that.hideYjBoxTimer) {
          // 使用 document.elementFromPoint 检查当前鼠标位置下的元素
          // 注意：这需要在鼠标事件中获取坐标，但 mouseleave 事件可能没有坐标
          // 所以我们主要依赖 isMouseOnYjBox 标志和 relatedTarget
          const activeElement = document.elementFromPoint(
            (window.event && window.event.clientX) || 0,
            (window.event && window.event.clientY) || 0
          );
          if (activeElement && typeof activeElement.closest === 'function') {
            const marker = activeElement.closest(".jcdw") || activeElement.closest(".jcdw_yj");
            if (marker) {
              // 鼠标在监测点位上，不隐藏
              that.hideYjBoxTimer = null;
              return;
            }
            const yjBox = activeElement.closest(".yj-body-box");
            if (yjBox) {
              // 鼠标还在弹窗上，不隐藏
              that.isMouseOnYjBox = true;
              that.hideYjBoxTimer = null;
              return;
            }
          }
        }

        // 隐藏弹窗
        if (!that.isMouseOnYjBox && that.isYjlx) {
          that.isYjlx = false;
        }
        that.hideYjBoxTimer = null;
      }, 150); // 延迟150ms，给鼠标移动到监测点位的时间
    },
    // 初始化地图事件监听
    initMapEvents() {
      if (!this.earthMap) return;

      const that = this;

      // 监听地图移动事件（如果 earthMap 有相关事件）
      if (this.earthMap.on) {
        // 如果地图对象有 on 方法，使用它来监听事件
        if (this.earthMap.camera) {
          // Cesium 类型的地图
          this.earthMap.camera.moveEnd.addEventListener(() => {
            if (that.hideYjBoxTimer) {
              clearTimeout(that.hideYjBoxTimer);
              that.hideYjBoxTimer = null;
            }
            that.isMouseOnYjBox = false;
            that.isYjlx = false;
          });
          this.earthMap.camera.changed.addEventListener(() => {
            if (that.hideYjBoxTimer) {
              clearTimeout(that.hideYjBoxTimer);
              that.hideYjBoxTimer = null;
            }
            that.isMouseOnYjBox = false;
            that.isYjlx = false;
          });
        } else if (this.earthMap.on) {
          // 其他类型的地图，尝试监听常见事件
          this.earthMap.on('moveend', () => {
            if (that.hideYjBoxTimer) {
              clearTimeout(that.hideYjBoxTimer);
              that.hideYjBoxTimer = null;
            }
            that.isMouseOnYjBox = false;
            that.isYjlx = false;
          });
          this.earthMap.on('zoomend', () => {
            if (that.hideYjBoxTimer) {
              clearTimeout(that.hideYjBoxTimer);
              that.hideYjBoxTimer = null;
            }
            that.isMouseOnYjBox = false;
            that.isYjlx = false;
          });
          this.earthMap.on('pan', () => {
            if (that.hideYjBoxTimer) {
              clearTimeout(that.hideYjBoxTimer);
              that.hideYjBoxTimer = null;
            }
            that.isMouseOnYjBox = false;
            that.isYjlx = false;
          });
        }
      }

      // 监听地图容器的 DOM 事件作为备用方案
      const mapContainer = document.querySelector('.cesium-viewer') ||
                          document.querySelector('.map-container') ||
                          document.querySelector('[class*="map"]') ||
                          document.body;

      if (mapContainer && !this._mapWheelHandler) {
        // 监听鼠标滚轮缩放
        this._mapWheelHandler = (e) => {
          if (e.ctrlKey || e.metaKey || e.deltaY !== 0) {
            if (that.hideYjBoxTimer) {
              clearTimeout(that.hideYjBoxTimer);
              that.hideYjBoxTimer = null;
            }
            that.isMouseOnYjBox = false;
            that.isYjlx = false;
          }
        };
        mapContainer.addEventListener('wheel', this._mapWheelHandler, { passive: true });

        // 监听鼠标移动（用于检测地图拖拽）
        this._mapMouseDown = false;
        this._mapMouseDownHandler = () => {
          that._mapMouseDown = true;
        };
        this._mapMouseUpHandler = () => {
          if (that._mapMouseDown) {
            if (that.hideYjBoxTimer) {
              clearTimeout(that.hideYjBoxTimer);
              that.hideYjBoxTimer = null;
            }
            that.isMouseOnYjBox = false;
            that.isYjlx = false;
            that._mapMouseDown = false;
          }
        };
        mapContainer.addEventListener('mousedown', this._mapMouseDownHandler);
        mapContainer.addEventListener('mouseup', this._mapMouseUpHandler);
        document.addEventListener('mouseup', this._mapMouseUpHandler);
      }
    },
    // 移除地图事件监听
    removeMapEvents() {
      const mapContainer = document.querySelector('.cesium-viewer') ||
                          document.querySelector('.map-container') ||
                          document.querySelector('[class*="map"]') ||
                          document.body;

      if (mapContainer && this._mapWheelHandler) {
        mapContainer.removeEventListener('wheel', this._mapWheelHandler);
        this._mapWheelHandler = null;
      }

      if (mapContainer && this._mapMouseDownHandler) {
        mapContainer.removeEventListener('mousedown', this._mapMouseDownHandler);
        this._mapMouseDownHandler = null;
      }

      if (this._mapMouseUpHandler) {
        mapContainer && mapContainer.removeEventListener('mouseup', this._mapMouseUpHandler);
        document.removeEventListener('mouseup', this._mapMouseUpHandler);
        this._mapMouseUpHandler = null;
      }

      // 移除地图对象的事件监听（如果有）
      // 注意：Cesium 等地图库的事件通常不需要手动移除，或者需要使用特定的移除方法
      // 这里主要移除 DOM 事件监听
    }
  },
  watch: {
    earthMap: {
      handler(newVal) {
        if (newVal) {
          this.$nextTick(() => {
            this.initMapEvents();
          });
        }
      },
      immediate: true
    },
    isYjlx(newVal) {
      // 当弹窗隐藏时，重置鼠标在弹窗上的标志和清除定时器
      if (!newVal) {
        this.isMouseOnYjBox = false;
        if (this.hideYjBoxTimer) {
          clearTimeout(this.hideYjBoxTimer);
          this.hideYjBoxTimer = null;
        }
      }
    }
  },
  mounted() {
    // 监听地图容器的滚动和缩放事件
    this.$nextTick(() => {
      this.initMapEvents();
    });
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    if (this.timer3) {
      clearInterval(this.timer3);
      this.timer3 = null;
    }
    // 清除隐藏弹窗的定时器
    if (this.hideYjBoxTimer) {
      clearTimeout(this.hideYjBoxTimer);
      this.hideYjBoxTimer = null;
    }
    // 移除地图事件监听
    this.removeMapEvents();
  }
};
</script>
<style scoped lang="less">
.box {
  position: absolute;
  right: 4.6rem;
  top: 0.7rem;
  width: 380px;
  border-radius: 4px;
  z-index: 999;
  background-color: rgba(0, 58, 133, 0.8);
  border-radius: 8px;
  padding: 5px;

  .radio {
    width: 100%;
    padding: 8px 5px;
    border-bottom: 1px solid rgba(105, 162, 232, 0.66);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .content {
    padding: 10px 10px;
  }
}
.jczd-box {
  /deep/ .ant-checkbox-wrapper + .ant-checkbox-wrapper {
    margin-left: 0px;
  }
  .search-box {
    display: flex;
    align-items: center;
    padding-top: 10px;
    margin-top: 10px;
    border-top: 1px solid rgba(105, 162, 232, 0.66);
    .search-btn {
      margin-left: 10px;
    }
  }
  .search-result-list-box {
    margin-top: 10px;
    max-height: 200px;
    overflow-y: auto;
    li {
      display: grid;
      grid-template-columns: 50px 1fr 1fr;
      padding: 10px;
      border-top: 1px solid rgba(105, 162, 232, 0.66);
      border-bottom: 1px solid rgba(105, 162, 232, 0.66);
      cursor: pointer;
      span {
        font-size: 14px;
        color: #ffffff;
      }
    }
  }
}
.jcdw-tab-box {
  display: flex;
  width: 400px;
  background: linear-gradient(
    304deg,
    rgba(0, 98, 186, 0.58) 6%,
    rgba(0, 92, 147, 0.62) 93%
  );
  border: 1px solid;
  border-image: linear-gradient(
      180deg,
      #59b2ff,
      rgba(62, 173, 242, 0) 37%,
      rgba(41, 170, 232, 0) 65%,
      #419aff
    )
    1 1;
  border-radius: 4px;
  li {
    flex: 1;
    height: 40px;
    line-height: 40px;
    text-align: center;
    font-size: 14px;
    color: #ffffff;
    cursor: pointer;
    &.active {
      background: linear-gradient(120deg, #3d97f9 12%, #1482d8 89%);
      border-radius: 3px 0px 0px 3px;
      color: #fff;
    }
  }
}
.jcdw-body-box {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  height: calc(100% - 60px);
  margin-top: 20px;
  .main-title {
    display: flex;
    align-items: center;
    height: 40px;
    i {
      width: 4px;
      height: 14px;
      background: #459eff;
      border-radius: 3px;
      margin-right: 7px;
    }
    span {
      font-size: 16px;
      color: #8fc8ff;
      font-family: AlibabaPuHuiTi;
    }
  }
  .left-box {
    // background: red;
    .chart-box {
      width: 100%;
      height: calc(100% - 40px);
    }
  }
  .rigth-box {
    .jcxx-top-box {
      height: 160px;
      /deep/ .ant-descriptions-bordered .ant-descriptions-item-label {
        background: rgba(47, 150, 255, 0.29);
        color: #cee7ff;
      }
      /deep/ .ant-descriptions-bordered .ant-descriptions-item-label,
      /deep/ .ant-descriptions-bordered .ant-descriptions-item-content {
        border: 1px solid rgba(30, 132, 206, 0.58);
      }
      /deep/ .ant-descriptions-bordered .ant-descriptions-view {
        border: 1px solid rgba(30, 132, 206, 0.58);
        border-radius: 0;
      }
      /deep/ .ant-descriptions-item-content {
        color: #ffffff;
      }
    }
    .xqxx-bottom-box {
      height: calc(100% - 160px);
      margin-top: 10px;
    }
  }
}
.video-body-box {
  width: 100%;
  height: calc(100% - 60px);
  margin-top: 20px;
  .top-box {
    height: 40px;
  }
  .bottom-box {
    height: 512px;
  }
  video {
    width: 100%;
    height: 100%;
  }
}

.yj-body-box{
  min-width: 300px;
  min-height: 200px;
  background: rgba(0, 58, 133, 0.8);
  border-radius: 8px;
  padding: 0;
  position: fixed;
  z-index: 9999;
  .yj-body-box-header{
    padding: 10px;
    border-bottom: 1px solid rgba(105, 162, 232, 0.66);
    display: flex;
    justify-content: space-between;
    align-items: center;
    .yj-body-box-header-title{
      font-size: 16px;
      color: #fff;
      font-weight: bold;
    }
    .yj-body-box-header-close{
      text-align: right;
      color: #fff;
      cursor: pointer;
    }
  }
  .yj-tab-box{
    display: flex;
    padding: 0;
    margin: 0;
    border-bottom: 1px solid rgba(105, 162, 232, 0.66);
    li{
      flex: 1;
      padding: 10px 15px;
      text-align: center;
      color: #fff;
      cursor: pointer;
      border-right: 1px solid rgba(105, 162, 232, 0.66);
      transition: all 0.3s;
      &:last-child{
        border-right: none;
      }
      &:hover{
        background: rgba(0, 182, 255, 0.3);
      }
      &.active{
        background: linear-gradient(120deg, #3d97f9 12%, #1482d8 89%);
        color: #fff;
      }
      &.more-tab{
        color: #00B6FF;
        font-weight: bold;
      }
    }
  }
  .yj-body-box-content{
    padding: 10px;
    .yj-body-box-item{
      display: flex;
      flex-direction: column;
      gap: 10px;
      color: #ffffff;
      .yj-item-row{
        display: flex;
        align-items: flex-start;
        line-height: 24px;
        .yj-label{
          min-width: 100px;
          color: #cee7ff;
          font-weight: normal;
          text-align: right;
        }
        .yj-value{
          flex: 1;
          color: #ffffff;
          padding-left: 10px;
          background-color: rgba(0, 182, 255, 0.2);
        }
      }
    }
    .yj-no-data{
      text-align: center;
      color: #8fc8ff;
      padding: 20px 0;
    }
  }
}
.yj-list-body-box{
  width: 100%;
  height: calc(100% - 60px);
  margin-top: 20px;
  /deep/ .ant-table{
    background: transparent;
    .ant-table-thead > tr > th{
      background: rgba(47, 150, 255, 0.29);
      color: #cee7ff;
      border: 1px solid rgba(30, 132, 206, 0.58);
    }
    .ant-table-tbody > tr > td{
      background: transparent;
      color: #ffffff;
      border: 1px solid rgba(30, 132, 206, 0.58);
    }
    .ant-table-tbody > tr:hover > td{
      background: rgba(0, 182, 255, 0.2);
    }
  }
}
.weather-body-box {
  width: 100%;
  height: calc(100% - 60px);
  margin-top: 20px;
  display: flex;
  flex-direction: column;

  .weather-realtime-box {
    margin-bottom: 20px;

    /deep/ .ant-descriptions-bordered .ant-descriptions-item-label {
      background: rgba(47, 150, 255, 0.29);
      color: #cee7ff;
    }
    /deep/ .ant-descriptions-bordered .ant-descriptions-item-label,
    /deep/ .ant-descriptions-bordered .ant-descriptions-item-content {
      border: 1px solid rgba(30, 132, 206, 0.58);
    }
    /deep/ .ant-descriptions-bordered .ant-descriptions-view {
      border: 1px solid rgba(30, 132, 206, 0.58);
      border-radius: 0;
    }
    /deep/ .ant-descriptions-item-content {
      color: #ffffff;
    }
  }

  .weather-history-box {
    flex: 1;
    display: flex;
    flex-direction: column;

    .main-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 40px;
      margin-bottom: 15px;

      .title-left {
        display: flex;
        align-items: center;
      }

      i {
        width: 4px;
        height: 14px;
        background: #459eff;
        border-radius: 3px;
        margin-right: 7px;
      }

      span {
        font-size: 16px;
        color: #8fc8ff;
        font-family: AlibabaPuHuiTi;
      }
    }

    .history-controls {
      display: flex;
      align-items: center;

      /deep/ .ant-calendar-picker,
      /deep/ .ant-select {
        .ant-calendar-picker-input,
        .ant-select-selection {
          background: rgba(47, 150, 255, 0.15);
          border: 1px solid rgba(30, 132, 206, 0.58);
          color: #ffffff;
        }

        .ant-calendar-picker-input input,
        .ant-select-selection-selected-value {
          color: #ffffff;
        }

        .ant-calendar-picker-icon,
        .ant-select-arrow {
          color: #ffffff;
        }
      }
    }

    .history-content {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;

      .history-chart-box {
        .chart-box {
          width: 100%;
          height: 100%;
          min-height: 300px;
        }
      }

      .history-table-box {
        /deep/ .ant-table {
          background: transparent;

          .ant-table-thead > tr > th {
            background: rgba(47, 150, 255, 0.29);
            color: #cee7ff;
            border: 1px solid rgba(30, 132, 206, 0.58);
          }

          .ant-table-tbody > tr > td {
            background: transparent;
            color: #ffffff;
            border: 1px solid rgba(30, 132, 206, 0.58);
          }

          .ant-table-tbody > tr:hover > td {
            background: rgba(0, 182, 255, 0.2);
          }
        }
      }
    }
  }
}
</style>
