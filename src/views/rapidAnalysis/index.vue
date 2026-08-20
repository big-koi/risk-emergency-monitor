<!-- 快速分析 -->
<template>
  <div class="rapid-analysis" style="width: 100%;height: 100%;">
    <!-- 蒙板 -->
    <div class="left-mask-box"></div>
    <!-- 更新时间 -->
    <div class="new-date-time">
      <span style="display: inline-block; vertical-align: middle;">
        更新时间： {{ newTime }}</span>
      <a-tooltip overlayClassName="tooltipStyle" placement="bottom">
        <template #title>
          <span style="color: #FFAD00;">{{ taskStatus }}</span>
        </template>
        <img v-if="taskStatus" src="@/assets/images/tishi.png" alt="" class="taskStatus" />
      </a-tooltip>
    </div>
    <!-- 滚动播放预警 -->
    <WarningScrollBanner :list="scrollTopList" />
    <!-- 左侧模块切换 -->
    <div class="side-btns">
      <!-- <img src="@/assets/images/sideIcon/layer.png" alt="" /> -->
      <a-tooltip placement="right">
        <template slot="title">
          <span>全国未来三小时短临预报</span>
        </template>
        <div class="side-btn-item">
          <img src="@/assets/images/sideIcon/forecast.png" alt="" @click="tabDisasterType(1)" />
          <div class="badge" v-if="byCountJb > 0 && currentActiveModule !== 1" :data-value="byCountJb"></div>
        </div>
        <div style="font-size: 0.14rem;color: #64B1FF;cursor: pointer;" @click="tabDisasterType(1)">
          短临预报
        </div>
      </a-tooltip>
      <a-popover placement="rightTop">
        <template slot="content">
          <a-radio-group v-model="liveRainType" @change="onLiveRainTypeChange">
            <a-radio :style="{ display: 'block', height: '30px', lineHeight: '30px' }" value="6">
              6h降雨
            </a-radio>
            <a-radio :style="{ display: 'block', height: '30px', lineHeight: '30px' }" value="12">
              12h降雨
            </a-radio>
            <a-radio :style="{ display: 'block', height: '30px', lineHeight: '30px' }" value="24">
              24h降雨
            </a-radio>
            <!-- <a-radio :style="{ display: 'block', height: '30px', lineHeight: '30px' }" value="other">
              自定义范围
            </a-radio> -->
          </a-radio-group>
        </template>
        <template slot="title">
          <span>实况累计降雨</span>
        </template>
        <div class="side-btn-item">
          <img src="@/assets/images/sideIcon/live.png" alt="" @click="tabDisasterType(2)" />
        </div>
        <div style="font-size: 0.14rem;color: #64B1FF;cursor: pointer;" @click="tabDisasterType(2)">
          实况降雨
        </div>
      </a-popover>
      <a-popover placement="rightTop">
        <template slot="content">
          <a-radio-group v-model="csnlValue" @change="csnlTabCheck">
            <a-radio :style="{ display: 'block', height: '30px', lineHeight: '30px' }" value="1">
              未来三小时
            </a-radio>
            <a-radio :style="{ display: 'block', height: '30px', lineHeight: '30px' }" value="2">
              过去三小时
            </a-radio>
          </a-radio-group>
        </template>
        <template slot="title">
          <span>城市内涝</span>
        </template>
        <div class="side-btn-item">
          <img src="@/assets/images/sideIcon/depth.png" alt="" @click="tabDisasterType(3)" />
          <div class="badge" v-if="nlCountJb > 0 && currentActiveModule !== 3" :data-value="nlCountJb"></div>
        </div>
        <div style="font-size: 0.14rem;color: #64B1FF;cursor: pointer;" @click="tabDisasterType(3)">
          城市内涝
        </div>
      </a-popover>
      <a-popover placement="rightTop">
        <template slot="content">
          <a-radio-group v-model="shValue" @change="shTabCheck">
            <a-radio :style="{ display: 'block', height: '30px', lineHeight: '30px' }" value="1">
              未来三小时
            </a-radio>
            <a-radio :style="{ display: 'block', height: '30px', lineHeight: '30px' }" value="2">
              过去三小时
            </a-radio>
          </a-radio-group>
        </template>
        <template slot="title">
          <span>山洪</span>
        </template>
        <div class="side-btn-item">
          <img src="@/assets/images/sideIcon/shMenu.png" alt="" @click="tabDisasterType(4)" />
          <div class="badge" v-if="shCountJb > 0 && currentActiveModule !== 4" :data-value="shCountJb"></div>
        </div>
        <div style="font-size: 0.14rem;color: #64B1FF;text-align: center;cursor: pointer;" @click="tabDisasterType(4)">
          山洪
        </div>
      </a-popover>
    </div>
    <!-- 预警信息弹窗 -->
    <WarningInfoPanel
      :visible="warningInfoVisible"
      :loading="warningInfoLoading"
      :displayRegion="warningInfoDisplayRegion"
      :warningInfo="currentWarningInfo"
      @close="warningInfoVisible = false"
      @locate="locateRainfallCenter"
    />
    <!-- 地图标题 -->
    <div class="map-title-box">
      <img class="left-icon" src="@/assets/images/sideIcon/triangle.png" alt="" />
      <p>{{ mapTitleName }}</p>
      <p v-if="disasterTypeIndex != 2">{{ dateTime }}</p>
      <p v-if="disasterTypeIndex === 2">
        {{ wlDataTime }} - {{ taskSelectedTime }}
      </p>
      <img class="right-icon" src="@/assets/images/sideIcon/triangle.png" alt="" />
    </div>
    <!-- 自定义时间 -->
    <div class="date-picker-box" v-show="liveRainType === 'other' && disasterTypeIndex === 2">
      <a-range-picker showTime format="YYYY-MM-DD HH:mm:ss" v-model="liveDate" @change="handleDateChange" />
    </div>
    <!-- map切换 -->
    <div class="mapChange" @click="changMapShow" v-if="[3, 4].includes(disasterTypeIndex)">
      <div class="box">
        <img src="../../assets/images/2d.png" alt="" v-if="isMapType" />
        <img src="../../assets/images/3d.png" alt="" v-else />
      </div>
    </div>
    <!-- 重构阶段可见：行政区新 Store / MapFacade 状态 -->
    <RegionStatusPanel
      :olPreviewVisible="olPreviewVisible"
      @toggle-ol-preview="olPreviewVisible = !olPreviewVisible"
    />
    <OlPreviewMap
      :visible="olPreviewVisible"
      :regionCode="($store.getters['region/mapRegion'] && $store.getters['region/mapRegion'].code) || ''"
      :regionName="($store.getters['region/mapRegion'] && $store.getters['region/mapRegion'].name) || ''"
      :imageLayer="olPreviewImageLayer"
      @close="olPreviewVisible = false"
    />
    <!-- 地图工具条 + 任务列表 -->
    <MapToolbarShell
      :showTaskListBtn="isTaskListBtn"
      :taskListOpen="showTaskList"
      @identify="showIdentify"
      @open-layers="openLayerList"
      @open-favorites="openCaseCollcetion"
      @toggle-task-list="openTaskList"
    >
      <template slot="region">
        <buttonPostion
          :regionDisplayLabel="regionToolbarDisplayLabel"
          @upladeLine="upladeLine"
          @positionXzqCode="getPositionXzqCode"
          @regionBack="handleRegionNavigateBack"
          ref="buttonPostion"
        />
      </template>
      <template slot="task-list">
        <TaskListPanel
          :visible="showTaskList"
          :timeList="taskTimeDataList"
          :showStar="isCaseCollectionDetailsShow"
          :formatTime="adjustForecastTime"
          @close="showTaskList = false"
          @back="taskTimeDataList = []"
          @select-latest="taskItemClick('new')"
          @select-item="taskItemClick"
          @calendar-select="taskCalendarSelect"
          @star="starCase"
        />
      </template>
    </MapToolbarShell>
    <!-- 点位查询 / 基础图层（壳组件） -->
    <IdentifyPanelShell
      ref="identifyPanelShell"
      :earthMap="earthMap"
      :identifyShow="IdentifyShow"
      @addMaker="addMaker"
      @closeClick="closeClick"
      @printStar="printStarClick"
    />
    <BaseLayerPanelShell
      ref="baseLayerPanelShell"
      :visible="isOpenLayerList"
      :earthMap="earthMap"
      @openLayer="openLayer"
      @ischeck="ischeck"
      @setJcsbLegendShow="setJcsbLegendShow"
    />
    <!-- 预警城市侧卡 + 列表弹窗 -->
    <WarningCitySidePanel
      :disasterTypeIndex="disasterTypeIndex"
      :byVisible.sync="byVisible"
      :nlVisible.sync="nlVisible"
      :shVisible.sync="shVisible"
      :byCount="byCount"
      :byChange="byChange"
      :byData="byData"
      :byColumns="byColumns"
      :nlCount="nlCount"
      :nlChange="nlChange"
      :nlData="nlData"
      :nlColumns="nlColumns"
      :csnlValue="csnlValue"
      :shValue="shValue"
      :showStar="isCaseCollectionDetailsShow"
      @star-case="starCaseData"
    />
    <!-- <div class="warning-card" v-if="false">
      <p class="type">
        <a-icon type="thunderbolt" />
        暴雨预警
      </p>
      <p class="location">广东省-惠州市</p>
    </div> -->
    <!-- 地图 -->
    <zf-earth v-show="!isMapType" ref="earth" tool-left-more @onLoad="earthLoaded" @changeBaseMap="changeBaseMap"
      :showMapTool="isHideTool" :showLeftTool.sync="showLeftTool">
    </zf-earth>
    <!-- 三维地图 -->
    <threeMap v-show="isMapType" ref="threeMap"></threeMap>
    <div class="statisticsBtn" v-if="statisticsBtnShow" @click="showStatistics">
      <img src="../../assets/images/rapidAnalysis/statistics.png" />
    </div>
    <!-- 统计图和表格 -->
    <div class="statisticalChart" v-if="isInitTableChart">
      <RankingListPanel
        :disasterTypeIndex="disasterTypeIndex"
        :rankingListTitle="rankingListTitle"
        :tjuTabChke="tjuTabChke"
        :jyOrderType="jyOrderType"
        :skOrderType="skOrderType"
        :forecastList="wlsxsjyRainRankList"
        :liveList="skjsRainRankList"
        :floodList="jssdRainRankList"
        :mountainList="sHjssdRainRankList"
        :showStar="isCaseCollectionDetailsShow"
        :csnlValue="csnlValue"
        :shValue="shValue"
        :noData="floodCrossDrillNoData && (disasterTypeIndex === 3 || disasterTypeIndex === 4)"
        @toggle-tjt-tab="tjtTabCheck"
        @sort-forecast="jyPx"
        @sort-live="skPx"
        @open-detail="openDetailsChart"
        @star-case="starCaseData"
      />
      <StatisticsChartPanel
        ref="statsChartPanel"
        :title="statisticsChartTitle"
        :tjuTabChke="tjuTabChke"
        :disasterTypeIndex="disasterTypeIndex"
        :noData="floodCrossDrillNoData && (disasterTypeIndex === 3 || disasterTypeIndex === 4)"
      />
    </div>
    <!-- 详情钻取图表（暴雨 / 实况 / 积水） -->
    <DetailChartsPanel
      ref="detailChartsPanel"
      :mode="detailChartMode"
      :title="detailsTitleXzqh"
      :byChartType="byChartType"
      :jsChartType="jsChartType"
      :csnlValue="csnlValue"
      @back="returnToInitTableChart"
      @by-chart-type="byChangeChartType"
      @js-chart-type="jsChangeChartType"
    />
    <!-- 时间轴分辨率 / 淹没模式 Tab -->
    <TimelineResolutionTabs
      :disasterTypeIndex="disasterTypeIndex"
      :isJsDetailsChart="isJsDetailsChart"
      :csnlValue="csnlValue"
      :shValue="shValue"
      :floodActive="timeTabActive"
      :shortTermActive="dltimeTabActive"
      @flood-change="timeTabActiveType"
      @short-term-change="duanlinTimeChange"
    />
    <TimeAxis ref="timeAxis" v-if="timeAxisShow" key="timeId" @updateDateTime="updateDateTime"
      :timeTabActive="timeTabActive" :timeData="timeData"></TimeAxis>
    <!-- 图例 -->
    <MapLegendPanel
      :visible="legendShow"
      :bottom="mapLegendBottom"
      :disasterTypeIndex="disasterTypeIndex"
      :riverLayers="hlTlData"
      :showMonitor="isJcsbLegendShow"
      :isSkDetailsChart="isSkDetailsChart"
      :showWarningLevel="gqsxstl"
      :checks="{
        yjcs: yjcsTlCheckData,
        qxyj: qxyjCheckkData,
        jylzdgw: jylzdgwCheckData,
        jyfw: jyfwTlCheckData,
        jydj: jydjTlCheckData,
        jssd: jssdTlCheckData
      }"
      @toggle-yjcs="yjcsTlCheck"
      @toggle-qxyj="qxyjCheck"
      @toggle-jylzdgw="jylzdgwCheck"
      @toggle-jyfw="jyfwTlCheck"
      @toggle-jydj="jydjTlCheck"
      @toggle-jssd="jssdTlCheck"
    />
    <!-- 地图点位弹窗 -->
    <MapMarkerPopup
      :visible="popupShow"
      :model="identifyModel"
      :lon="identifyModellon"
      :lat="identifyModellat"
      @close="closeIdentify"
    />
    <!-- 案例收藏模块 -->
    <CaseCollectionPanels
      ref="caseCollectionPanels"
      :seeShow.sync="isCaseCollectionSeeShow"
      :selectShow.sync="isCaseCollectionSelectShow"
      :listShow.sync="isCaseListShow"
      :detailsShow="isCaseCollectionDetailsShow"
      :fullscreen="isCaseCollectionFullscreen"
      :caseList="caseList"
      :searchValue.sync="caseSearchValue"
      :selectValue="caseSelectValue"
      :caseDetailsId="caseDetailsId"
      :isNewCaseMode="isNewCaseMode"
      @open-list-details="openCaseListDetails"
      @search="getCaseAll"
      @create="createCase"
      @view="showCaseDetails"
      @select-change="caseSelectChange"
      @confirm-add="addCaseToCollection"
      @delete="onCaseDelete"
      @expand-details="showScreenCaseDetails"
      @collapse-details="hideScreenCaseDetails"
      @close-details="closeCaseDetails"
      @save="handleSaveCase"
      @history-task="caseHistoryTaskClick"
      @see-print="seePrint"
    />
  </div>
</template>

<script>
import ZfEarth from "../../components/Earth/Earth";
import threeMap from "../../components/threeMap/index";
import _Uuid from "uuid";
import {
  resetList,
  getToken,
  getYjcsCount
} from "@/api/rapidAnalysis/index.js";
import {
  createRegionContext
} from "./regionContext.js";
import { TreeSelect } from "ant-design-vue";
const SHOW_PARENT = TreeSelect.SHOW_PARENT;
import Vue from "vue";
import TimeAxis from "../../components/rapidAnalysis/timeAxis.vue";
import geoLocation from "../../components/rapidAnalysis/geoLocation.vue";
import ResourceMenu from "../../components/rapidAnalysis/resourceMenu.vue";
import { myMixin } from "./mixin.js";
import { mapFacadeMixin } from "./mixins/mapFacadeMixin.js";
import { panelRefsMixin } from "./mixins/panelRefsMixin.js";
import { rainfallCacheMixin } from "./mixins/rainfallCacheMixin.js";
import { moduleSwitchApplyMixin } from "./mixins/moduleSwitchApplyMixin.js";
import { floodLayerBatchMixin } from "./mixins/floodLayerBatchMixin.js";
import { adminBoundaryMixin } from "./mixins/adminBoundaryMixin.js";
import { regionSessionMixin } from "./mixins/regionSessionMixin.js";
import { regionNavigateMixin } from "./mixins/regionNavigateMixin.js";
import { warningLocateMixin } from "./mixins/warningLocateMixin.js";
import { mapInitMixin } from "./mixins/mapInitMixin.js";
import { taskListMixin } from "./mixins/taskListMixin.js";
import { caseCollectionMixin } from "./mixins/caseCollectionMixin.js";
import { floodPeriodTabMixin } from "./mixins/floodPeriodTabMixin.js";
import { rankingFetchMixin } from "./mixins/rankingFetchMixin.js";
import { detailDrillMixin } from "./mixins/detailDrillMixin.js";
import { floodRankMapMixin } from "./mixins/floodRankMapMixin.js";
import { timelineOpsMixin } from "./mixins/timelineOpsMixin.js";
import { pageShellMixin } from "./mixins/pageShellMixin.js";
import buttonPostion from "../../components/buttonPostion/index.vue";
import RegionStatusPanel from "../../components/rapidAnalysis/RegionStatusPanel.vue";
import OlPreviewMap from "../../components/rapidAnalysis/OlPreviewMap.vue";
import RankingListPanel from "./components/RankingListPanel.vue";
import WarningInfoPanel from "./components/WarningInfoPanel.vue";
import StatisticsChartPanel from "./components/StatisticsChartPanel.vue";
import WarningCitySidePanel from "./components/WarningCitySidePanel.vue";
import DetailChartsPanel from "./components/DetailChartsPanel.vue";
import WarningScrollBanner from "./components/WarningScrollBanner.vue";
import TimelineResolutionTabs from "./components/TimelineResolutionTabs.vue";
import MapLegendPanel from "./components/MapLegendPanel.vue";
import TaskListPanel from "./components/TaskListPanel.vue";
import MapMarkerPopup from "./components/MapMarkerPopup.vue";
import MapToolbarShell from "./components/MapToolbarShell.vue";
import CaseCollectionPanels from "./components/CaseCollectionPanels.vue";
import IdentifyPanelShell from "./components/IdentifyPanelShell.vue";
import BaseLayerPanelShell from "./components/BaseLayerPanelShell.vue";
import {
  getShortTermMapTitle,
} from "./modules/shortTermForecast";
//暴雨
const byColumns = [
  {
    title: "序号",
    dataIndex: "num",
    key: "num",
    width: 80,
    scopedSlots: { customRender: "num" },
    align: "center"
  },
  {
    title: "省名",
    dataIndex: "shengname",
    key: "shengname",
    align: "center"
  },
  {
    title: "市名",
    dataIndex: "shiname",
    key: "shiname",
    align: "center"
  },
  {
    title: "预警时间",
    key: "yjtime",
    dataIndex: "yjtime",
    align: "center"
  },
  {
    title: "预警指标",
    key: "maxprcp",
    dataIndex: "maxprcp",
    align: "center",
    scopedSlots: { customRender: "maxprcp" }
  },
  {
    title: "",
    key: "star",
    dataIndex: "star",
    align: "center",
    width: 50,
    scopedSlots: { customRender: "star" }
  }
];

const byData = [];

//内涝
const nlColumns = [
  {
    title: "序号",
    dataIndex: "num",
    key: "num",
    width: 80,
    scopedSlots: { customRender: "num" },
    align: "center"
  },
  {
    title: "省名",
    dataIndex: "shengname",
    key: "shengname",
    align: "center"
  },
  {
    title: "市名",
    dataIndex: "shiname",
    key: "shiname",
    align: "center"
  },
  {
    title: "预警时间",
    key: "pgtime",
    dataIndex: "pgtime",
    align: "center"
  }
  // {
  //   title: "预警等级",
  //   key: "yjlevel",
  //   scopedSlots: { customRender: "yjlevel" },
  //   align: 'center'
  // }
];

const nlData = [];

// 短临降水图例
export default {
  name: "rapidAnalysis",
  mixins: [myMixin, mapFacadeMixin, panelRefsMixin, rainfallCacheMixin, moduleSwitchApplyMixin, floodLayerBatchMixin, adminBoundaryMixin, regionSessionMixin, regionNavigateMixin, warningLocateMixin, mapInitMixin, taskListMixin, caseCollectionMixin, floodPeriodTabMixin, rankingFetchMixin, detailDrillMixin, floodRankMapMixin, timelineOpsMixin, pageShellMixin],
  components: {
    ZfEarth,
    TimeAxis,
    geoLocation,
    ResourceMenu,
    threeMap,
    buttonPostion,
    RegionStatusPanel,
    OlPreviewMap,
    RankingListPanel,
    WarningInfoPanel,
    StatisticsChartPanel,
    WarningCitySidePanel,
    DetailChartsPanel,
    WarningScrollBanner,
    TimelineResolutionTabs,
    MapLegendPanel,
    TaskListPanel,
    MapMarkerPopup,
    MapToolbarShell,
    CaseCollectionPanels,
    IdentifyPanelShell,
    BaseLayerPanelShell
  },
  provide: function () {
    //依赖注入
    return {
      eventBus: this.eventBus
    };
  },
  data() {
    return {
      identifyOverlay: null,
      locateRequestId: 0,
      olPreviewVisible: false,
      olPreviewImageLayer: null,
      identifyModel: { jyl: "", name: "" },
      popupShow: false,
      identifyModellon: "",
      identifyModellat: "",
      IdentifyShow: false,
      isOpenLayerList: false,
      earthMap: null,
      isMapType: false, //false为2维
      tableDirllObj: "", //表格下钻数据
      taskStatus: "",
      baseUrl: window.servicesConfig.servicesUrl,
      basemapShows: [],
      codes: ["000000"],
      xzqdm: window.sessionStorage.getItem("xzqdm"),
      showLeftTool: false,
      statisticsBtnShow: false,
      showLogModal: false,
      timerInterval: null,
      SHOW_PARENT,
      timeListAll: [],
      regionValue: [],
      taskInfoJb: "",
      eventBus: new Vue(),
      isShowBar: false,
      componentName: "",
      currentStep: 1,
      stepData: null,
      legendShow: true,
      // 后端地址
      servicesUrl: window.servicesConfig.servicesUrl,
      // 初始面板是否显示
      isShowInitPanel: true,
      // 步骤条的当前步骤
      currStep: "1",
      // 表格的默认数据
      tableDefaultData: [],
      // 表格头部
      tableHeader: [],
      total: 0,
      // 是否隐藏工具条
      isHideTool: false,
      stepsData: [],
      overviewData: [],
      stepInfo: [],
      loading: false,
      lineShow: false,
      tableShow: false,
      regionOptions: [
        {
          value: "zhejiang",
          label: "Zhejiang",
          children: [
            {
              value: "hangzhou",
              label: "Hangzhou",
              children: [
                {
                  value: "xihu",
                  label: "West Lake"
                }
              ]
            }
          ]
        }
      ],
      pageSize: 10,
      current: 1,
      total: 0,
      barOption: {},
      lineOption: {},
      fininshStep: 0,
      region: "",
      dateTime: "",
      addedFeatures: [],
      regions: [],
      resourceMenuLayerIds: [
        "sheng",
        "shi",
        "xian",
        "first",
        "second",
        "third",
        "DEM",
        "hwsm",
        "xzhl",
        "xly",
        "hp",
        "rkgw",
        "rkmd",
        "GDP",
        "gdmj",
        "ym",
        "xm",
        "sd",
        "gd",
        "gsgl",
        "jc",
        "tl"
      ],
      liveRainType: "6",
      csnlValue: "1",
      shValue: "1",
      showTaskList: false,
      isTaskListBtn: true,
      taskColumns: [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          align: "center",
          width: "20%",
          customRender: (text, record, index) => index + 1
        },
        {
          title: "历史任务",
          dataIndex: "taskname",
          key: "taskname",
          align: "center",
          width: "80%",
          scopedSlots: { customRender: "taskname" }
        }
      ],
      taskList: [],
      disasterTypeIndex: 1, // 1未来三小时降雨 2降水排行 3积水深度排行
      warningInfoVisible: true,
      warningInfoLoading: false,
      warningInfoRequestId: 0,
      rainfallWarningInfo: null,
      rainfallWarningRawData: null,
      csnlWarningInfo: null,
      csnlWarningRawData: null,
      shWarningInfo: null,
      shWarningRawData: null,
      currentActiveModule: 1, // 当前激活的模块，1:短临预报, 2:实况降雨, 3:城市内涝, 4:山洪
      wlsxsjyRainRankList: [],
      skjsRainRankList: [],
      jyOrderType: "sumjyDesc",
      skOrderType: "sumjslDesc",
      jssdRainRankList: [],
      sHjssdRainRankList: [],
      byVisible: false,
      byColumns,
      byData,
      byCount: 0,
      byChange: 0,
      nlVisible: false,
      shVisible: false,
      nlColumns,
      nlData,
      nlCount: 0,
      nlChange: 0,
      shCount: 0,
      myChart: null,
      myDetailsChart: null,
      rankingListTitle: "降水排行（未来三小时）", // 排行名称
      tjuTabChke: "六小时累计",
      WLTABLEcolumns: [
        {
          title: "行政区",
          dataIndex: "name",
          key: "name",
          align: "center",
          ellipsis: true
        },
        {
          title: "累计降雨量",
          dataIndex: "sum",
          key: "sum",
          align: "center",
          scopedSlots: { customRender: "sum" },
          ellipsis: true
        },
        {
          title: "最大小时降雨量",
          dataIndex: "max",
          key: "max",
          align: "center",
          scopedSlots: { customRender: "max" },
          ellipsis: true
        }
      ],
      jsPhcolumns: [
        {
          title: "行政区",
          dataIndex: "name",
          key: "name",
          align: "center",
          ellipsis: true
        },
        {
          title: "过去累计降雨量",
          dataIndex: "sum",
          key: "sum",
          align: "center",
          scopedSlots: { customRender: "sum" },
          ellipsis: true
        }
      ],
      JSSDcolumns: [
        {
          title: "行政区",
          dataIndex: "name",
          key: "name",
          align: "center",
          ellipsis: true
        },
        {
          title: "最大积水时间",
          dataIndex: "datatime",
          key: "datatime",
          align: "center",
          scopedSlots: { customRender: "datatime" },
          ellipsis: true
        },
        {
          title: "最大积水深度",
          dataIndex: "sum",
          key: "sum",
          align: "center",
          scopedSlots: { customRender: "sum" },
          ellipsis: true
        }
      ],
      statisticsChartTitle: "降水统计（未来三小时）", // 统计图名称
      isInitTableChart: true,
      isByDetailsChart: false,
      isSkDetailsChart: false,
      isJsDetailsChart: false,
      isSHDetailsChart: false,
      pendingCrossModuleFloodDrill: null,
      floodCrossDrillNoData: false,
      floodMapNoSubmergedData: false,
      floodSubmergedRequestId: 0,
      floodSubmergedOlLayers: [],
      floodSubmergedLoadTimer: null,
      byChartType: "hour",
      jsChartType: "hour",
      byDatailsBarData: null, //详情数据
      jsDatailsLineData: null, //详情数据
      liveDate: [undefined, undefined], // 自定义时间
      taskSelectedTime: null,
      detailsTitleXzqh: "",
      timeTabActive: 2, // 1历史淹没 2未来淹没
      dltimeTabActive: 3,
      timeData: [], // 时间轴传递数据
      scrollTopList: [], // 顶部滚动播报
      mapTitleName: getShortTermMapTitle(),
      dlLegendObj: {
        levels: window.webConfig.dlLevels,
        colors: window.webConfig.dlColors
      },
      newTime: null, //最新时间
      jsImageExtent: [], //积水的城市四至范围
      setIntervalTime: null,
      threeCreated: 1,
      nlthreeCreated: 1,
      gqsxstl: true,
      jylzdgwCheckData: true,
      taskTimeDataList: [], // 历史任务时间列表
      positionXzqCode: "",
      regionContext: createRegionContext(),
      // 案例收藏
      caseList: [],
      caseSearchValue: "",
      caseDetailsId: "",
      isNewCaseMode: false,
      caseSelectValue: undefined,
      isCaseCollectionSeeShow: false, // 查看案例
      isCaseCollectionSelectShow: false, // 选择案例
      isCaseCollectionDetailsShow: false, // 案例详情
      isCaseCollectionFullscreen: false, // 详情缩小状态
      coordinatePoint: {}, // 点位经纬度
      caseTaskId: "",
      singleCollectType: "",
      isCaseListShow: false,
      isNowTime: true,
      isJcsbLegendShow: false,
      historyTaskTime: null, // 历史时间记录，用于持久化切换到历史时间的状态
      byCountJb: 0,
      nlCountJb: 0,
      shCountJb: 0,
      //地图缓存
      layerCache: new Map(), // 用来缓存图层，key可以是时间、文件名等唯一标识
      drillCurrentVisibleLayerKey: null, // 当前正在显示的钻取图层 key
      currentVisibleLayerKey: null, // 当前正在显示的图层 key
      updateDateTimeCurrentVisibleLayerKey: null, // 当前正在显示的图层 key
      imageExtent: [
        73.06457922444216,
        17.43170579946752,
        135.47990896511072,
        54.09018157258503
      ]
    };
  },
  watch: {
    currentStep: {
      handler(n, o) {
        let taskInfo = JSON.parse(sessionStorage.getItem("taskInfo"));
        this.taskInfoJb = taskInfo.jb;
      }
    }
  },
  errorCaptured(err, vm, info) {
    console.error(err, vm, info); // 这里可以添加错误处理逻辑
    return true; // 返回true表示继续向父组件传递错误，false则停止冒泡
  },
  created() {

  },
  mounted() {
    // 根据窗口大小变化
    const _this = this;
    this.handleResize = () => {
      this.resizeSumChart();
      if (this.myDetailsChart) {
        this.myDetailsChart.resize();
      }
    };
    window.addEventListener("resize", this.handleResize);
    // 重构：初始化 region Store（当前灾种 + 全国浏览）
    this.syncRegionStoreModule(this.disasterTypeIndex || 1);
    this.syncRegionStoreBrowse("", "全国");
    this.getTaskList(1); // 初始化加载任务列表

    // 监听地图点位的class点击事件
    this.handleMapClick = (event) => {
      if (event.target.classList.contains("byyj")) {
        event.stopPropagation();
        const itemData = JSON.parse(event.target.getAttribute("item"));
        if (process.env.NODE_ENV === 'development') {
          console.log("itemData", itemData);
        }
        this.searchBackward("byyj", itemData);
      }
      if (event.target.classList.contains("qxyj")) {
        event.stopPropagation();
        const itemData = JSON.parse(event.target.getAttribute("item"));
        if (process.env.NODE_ENV === 'development') {
          console.log("itemData", itemData);
        }
        this.searchBackward("qxyj", itemData);
      }
      if (event.target.classList.contains("skjyXz")) {
        event.stopPropagation();
        const itemData = JSON.parse(event.target.getAttribute("item"));
        if (process.env.NODE_ENV === 'development') {
          console.log("itemData", itemData);
        }
        this.searchBackward("skjyXz", itemData);
      }
    };
    document.addEventListener("click", this.handleMapClick, false);

    // 定时刷新接口
    this.setIntervalTime = setInterval(() => {
      // 如果当前是历史时间模式，只刷新预警数量，不刷新任务列表
      if (!this.isNowTime) {
        getYjcsCount().then(res => {
          if (res.code === 200) {
            this.byCountJb = res.data.step1;
            this.nlCountJb = res.data.step3;
            this.shCountJb = res.data.step4;
          }
        });
        return;
      }

      let params = {
        taskTime: this.taskSelectedTime,
        taskType:
          this.disasterTypeIndex == 3 && this.csnlValue == 1
            ? "2"
            : this.disasterTypeIndex == 3 && this.csnlValue == 2
              ? "4"
              : this.disasterTypeIndex == 2
                ? "3"
                : 1
      };
      resetList(params).then(res => {
        if (res.code == 200) {
          if (res.data == "true") {
            // case中第一个if是判断是否是详情页面
            switch (this.disasterTypeIndex) {
              case 1:
                if (this.isByDetailsChart) {
                  this.$nextTick(() => {
                    this.getJsDataXz(this.tableDirllObj);
                  });
                } else {
                  this.getTaskList(1);
                  if (this.tjuTabChke == "六小时累计") {
                    this.getSixData();
                  }
                }
                break;
              case 2:
                if (this.isSkDetailsChart) {
                  this.$nextTick(() => {
                    this.getSkJsDataXz(item);
                  });
                } else {
                  this.getTaskList(3);
                  this.getSkJsData();
                }
                break;
              case 3:
                if (this.csnlValue == 1) {
                  if (this.isJsDetailsChart) {
                    this.$nextTick(() => {
                      this.getJssdDataXz(this.tableDirllObj);
                    });
                  } else {
                    this.getTaskList(2);
                  }
                } else {
                  if (this.isJsDetailsChart) {
                    this.$nextTick(() => {
                      this.getJSsdXzMes(this.tableDirllObj);
                    });
                  } else {
                    this.getTaskList(4);
                  }
                }
                break;
              case 4:
                break;
            }
          }
        }
      });

      getYjcsCount().then(res => {
        if (res.code === 200) {
          this.byCountJb = res.data.step1;
          this.nlCountJb = res.data.step3;
          this.shCountJb = res.data.step4;
        }
      });
    }, 50000);
    getYjcsCount().then(res => {
        if (res.code === 200) {
          this.byCountJb = res.data.step1;
          this.nlCountJb = res.data.step3;
          this.shCountJb = res.data.step4;
        }
      });
  },
  beforeDestroy() {
    // 清理定时器
    if (this.setIntervalTime) {
      clearInterval(this.setIntervalTime);
      this.setIntervalTime = null;
    }

    // 清理事件监听器
    if (this.handleMapClick) {
      document.removeEventListener("click", this.handleMapClick, false);
    }

    // 清理 ECharts 实例
    this.disposeSumChart();
    if (this.myDetailsChart) {
      this.myDetailsChart.dispose();
      this.myDetailsChart = null;
    }

    // 清理窗口 resize 监听器
    if (this.handleResize) {
      window.removeEventListener("resize", this.handleResize);
    }
  }
};
</script>

<style scoped lang="less">
@import "./index.less";
</style>
