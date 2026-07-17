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
import diitgis from "@/components/Layer/LayerManagerForDiitGIS";
import threeMap from "../../components/threeMap/index";
import _Uuid from "uuid";
import moment from "moment";
import * as echarts from "echarts";
import {
  getByyjcsData,
  getJsData,
  getjsTime,
  getByyjcsSJZ,
  getJsDataXz,
  getSkJsData,
  getSkJsPngUrl,
  getSkJsDataXz,
  getNlyjcsData,
  getJssdData,
  getTaskList,
  getJssdDataXz,
  searchXzqfw,
  getFwByXzqCode,
  getNowTime,
  getDljySJZZB,
  getSKLSSJZZB,
  geWlSixData,
  getjssdGqSix,
  getjssdGqSixCsyj,
  getSKLSJssdDataXz,
  getSKLSSJZ,
  getDljySJZJZT,
  getSKLSSJZJZT,
  resetList,
  getShTimeData,
  getShYJcsGQ,
  getShYJcsWL,
  getShJsPhGQ,
  getShJsPhWL,
  getToken,
  getShJsGQXZ,
  getShJsWLXZ,
  getjcqAndShLk,
  dljySixMinSjz,
  dljyOnehoursSjz,
  dljyThreeHoursSjz,
  searchQxtYj,
  getYjcsCount,
  queryRainfallRange,
  queryFloodRangeCsnl,
  queryFloodRangeSh
} from "@/api/rapidAnalysis/index.js";
import {
  buildRainfallWarningInfo,
  buildCsnlWarningInfo,
  buildShWarningInfo,
  getEmptyRainfallWarningInfo,
  getEmptyCsnlWarningInfo,
  getEmptyShWarningInfo,
  extractCenterGridRainfall,
  formatAddressFromTianditu,
  normalizeLonLat,
  parseCenterPoint
} from "./warningInfoHelper.js";
import {
  createRegionContext,
  resolveDrillRegion,
  getRainfallDrillCode,
  getQueryCode,
  getWarningCodeFromContext,
  pickMostSpecificRegionCode,
  promoteToFloodQueryCode,
  REGION_MODE
} from "./regionContext.js";
import {
  isCaseDetailsEditing,
  buildOpenCaseCollectionPatch,
  buildCreateCasePanelPatch,
  buildShowCaseDetailsPatch,
  buildCloseCaseDetailsPatch,
  buildExpandCaseDetailsPatch,
  buildCollapseCaseDetailsPatch,
  buildOpenCaseListDetailsPatch,
  buildPrintStarPrep,
  buildStarCasePrep,
  buildOpenSelectCasePatch,
  buildSingleCollectPointParams,
  buildSingleCollectDataParams,
  buildSaveCaseRequest,
  buildAfterSaveCasePatch,
  formatCaseHistoryTaskTime,
  fetchCaseList,
  requestSingleCollect,
  requestSaveCase,
  requestDeleteCase,
  requestCreateCaseDraft
} from "./modules/caseCollection";
import {
  buildBrowseSnapshotForDrill,
  buildEnterDrillPartial,
  buildExitDrillPartial,
  normalizeButtonRegionCode,
  normalizeBrowseStoreCode,
  planReconcileFromButton,
  shouldSaveBrowseSnapshot,
  resolveBrowseSnapshotLabel,
  buildBrowseSnapshotContext,
  buildPromoteDrillToBrowse,
  buildActiveBrowsePartial,
  planRestoreBrowseFromSnapshot,
  buildRestoreBrowsePartial,
  resolveActiveFloodXzqdm,
  planFloodBrowsePromotion,
  planSyncActiveRegionToButton,
  buildNationalBrowsePartial,
  buildExitTableDetailStatePatch,
  resolveExitTableDetailDrillAction,
  planRegionNavigateBack,
  resolveFloodQueryXzqdm,
  resolveFloodMapXzqdm,
  planAdoptCrossModuleRegion,
  planPositionXzqCodeChange,
  mergeRegionContextState,
  shouldShadowSyncBrowseStore,
  resolveRegionButtonLabelFromSources,
  resolveRegionDisplayLabelFromSources,
  buildToolbarRegionPayload
} from "./modules/regionSession";
import { TreeSelect } from "ant-design-vue";
const SHOW_PARENT = TreeSelect.SHOW_PARENT;
import Vue from "vue";
import TimeAxis from "../../components/rapidAnalysis/timeAxis.vue";
import geoLocation from "../../components/rapidAnalysis/geoLocation.vue";
import ResourceMenu from "../../components/rapidAnalysis/resourceMenu.vue";
import { myMixin } from "./mixin.js";
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
import { DISASTER_INDEX_MAP } from "@/domain/region/constants";
import {
  tryGetMapFacade,
  initLegacyMap
} from "@/map";
import {
  buildShortTermRankParams,
  shouldReloadShortTermRainfallLayers,
  fetchShortTermTimeline,
  getShortTermMapTitle,
  adaptShortTermRankList
} from "./modules/shortTermForecast";
import {
  buildLiveRainRankParams,
  buildLivePngParams,
  adaptLiveRainRankItem,
  buildLiveDrillParams,
  LIVE_PNG_IMAGE_EXTENT,
  LIVE_RAIN_LAYER_NAME
} from "./modules/liveRainfall";
import {
  mapRankResponseList,
  resolveFloodRankLoadStatus,
  resolveWarningCityStats
} from "./modules/rankings";
import {
  buildFloodRankParams as buildFloodRankParamsFromModule,
  adaptFloodRankItem,
  buildFloodDepthImageUrl,
  buildSubmergedExtremeImageUrl,
  parseLayerImageExtent,
  resolveFloodLayerConfig,
  buildFloodExtentQueryParams,
  buildSubmergedListQueryParams,
  filterSubmergedFilenames as filterSubmergedFilenamesFromModule,
  isFloodSubmergedRequestStale,
  resolveFloodIsFutureBrowse,
  resolveFloodLayerBatchStep,
  runSubmergedLayersParallel,
  mergeLayerExtents,
  buildCrossModuleFloodDrillPayload,
  shouldTryResumeCrossModuleFloodDrill,
  buildPendingFloodRegionPayload,
  findFloodRankRowForXzqdm as findFloodRankRowForXzqdmFromModule
} from "./modules/urbanFlood";
import {
  buildOlPreviewImagePayload,
  resolveFloodTimelineDataType,
  applyShortTermVisibleFrame,
  applyShortTermPreloadFrame,
  applyDrillPreloadFrame,
  buildDrillRainfallLayerKey,
  normalizeAdminBoundaryFeatures,
  resolveXzqLevelLabel,
  getDefaultAdminOutlineStyle,
  getDefaultHighlightBoundaryStyle,
  ADMIN_BOUNDARY_LAYER_IDS
} from "./modules/mapLayers";
import {
  shouldFetchRainfallWarning,
  shouldFetchCsnlWarning,
  shouldFetchShWarning,
  isWarningRequestStale,
  buildWarningQueryBundle,
  buildWarningDisplayOpts,
  resolveWarningApiPayload,
  prepareWarningCityDisplay,
  buildFloodWarningMarkerJobs,
  prepareRainstormWarningDisplay,
  buildQxtYjMarkerJobs,
  buildTiandituGeocodeUrl,
  parseTiandituAddress,
  parseTiandituGeocodeResult,
  pickWarningSectionsNeedingAddress,
  resolveWarningRegionParts,
  resolveWarningRegionLabel
} from "./modules/warnings";
import {
  resolveTaskTypeForModule,
  resolveTaskSelectedTime,
  planRefreshFloodModuleData,
  planRefreshBrowseAfterRegionChange,
  planRefreshListAfterExitDetail,
  planModuleSwitchRegionPrep,
  planModuleSwitchPending,
  planModuleSwitchBoundary,
  planModuleSwitchLoad,
  resolveFloodRankColumns,
  resolveShortTermRankColumnsOnSwitch,
  shouldSearchQxtYjOnSwitch,
  planModuleSwitchCleanup,
  buildTaskListUiResetFlags,
  planEmptyTaskListResult,
  buildPostTaskLoadExecution
} from "./modules/taskSession";
import {
  buildByDetailChartOption,
  buildSkDetailChartOption,
  buildJsDetailChartOption
} from "./modules/charts";
// 地图实例
let earthMap = {};
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
  mixins: [myMixin],
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
  computed: {
    /** 详情钻取图：统一 mode 供 DetailChartsPanel */
    detailChartMode() {
      if (this.isByDetailsChart) return "by";
      if (this.isSkDetailsChart) return "sk";
      if (this.isJsDetailsChart) return "js";
      return "";
    },
    /** 预警面板标题区：实时跟随当前行政区，避免展示上一次钻取缓存 */
    warningInfoDisplayRegion() {
      return this.getWarningRegionLabel();
    },
    /** 工具栏展示名：与 regionContext 对齐，避免按钮异步同步失败 */
    regionToolbarDisplayLabel() {
      const code = pickMostSpecificRegionCode([
        getQueryCode(this.regionContext),
        this.regionContext.warningCode,
        this.regionContext.code,
        this.positionXzqCode
      ]);
      if (!code) {
        return "";
      }
      return this.resolveRegionDisplayLabel(code) || "";
    },
    currentWarningInfo() {
      let info = null;
      if (this.disasterTypeIndex === 1 || this.disasterTypeIndex === 2) {
        info = this.rainfallWarningInfo;
      } else if (this.disasterTypeIndex === 3) {
        info = this.csnlWarningInfo;
      } else if (this.disasterTypeIndex === 4) {
        info = this.shWarningInfo;
      }
      if (!info) {
        return null;
      }
      if (this.newTime) {
        return { ...info, warningTime: this.newTime };
      }
      return info;
    },
    // 是否显示时间轴（内涝/山洪全国浏览默认隐藏，钻取详情保留）
    timeAxisShow() {
      if (this.disasterTypeIndex === 2) {
        return false;
      }
      if (
        (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) &&
        !this.isJsDetailsChart
      ) {
        return false;
      }
      return true;
    },
    mapLegendBottom() {
      if (this.disasterTypeIndex === 2) {
        return "0.1rem";
      }
      if (
        (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) &&
        !this.isJsDetailsChart
      ) {
        return "0.1rem";
      }
      return "1.5rem";
    },
    wlDataTime(val) {
      if (this.liveRainType != "other") {
        // 根据传入的值来获取之前的时间，比如传入12就获取当前taskSelectedTime的值12小时以前的时间
        const time = moment(this.taskSelectedTime)
          .subtract(Number(this.liveRainType), "hours")
          .format("YYYY-MM-DD HH:mm");
        return time;
      }
    }
  },
  errorCaptured(err, vm, info) {
    console.error(err, vm, info); // 这里可以添加错误处理逻辑
    return true; // 返回true表示继续向父组件传递错误，false则停止冒泡
  },
  created() {

  },
  methods: {
    moment,
    /**
     * 处理预警城市数据并添加到地图
     * @param {Array} list - 预警城市列表
     * @param {string} prefix - 类名前缀（如 'SH' 表示山洪）
     * @param {boolean} shouldAddMarker - 是否添加标记（用于过去三小时数据）
     */
    processWarningCityData(list, prefix = '', shouldAddMarker = true) {
      if (this.$refs.threeMap && this.isMapType) {
        this.$refs.threeMap.clearMaker();
      }
      const prepared = prepareWarningCityDisplay(list || [], {
        isMapType: this.isMapType,
        prefix: prefix
      });
      // 保持原引用上的 iconUrl，便于 3D addMaker 与后续逻辑
      (list || []).forEach(function(item, index) {
        const next = prepared.list[index];
        if (next) item.iconUrl = next.iconUrl;
      });
      this.scrollTopList = prepared.scrollTopList;

      if (this.isMapType && this.$refs.threeMap) {
        this.$refs.threeMap.addMaker(list);
      } else if (!this.isMapType && shouldAddMarker) {
        buildFloodWarningMarkerJobs(prepared.list).forEach(job => {
          this.addMarkerViaFacade(
            job.coordinate,
            job.imgUrl,
            job.data,
            job.type
          );
        });
      }
    },
    onDragResizable(event) {
      if (event.type === 'drag') {
        console.log(`拖拽中 - 位置: X=${event.x}, Y=${event.y}`);
        // 您可以在这里执行其他逻辑，如保存位置信息
      } else if (event.type === 'resize') {
        console.log(`调整大小中 - 宽度: ${event.width}, 高度: ${event.height}`);
        // 您可以在这里执行其他逻辑，如保存尺寸信息
      }
    },
    setJcsbLegendShow(type) {
      this.isJcsbLegendShow = type;
    },
    adjustForecastTime(forecastString) {
      // 1. 使用正则表达式匹配日期时间部分
      const datetimeMatch = forecastString.match(
        /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/
      );

      if (!datetimeMatch) {
        console.warn("未找到有效的时间格式");
        return forecastString;
      }

      const originalDatetime = datetimeMatch[1];
      const forecastContent = forecastString.slice(originalDatetime.length);

      // 2. 将时间字符串转换为Date对象
      const date = new Date(originalDatetime.replace(/-/g, "/"));

      // 3. 加一小时（自动处理跨日、跨月、跨年）
      date.setHours(date.getHours() + 1);

      // 4. 格式化为新的时间字符串
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      // const newDatetime = `${year}-${month}-${day} ${hours}:${minutes}`;
      const newDatetime = `${hours}:${minutes}`;
      // 5. 组合成新的预报字符串
      return newDatetime + forecastContent;
    },
    //获取最新时间
    getNowTime() {
      getNowTime({
        taskTime: this.taskSelectedTime
      }).then(res => {
        if (res.code === 200) {
          this.newTime = res.data;
        }
      });
    },
    /** 同步行政区上下文到工具栏（单一数据源入口） */
    applyRegionContext(partial, options = {}) {
      const {
        silent = false,
        skipButtonSync = false,
        skipBoundary = false,
        skipStore = false
      } = options;
      const next = mergeRegionContextState(this.regionContext, partial);
      this.regionContext = next;
      this.positionXzqCode = getQueryCode(next);

      if (shouldShadowSyncBrowseStore(next, skipStore)) {
        this.syncRegionStoreBrowse(
          normalizeBrowseStoreCode(next.code),
          next.label || "全国"
        );
      }

      if (!skipButtonSync && this.$refs.buttonPostion) {
        this.$refs.buttonPostion.applyRegionContext(
          buildToolbarRegionPayload(next, {
            silent: silent,
            skipBoundary: skipBoundary,
            resolveButtonLabel: ctx => this.resolveRegionButtonLabel(ctx),
            resolveDisplayLabel: code => this.resolveRegionDisplayLabel(code)
          })
        );
      }
    },
    /** 解析工具栏展示名称（下钻后 label 可能为空） */
    resolveRegionButtonLabel(ctx) {
      const ref = this.$refs.buttonPostion;
      const parts = this.getWarningRegionParts();
      return resolveRegionButtonLabelFromSources({
        ctx: ctx,
        isFloodModule:
          this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4,
        locationName: ref && ref.locationName,
        tableDirllObj: this.tableDirllObj,
        detailsTitleXzqh: this.detailsTitleXzqh,
        partsRegionLabel: parts && parts.regionLabel
      });
    },
    /** 模块切换/同步工具栏时解析展示名称（多源兜底） */
    resolveRegionDisplayLabel(code) {
      const codeStr = code ? String(code).trim() : "";
      const ctx = Object.assign({}, this.regionContext, {
        code: codeStr,
        warningCode: codeStr
      });
      return resolveRegionDisplayLabelFromSources({
        code: codeStr,
        ctxLabel: ctx.label,
        buttonLabel: this.resolveRegionButtonLabel(ctx),
        parts: this.getWarningRegionParts()
      });
    },
    resetRegionToNational(options = {}) {
      const { silent = false, skipMapClear = false } = options;
      this.navigateToNational({ skipButtonReset: silent });
      if (skipMapClear) {
        /* navigateToNational 已清地图；保留参数兼容旧调用 */
      }
    },
    /** 同步新 region Store：用户浏览选择 */
    syncRegionStoreBrowse(code, name) {
      this.$store.dispatch("region/selectRegion", {
        code: code || "",
        name: name || (code ? code : "全国")
      });
    },
    /** 同步新 region Store：表格钻取 */
    syncRegionStoreDrill(item) {
      const module =
        DISASTER_INDEX_MAP[this.disasterTypeIndex] ||
        DISASTER_INDEX_MAP[1];
      this.$store.dispatch("region/enterTableDrill", { item, module });
    },
    /** 同步新 region Store：退出钻取 */
    syncRegionStoreExitDrill() {
      this.$store.dispatch("region/exitDrill");
    },
    /** 同步新 region Store：切换灾种 */
    syncRegionStoreModule(type) {
      const module = DISASTER_INDEX_MAP[type] || DISASTER_INDEX_MAP[1];
      this.$store.dispatch("region/switchDisaster", module);
    },
    /**
     * 短临/实况优先使用 Store.queryCode（与面板一致）
     * Store 未就绪时回退到 positionXzqCode / regionContext
     */
    getStoreQueryCode() {
      try {
        const fromStore = this.$store.getters["region/queryCode"];
        if (fromStore !== undefined && fromStore !== null) {
          return fromStore;
        }
      } catch (e) {
        /* ignore */
      }
      return this.positionXzqCode || getQueryCode(this.regionContext) || "";
    },
    /** Store 地图定位码（钻取详情优先县码） */
    getStoreMapCode() {
      try {
        const mapRegion = this.$store.getters["region/mapRegion"];
        if (mapRegion && mapRegion.code) {
          return String(mapRegion.code).trim();
        }
      } catch (e) {
        /* ignore */
      }
      return "";
    },
    /** 经 MapFacade 叠加栅格图（失败回退 diitgis） */
    addImageLayerViaFacade(options) {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.addImageLayer === "function") {
        const ok = facade.addImageLayer(options);
        if (ok !== false) return true;
      }
      if (typeof diitgis !== "undefined" && diitgis.addImage) {
        diitgis.addImage(options);
        return true;
      }
      return false;
    },
    /**
     * 经 MapFacade 创建并挂载栅格图层（短临 cache / 极值图）
     * 失败回退 me.earth.layerManager
     */
    createImageLayerViaFacade(layerName, url, options) {
      const opts = options || {};
      const facade = tryGetMapFacade();
      if (facade && typeof facade.createImageLayer === "function") {
        const layer = facade.createImageLayer(layerName, 8, url, opts);
        if (layer) {
          facade.addHostLayer(layer);
          return layer;
        }
      }
      if (me && me.earth && me.earth.layerManager) {
        const layer = me.earth.layerManager.createLayer(layerName, 8, url, opts);
        me.earth.addLayer(layer);
        return layer;
      }
      return null;
    },
    addHostLayerViaFacade(layer) {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.addHostLayer === "function") {
        const ok = facade.addHostLayer(layer);
        if (ok !== false) return true;
      }
      if (me && me.earth && typeof me.earth.addLayer === "function") {
        try {
          me.earth.addLayer(layer);
          return true;
        } catch (e) {
          /* 可能已挂载 */
          return true;
        }
      }
      return false;
    },
    removeHostLayerViaFacade(layer) {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.removeHostLayer === "function") {
        const ok = facade.removeHostLayer(layer);
        if (ok !== false) return true;
      }
      if (me && me.earth && typeof me.earth.removeLayer === "function") {
        try {
          me.earth.removeLayer(layer);
          return true;
        } catch (e) {
          /* ignore */
        }
      }
      return false;
    },
    /** 经 MapFacade 按四至 fit */
    fitExtentViaFacade(extent, options) {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.fitExtent === "function") {
        const ok = facade.fitExtent(extent, options);
        if (ok !== false) return true;
      }
      try {
        const map =
          (me && me.earth && me.earth.map) ||
          (this.earthMap && this.earthMap.map);
        if (map && map.getView && extent && extent.length === 4) {
          const opts = options || {};
          map.getView().fit(extent, {
            size: opts.size || (map.getSize && map.getSize()),
            padding: opts.padding || [60, 60, 60, 60],
            maxZoom: opts.maxZoom,
            duration: opts.duration != null ? opts.duration : 300
          });
          return true;
        }
      } catch (e) {
        /* ignore */
      }
      return false;
    },
    /** 经 MapFacade 读当前视图投影 */
    getViewProjectionViaFacade() {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.getViewProjectionCode === "function") {
        const code = facade.getViewProjectionCode();
        if (code) return code;
      }
      try {
        const view =
          me.earth && me.earth.map && me.earth.map.getView && me.earth.map.getView();
        const code =
          view && view.getProjection && view.getProjection().getCode();
        if (code) return code;
      } catch (e) {
        /* ignore */
      }
      return "EPSG:4490";
    },
    /** 经 MapFacade 叠加业务点标记（失败回退 diitgis） */
    addMarkerViaFacade(coordinate, imgUrl, data, type) {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.addMarker === "function") {
        const ok = facade.addMarker(coordinate, imgUrl, data, type);
        if (ok !== false) return true;
      }
      if (typeof diitgis !== "undefined" && diitgis.addMarker) {
        diitgis.addMarker(coordinate, imgUrl, data || {}, type);
        return true;
      }
      return false;
    },
    /** 经 MapFacade 叠加气象台预警点（失败回退 diitgis.addqxjMarker） */
    addQxjMarkerViaFacade(coordinate, imgUrl, data, type) {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.addQxjMarker === "function") {
        const ok = facade.addQxjMarker(coordinate, imgUrl, data, type);
        if (ok !== false) return true;
      }
      if (typeof diitgis !== "undefined" && diitgis.addqxjMarker) {
        diitgis.addqxjMarker(coordinate, imgUrl, data || {}, type);
        return true;
      }
      return false;
    },
    /** 案例详情子组件 caseMain 引用 */
    getCaseMainRef() {
      const panel = this.$refs.caseCollectionPanels;
      if (panel && typeof panel.getCaseMain === "function") {
        return panel.getCaseMain();
      }
      return (panel && panel.$refs && panel.$refs.caseMain) || null;
    },
    onCaseDelete(item, type) {
      this.deleteCase(item, type);
    },
    /** 点位查询 Identify 实例 */
    getIdentifyRef() {
      const panel = this.$refs.identifyPanelShell;
      if (panel && typeof panel.getIdentify === "function") {
        return panel.getIdentify();
      }
      return (panel && panel.$refs && panel.$refs.identify) || null;
    },
    /** 基础图层 openLayerList 实例 */
    getOpenLayerListRef() {
      const panel = this.$refs.baseLayerPanelShell;
      if (panel && typeof panel.getOpenLayerList === "function") {
        return panel.getOpenLayerList();
      }
      return (panel && panel.$refs && panel.$refs.openLayerList) || null;
    },
    /** 经 MapFacade 清除业务 marker */
    clearMarkersViaFacade() {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.clearMarkers === "function") {
        const ok = facade.clearMarkers();
        if (ok !== false) return true;
      }
      const markerClass = document.getElementsByClassName("marker_class");
      Array.from(markerClass).forEach(function(marker) {
        marker.remove();
      });
      return true;
    },
    /** 经 MapFacade 清空业务图层（失败时回退 earthMap） */
    clearBusinessLayersViaFacade() {
      this.olPreviewImageLayer = null;
      const facade = tryGetMapFacade();
      if (facade) {
        facade.clearBusinessLayers();
        return true;
      }
      if (earthMap && typeof earthMap.removeAllLayer === "function") {
        earthMap.removeAllLayer();
        return true;
      }
      return false;
    },
    /** 经 MapFacade 回到全国视野 */
    goNationalViewViaFacade() {
      const facade = tryGetMapFacade();
      if (facade) {
        facade.goNationalView();
        return;
      }
      if (earthMap) {
        if (typeof earthMap.setZoom === "function") earthMap.setZoom(5);
        if (typeof earthMap.zoomToExtent === "function") {
          earthMap.zoomToExtent([110.55, 29.32]);
        }
      }
    },
    /** 进入右侧排行下钻：同步工具栏并锁定到市/省 */
    enterDrillRegion(item) {
      const snap = buildBrowseSnapshotForDrill(this.regionContext);
      if (snap) {
        this.regionContext.browseSnapshot = snap;
      }
      const built = buildEnterDrillPartial(item);
      this.applyRegionContext(built.partial, {
        silent: true,
        skipBoundary: true
      });
      this.positionXzqCode =
        getQueryCode(this.regionContext) || built.positionCode;
      this.syncRegionStoreDrill(item);
    },
    /** 退出下钻：恢复进入下钻前的浏览范围 */
    exitDrillRegion() {
      const snap = this.regionContext.browseSnapshot;
      const label = snap ? this.resolveRegionButtonLabel(snap) : "";
      this.applyRegionContext(buildExitDrillPartial(snap, label), {
        silent: true
      });
      this.positionXzqCode = getQueryCode(this.regionContext);
      if (this.$refs.buttonPostion) {
        this.$refs.buttonPostion.regionLock = null;
      }
      this.syncRegionStoreExitDrill();
      this.syncRegionStoreBrowse(
        this.positionXzqCode,
        (this.regionContext && this.regionContext.label) || "全国"
      );
    },
    /** 工具栏当前选中行政区码 */
    getButtonRegionCode() {
      const ref = this.$refs.buttonPostion;
      return normalizeButtonRegionCode(ref && ref.locationCode);
    },
    /** 浏览态：双向同步行政区（按钮 ↔ context），修复 code/name 不一致 */
    reconcileRegionFromButton() {
      const ref = this.$refs.buttonPostion;
      const plan = planReconcileFromButton({
        mode: this.regionContext.mode,
        btnCode: this.getButtonRegionCode(),
        ctxCode: getQueryCode(this.regionContext),
        posCode: this.positionXzqCode
          ? String(this.positionXzqCode).trim()
          : "",
        locationCode: ref && ref.locationCode,
        locationName: ref && ref.locationName,
        ctxLabel: this.regionContext.label,
        browseSnapshot: this.regionContext.browseSnapshot,
        resolveLabel: code => this.resolveRegionDisplayLabel(code)
      });
      if (plan.action !== "apply") {
        return;
      }
      this.applyRegionContext(plan.partial, plan.applyOptions || {});
      this.positionXzqCode = plan.positionCode;
    },
    /** 离开降雨模块前保存浏览态快照（兼容 regionContext 与 positionXzqCode 双轨） */
    saveBrowseSnapshotIfNeeded() {
      if (!shouldSaveBrowseSnapshot(this.regionContext.mode)) {
        return;
      }
      this.reconcileRegionFromButton();
      const code = this.getActiveFloodXzqdm();
      if (!code || code === "100000") {
        return;
      }
      const ref = this.$refs.buttonPostion;
      const label = resolveBrowseSnapshotLabel({
        code: code,
        ctxLabel: this.regionContext.label,
        locationCode: ref && ref.locationCode,
        locationName: ref && ref.locationName
      });
      this.regionContext.browseSnapshot = buildBrowseSnapshotContext(
        code,
        label
      );
    },
    /** 下钻态切 1/2 前：提升为浏览态，保留 browseSnapshot 供「返回」恢复 */
    promoteDrillRegionBeforeModuleSwitch() {
      const built = buildPromoteDrillToBrowse({
        mode: this.regionContext.mode,
        activeCode: this.getActiveFloodXzqdm(),
        ctxCode: this.regionContext.code,
        ctxLabel: this.regionContext.label,
        warningCode: this.regionContext.warningCode,
        resolvedLabel: this.resolveRegionButtonLabel(this.regionContext)
      });
      if (!built.ok) {
        return false;
      }
      this.applyRegionContext(built.partial, {
        silent: true,
        skipBoundary: true
      });
      this.positionXzqCode = built.positionCode;
      if (this.$refs.buttonPostion) {
        this.$refs.buttonPostion.regionLock = null;
      }
      return true;
    },
    /** 应用当前浏览态行政区（不下钻快照） */
    applyActiveBrowseRegion() {
      this.reconcileRegionFromButton();
      const code = this.getActiveFloodXzqdm();
      if (!code) {
        return false;
      }
      const label =
        this.resolveRegionDisplayLabel(code) ||
        this.regionContext.label ||
        code;
      this.applyRegionContext(
        buildActiveBrowsePartial(
          code,
          label,
          this.regionContext.browseSnapshot
        ),
        { silent: true, skipBoundary: true }
      );
      this.positionXzqCode = code;
      return true;
    },
    /** 恢复浏览态行政区，先同步按钮再异步恢复边界 */
    restoreBrowseRegionFromSnapshot() {
      const activeCode = this.getActiveFloodXzqdm();
      const snap = this.regionContext.browseSnapshot;
      const plan = planRestoreBrowseFromSnapshot({
        activeCode: activeCode,
        snap: snap
      });
      if (plan.action === "applyActive") {
        return this.applyActiveBrowseRegion();
      }
      if (plan.action !== "restoreSnap") {
        return false;
      }
      const label = this.resolveRegionButtonLabel(plan.snap);
      this.applyRegionContext(
        buildRestoreBrowsePartial(plan.snap, label),
        { silent: true, skipBoundary: true }
      );
      this.positionXzqCode = getQueryCode(this.regionContext);
      return true;
    },
    /** 模块切换时同步行政区：四模块共享浏览态 */
    syncRegionOnModuleSwitch(type) {
      if ([1, 2, 3, 4].includes(type)) {
        if (this.applyActiveBrowseRegion()) {
          return true;
        }
        return this.restoreBrowseRegionFromSnapshot();
      }
      return false;
    },
    /** 当前内涝/山洪查询用行政区代码 */
    getActiveFloodXzqdm() {
      return resolveActiveFloodXzqdm({
        btnCode: this.getButtonRegionCode(),
        fromCtx: getQueryCode(this.regionContext),
        warningCode: this.regionContext.warningCode
          ? String(this.regionContext.warningCode).trim()
          : "",
        rawCode: this.regionContext.code
          ? String(this.regionContext.code).trim()
          : "",
        posCode: this.positionXzqCode
          ? String(this.positionXzqCode).trim()
          : ""
      });
    },
    /** 内涝/山洪浏览态接口/地图查询码（县码自动上溯到市） */
    getFloodQueryXzqdm() {
      return resolveFloodQueryXzqdm({
        disasterTypeIndex: this.disasterTypeIndex,
        isJsDetailsChart: this.isJsDetailsChart,
        storeMapCode: this.getStoreMapCode(),
        storeQuery: this.getStoreQueryCode(),
        activeCode: this.getActiveFloodXzqdm(),
        promote: promoteToFloodQueryCode
      });
    },
    /** 地图定位用的行政区码：浏览用查询码，钻取用 mapRegion */
    getFloodMapXzqdm() {
      return resolveFloodMapXzqdm({
        disasterTypeIndex: this.disasterTypeIndex,
        isJsDetailsChart: this.isJsDetailsChart,
        storeMapCode: this.getStoreMapCode(),
        storeQuery: this.getStoreQueryCode(),
        floodQueryCode: this.getFloodQueryXzqdm()
      });
    },
    /** 内涝/山洪浏览态：将县选区上溯到市并写入 context */
    applyFloodBrowseRegionPromotion(code, labelHint) {
      const plan = planFloodBrowsePromotion({
        code: code,
        hint:
          labelHint ||
          this.regionContext.label ||
          this.resolveRegionDisplayLabel(code ? String(code).trim() : ""),
        browseSnapshot: this.regionContext.browseSnapshot
      });
      if (plan.action === "noop") {
        return null;
      }
      if (plan.action === "apply") {
        this.applyRegionContext(plan.partial, {
          silent: true,
          skipBoundary: true
        });
        this.positionXzqCode = plan.positionCode;
        return plan.result;
      }
      return plan.result;
    },
    /** 是否处于右侧表格钻取详情页 */
    isInTableDetailView() {
      return (
        this.isByDetailsChart ||
        this.isSkDetailsChart ||
        this.isJsDetailsChart
      );
    },
    /** 将当前行政区同步到工具栏（模块切换/刷数据时兜底） */
    syncActiveRegionToButton() {
      this.reconcileRegionFromButton();
      const code = this.getActiveFloodXzqdm();
      const ref = this.$refs.buttonPostion;
      const plan = planSyncActiveRegionToButton({
        code: code,
        displayLabel: this.resolveRegionDisplayLabel(code),
        locationCode: ref && ref.locationCode,
        locationName: ref && ref.locationName,
        ctxLabel: this.regionContext.label,
        inTableDetail: this.isInTableDetailView(),
        mode: this.regionContext.mode,
        lockMinCode: this.regionContext.lockMinCode,
        lockMinLevel: this.regionContext.lockMinLevel,
        browseSnapshot: this.regionContext.browseSnapshot
      });
      if (plan.action === "noop") {
        return;
      }
      if (plan.action === "buttonLock") {
        if (ref) {
          ref.applyRegionContext(plan.buttonPayload);
        }
        this.positionXzqCode = plan.positionCode;
        return;
      }
      this.applyRegionContext(plan.partial, plan.applyOptions || {});
      this.positionXzqCode = plan.positionCode;
    },
    /**
     * 短临/实况县钻取后切内涝/山洪：携带市县级字段供上溯到市
     */
    buildCrossModuleFloodDrill(targetType) {
      return buildCrossModuleFloodDrillPayload({
        targetType: targetType,
        isByDetailsChart: this.isByDetailsChart,
        isSkDetailsChart: this.isSkDetailsChart,
        tableDirllObj: this.tableDirllObj,
        detailsTitleXzqh: this.detailsTitleXzqh
      });
    },
    /**
     * 降雨下钻切内涝/山洪：县码上溯到市，同步浏览态行政区
     */
    adoptCrossModuleRegionIfNeeded(crossModuleFloodDrill) {
      const plan = planAdoptCrossModuleRegion({
        crossModuleFloodDrill: crossModuleFloodDrill,
        ctxLabel: this.regionContext.label,
        activeCode: this.getActiveFloodXzqdm(),
        displayLabel: this.resolveRegionDisplayLabel(
          this.getActiveFloodXzqdm()
        )
      });
      if (plan.action === "noop") {
        return;
      }
      if (plan.action === "applyDrillBrowse") {
        this.applyRegionContext(plan.partial, {
          silent: true,
          skipBoundary: true
        });
        this.positionXzqCode =
          getQueryCode(this.regionContext) || plan.positionCodeFallback;
        return;
      }
      this.applyFloodBrowseRegionPromotion(
        plan.promoteCode,
        plan.promoteHint
      );
      this.syncActiveRegionToButton();
    },
    buildPendingFloodRegion(extra = {}) {
      return buildPendingFloodRegionPayload(
        this.getFloodQueryXzqdm(),
        this.regionContext.label || "",
        extra
      );
    },
    buildFloodRankParams(base = {}) {
      return buildFloodRankParamsFromModule({
        taskTime: this.taskSelectedTime,
        xzqdm: this.getFloodQueryXzqdm(),
        base
      });
    },
    restoreActiveRegionBoundary() {
      const code = this.getFloodMapXzqdm();
      if (!code) {
        return;
      }
      this.searchXzqfw({
        xzqdm: code,
        name: this.regionContext.label || ""
      });
    },
    /** 按行政区码过滤淹没城市 png 列表 */
    filterSubmergedFilenames(list, xzqdm) {
      return filterSubmergedFilenamesFromModule(list, xzqdm);
    },
    /** 内涝/山洪全国浏览：极值图接口加载淹没城市（2D，无时间轴） */
    loadFloodSubmergedCities() {
      if (this.disasterTypeIndex !== 3 && this.disasterTypeIndex !== 4) {
        return;
      }
      if (this.isJsDetailsChart || this.isMapType) {
        return;
      }
      if (!this.taskSelectedTime) {
        this.floodMapNoSubmergedData = true;
        return;
      }
      if (this._floodSubmergedLoadTimer) {
        clearTimeout(this._floodSubmergedLoadTimer);
      }
      this._floodSubmergedLoadTimer = setTimeout(() => {
        this._floodSubmergedLoadTimer = null;
        this._doLoadFloodSubmergedCities();
      }, 80);
    },
    _doLoadFloodSubmergedCities() {
      const requestId = ++this.floodSubmergedRequestId;
      const isFuture = resolveFloodIsFutureBrowse({
        disasterTypeIndex: this.disasterTypeIndex,
        csnlValue: this.csnlValue,
        shValue: this.shValue
      });
      const params = buildSubmergedListQueryParams({
        disasterTypeIndex: this.disasterTypeIndex,
        taskTime: this.taskSelectedTime,
        isFuture: isFuture
      });
      const apiFn = isFuture ? getDljySJZJZT : getSKLSSJZJZT;

      this._clearFloodSubmergedMapLayers();
      this.floodMapNoSubmergedData = false;

      apiFn(params)
        .then(res => {
          if (requestId !== this.floodSubmergedRequestId) {
            return;
          }
          const rawList =
            res && res.code === 200 && Array.isArray(res.data) ? res.data : null;
          if (!rawList || !rawList.length) {
            this.floodMapNoSubmergedData = true;
            return;
          }
          const xzqdm = this.getFloodQueryXzqdm();
          const filtered = this.filterSubmergedFilenames(rawList, xzqdm);
          if (!filtered.length) {
            this.floodMapNoSubmergedData = true;
            return;
          }
          const dateArray = this.taskSelectedTime.split(/[- :]/);
          const obj = {
            time: this.taskSelectedTime,
            filename: filtered,
            submergedExtreme: true,
            isFuture: isFuture,
            submergedRequestId: requestId
          };
          this._loadSubmergedLayersParallel(filtered, dateArray, obj);
        })
        .catch(() => {
          if (requestId !== this.floodSubmergedRequestId) {
            return;
          }
          this.floodMapNoSubmergedData = true;
        });
    },
    loadFloodMapForActiveRegion() {
      if (this.disasterTypeIndex !== 3 && this.disasterTypeIndex !== 4) {
        return;
      }
      const xzqdm = this.getFloodQueryXzqdm();
      if (this.isJsDetailsChart) {
        if (this.disasterTypeIndex === 3) {
          if (this.isMapType) {
            this.getShTimeData(this.csnlValue, this.csnlValue, xzqdm);
          } else if (this.csnlValue == 1) {
            this.getJsSd("DL");
          } else {
            this.getSKLSSJZ(xzqdm || (this.tableDirllObj && this.tableDirllObj.xzqdm));
          }
        } else if (this.disasterTypeIndex === 4) {
          if (this.isMapType) {
            this.getShTimeData(this.shValue, this.shValue, xzqdm);
          } else if (this.shValue == 1) {
            this.getJsSd("DL");
          } else {
            this.getSKLSSJZ(xzqdm || (this.tableDirllObj && this.tableDirllObj.xzqdm));
          }
        }
        return;
      }
      if (!this.isMapType) {
        this.loadFloodSubmergedCities();
        return;
      }
      if (this.disasterTypeIndex === 3) {
        this.getShTimeData(this.csnlValue, this.csnlValue, xzqdm);
      } else {
        this.getShTimeData(this.shValue, this.shValue, xzqdm);
      }
    },
    pushFloodRankItems(targetList, rawData) {
      const items = mapRankResponseList(
        { code: 200, data: rawData },
        adaptFloodRankItem
      );
      items.forEach(function(item) {
        targetList.push(item);
      });
    },
    applyFloodRankApiResult(targetList, res) {
      const status = resolveFloodRankLoadStatus(
        res,
        !!this.getActiveFloodXzqdm()
      );
      if (status === "ok") {
        this.pushFloodRankItems(targetList, res.data);
        this.finishFloodRankLoad(targetList);
        return;
      }
      if (status === "empty") {
        this.finishFloodRankLoad([]);
      }
    },
    applyWarningCityApiResult(res, processType, processFlag) {
      const stats = resolveWarningCityStats(res);
      if (!stats) return false;
      this.nlCount = stats.count;
      this.nlChange = stats.change;
      this.nlData = stats.list;
      if (processType === "SH") {
        this.shCount = stats.count;
        this.processWarningCityData(stats.list, "SH");
      } else if (processFlag !== undefined) {
        this.processWarningCityData(stats.list, "", processFlag);
      } else {
        this.processWarningCityData(stats.list);
      }
      return true;
    },
    finishFloodRankLoad(list) {
      if (this.tryResumeCrossModuleFloodDrill()) {
        return;
      }
      const xzqdm = this.getActiveFloodXzqdm();
      if (xzqdm && (!list || !list.length)) {
        this.handleCrossModuleFloodDrillNoData(this.buildPendingFloodRegion());
        return;
      }
      this.syncActiveRegionToButton();
      this.loadFloodMapForActiveRegion();
      if (list && list.length) {
        this.initChart(list);
      }
    },
    refreshCurrentFloodModuleData() {
      const plan = planRefreshFloodModuleData({
        disasterTypeIndex: this.disasterTypeIndex,
        csnlValue: this.csnlValue,
        shValue: this.shValue
      });
      (plan.actions || []).forEach(name => {
        if (typeof this[name] === "function") {
          this[name]();
        }
      });
    },
    getPositionXzqCode(xzqdm) {
      this.clearRainfallCenterLocate();
      const ref = this.$refs.buttonPostion;
      const plan = planPositionXzqCodeChange({
        xzqdm: xzqdm,
        locationName: ref && ref.locationName,
        mode: this.regionContext.mode,
        lockMinLevel: this.regionContext.lockMinLevel,
        lockMinCode: this.regionContext.lockMinCode,
        warningCode: this.regionContext.warningCode,
        ctxLabel: this.regionContext.label,
        shouldPromoteFlood:
          (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) &&
          !this.isJsDetailsChart,
        inTableDetail: this.isInTableDetailView()
      });
      if (plan.action === "toNational") {
        this.navigateToNational({ skipButtonReset: true });
        return;
      }
      this.applyRegionContext(plan.partial, plan.applyOptions || {});
      this.positionXzqCode = plan.positionCode;
      if (plan.shouldSyncButton) {
        this.syncActiveRegionToButton();
      }
      if (plan.shouldSyncStore) {
        const browseLabel =
          (this.regionContext && this.regionContext.label) ||
          plan.storeLabel ||
          "全国";
        this.syncRegionStoreBrowse(plan.positionCode, browseLabel);
      }
      this.refreshBrowseDataAfterRegionChange();
    },
    /** 清除钻取详情页的图层与边界（不刷新列表） */
    clearTableDetailViewLayers() {
      this.drillCurrentVisibleLayerKey = null;
      if (this.tableDirllObj && this.tableDirllObj.xzqdm) {
        const keysToDelete = [];
        this.layerCache.forEach((value, key) => {
          if (key.includes(this.tableDirllObj.xzqdm)) {
            keysToDelete.push(key);
          }
        });
        keysToDelete.forEach(key => {
          const layer = this.layerCache.get(key);
          if (layer) {
            try {
              me.earth.removeLayer(layer);
            } catch (e) {
              console.warn("移除图层失败:", e);
            }
          }
          this.layerCache.delete(key);
        });
      }
      this.removeBufferLayer(ADMIN_BOUNDARY_LAYER_IDS.slice());
      if (earthMap && earthMap.layerManager) {
        earthMap.layerManager.clearHightLayer();
      }
      if (this.$refs.threeMap && this.isMapType) {
        this.$refs.threeMap.clearLine();
      }
    },
    /** 退出右侧表格钻取详情 */
    exitTableDetailView(options = {}) {
      const { skipDrillExit = false } = options;
      if (!this.isInTableDetailView()) {
        return false;
      }
      this.clearRainfallCenterLocate();
      Object.assign(this, buildExitTableDetailStatePatch());
      this.clearTableDetailViewLayers();
      const drillAction = resolveExitTableDetailDrillAction({
        skipDrillExit: skipDrillExit,
        disasterTypeIndex: this.disasterTypeIndex
      });
      if (drillAction === "exitDrill") {
        this.exitDrillRegion();
      } else if (drillAction === "storeExitOnly") {
        this.syncRegionStoreExitDrill();
      }
      return true;
    },
    /** 行政区切换后刷新当前模块浏览数据 */
    refreshBrowseDataAfterRegionChange() {
      const plan = planRefreshBrowseAfterRegionChange({
        disasterTypeIndex: this.disasterTypeIndex,
        isJsDetailsChart: this.isJsDetailsChart
      });
      (plan.actions || []).forEach(action => {
        if (action === "getJsData") {
          this.getJsData();
        } else if (action === "getSkJsData") {
          this.getSkJsData();
        } else if (action === "resetFloodCrossDrill") {
          this.floodCrossDrillNoData = false;
        } else if (action === "setPendingFloodRegion") {
          this.pendingCrossModuleFloodDrill = this.buildPendingFloodRegion();
        } else if (action === "refreshFloodModule") {
          this.refreshCurrentFloodModuleData();
        } else if (action === "fetchWarning") {
          this.fetchCurrentModuleWarningInfo();
        }
      });
    },
    /** 退出钻取详情后恢复列表/图表 */
    refreshListAfterExitDetail() {
      const plan = planRefreshListAfterExitDetail({
        restoredCode: getQueryCode(this.regionContext),
        disasterTypeIndex: this.disasterTypeIndex
      });
      (plan.actions || []).forEach(action => {
        if (action === "goNational") {
          this.goNationalViewViaFacade();
        } else if (action === "restoreBoundary") {
          this.restoreActiveRegionBoundary();
        } else if (action === "fetchRainfallWarning") {
          this.fetchRainfallWarningInfo();
        } else if (action === "getByyjcsData") {
          this.getByyjcsData();
        } else if (action === "getJsData") {
          this.getJsData();
        } else if (action === "initChartShortTerm") {
          this.initChart(this.wlsxsjyRainRankList);
        } else if (action === "showMakerSk") {
          this.showMaker(false, "skjyXz");
        } else if (action === "initChartLive") {
          this.initChart(this.skjsRainRankList);
        } else if (action === "tabDisasterType3") {
          this.tabDisasterType(3);
        } else if (action === "tabDisasterType4") {
          this.tabDisasterType(4);
        }
      });
    },
    /** 回到全国并同步地图、预警、右侧列表 */
    navigateToNational(options = {}) {
      const { skipButtonReset = false } = options;
      this.exitTableDetailView();
      if (this.regionContext.mode === REGION_MODE.DRILL) {
        this.exitDrillRegion();
      }
      this.applyRegionContext(buildNationalBrowsePartial(), {
        silent: true,
        skipButtonSync: skipButtonReset
      });
      this.positionXzqCode = "";
      if (!skipButtonReset && this.$refs.buttonPostion) {
        this.$refs.buttonPostion.resetToNational({ silent: true });
      }
      this.$store.dispatch("region/resetRegion");
      this.clearAdminRegionMapDisplay();
      this.refreshBrowseDataAfterRegionChange();
    },
    /** 行政区划面板「返回」统一入口 */
    handleRegionNavigateBack(payload = {}) {
      const plan = planRegionNavigateBack(payload.step);
      if (plan.action === "countyToCity") {
        this.getPositionXzqCode(payload.code);
        return;
      }
      if (plan.action === "exitLock") {
        this.exitTableDetailView();
        if (this.regionContext.mode === REGION_MODE.DRILL) {
          this.exitDrillRegion();
        }
        const restoredCode = getQueryCode(this.regionContext);
        this.positionXzqCode = restoredCode;
        this.syncActiveRegionToButton();
        this.$nextTick(() => {
          if (restoredCode) {
            this.restoreActiveRegionBoundary();
          } else {
            this.clearAdminRegionMapDisplay();
          }
          this.refreshBrowseDataAfterRegionChange();
          if (this.disasterTypeIndex === 1) {
            this.getByyjcsData();
            this.initChart(this.wlsxsjyRainRankList);
          } else if (this.disasterTypeIndex === 2) {
            this.initChart(this.skjsRainRankList);
          }
        });
        return;
      }
      if (this.$refs.buttonPostion) {
        this.$refs.buttonPostion.resetToNational({ silent: true });
      }
      this.navigateToNational({ skipButtonReset: true });
    },
    /** 按当前模块刷新左上角预警信息 */
    fetchCurrentModuleWarningInfo() {
      if (this.disasterTypeIndex === 1 || this.disasterTypeIndex === 2) {
        this.fetchRainfallWarningInfo();
      } else if (this.disasterTypeIndex === 3) {
        this.fetchCsnlWarningInfo();
      } else if (this.disasterTypeIndex === 4) {
        this.fetchShWarningInfo();
      }
    },
    getWarningRegionLabel() {
      const isDrill =
        this.isByDetailsChart ||
        this.isSkDetailsChart ||
        this.isJsDetailsChart;
      let storeDisplay = null;
      if (!isDrill) {
        try {
          storeDisplay = this.$store.getters["region/displayRegion"];
        } catch (e) {
          /* ignore */
        }
      }
      const ctx = this.regionContext;
      const warningCode = getWarningCodeFromContext(ctx);
      const ref = this.$refs.buttonPostion;
      return resolveWarningRegionLabel({
        isDrill: isDrill,
        storeDisplay: storeDisplay,
        regionContext: ctx,
        warningCode: warningCode,
        positionXzqCode: this.positionXzqCode,
        tableDirllObj: this.tableDirllObj,
        isByDetailsChart: this.isByDetailsChart,
        isSkDetailsChart: this.isSkDetailsChart,
        isJsDetailsChart: this.isJsDetailsChart,
        drillMode: REGION_MODE.DRILL,
        ctxHasQueryCode: !!getQueryCode(ctx),
        parts: this.getWarningRegionParts(),
        buttonLocationName: ref && ref.locationName
      });
    },
    getWarningRegionParts() {
      const ref = this.$refs.buttonPostion;
      const ctx = this.regionContext;
      const ctxLabel =
        ctx && ctx.label && ctx.label !== "全国" ? ctx.label : "";
      return resolveWarningRegionParts({
        selected: ref && ref.selected,
        locationCode: ref && ref.locationCode,
        locationName: ref && ref.locationName,
        ctxCode: getQueryCode(ctx),
        ctxLabel: ctxLabel
      });
    },
    enrichWarningPointAddress(warningInfo) {
      const that = this;
      pickWarningSectionsNeedingAddress(warningInfo).forEach(function(sec) {
        const lon = sec.centerPoint.lon;
        const lat = sec.centerPoint.lat;
        that
          .fetchTiandituAddress(lon, lat)
          .then(function(address) {
            that.$set(sec, "address", address || "");
            that.$set(sec, "addressLoading", false);
          })
          .catch(function() {
            that.$set(sec, "address", "");
            that.$set(sec, "addressLoading", false);
          });
      });
    },
    fetchTiandituAddress(lon, lat) {
      return fetch(buildTiandituGeocodeUrl(lon, lat))
        .then(res => res.json())
        .then(res => parseTiandituAddress(res, formatAddressFromTianditu));
    },
    fetchTiandituGeocodeResult(lon, lat) {
      return fetch(buildTiandituGeocodeUrl(lon, lat))
        .then(res => res.json())
        .then(res => parseTiandituGeocodeResult(res))
        .catch(function() {
          return null;
        });
    },
    addLocateMarker(lon, lat) {
      const markerClass = document.getElementsByClassName("markerToobar_class");
      Array.from(markerClass).forEach(function(marker) {
        marker.remove();
      });
      const imgUrl = require("@/assets/images/rapidAnalysis/locat.png");
      const facade = tryGetMapFacade();
      if (facade && typeof facade.addToolbarMarker === "function") {
        facade.addToolbarMarker([lon, lat], imgUrl, {});
        return;
      }
      if (typeof diitgis !== "undefined" && diitgis.addToobarrMarker) {
        diitgis.addToobarrMarker([lon, lat], imgUrl, {});
      }
    },
    centerMapOnPoint(lon, lat, zoom) {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.centerOnPoint === "function") {
        facade.centerOnPoint(lon, lat, zoom);
        return;
      }
      const map =
        this.earthMap ||
        (typeof earthMap !== "undefined" ? earthMap : null);
      if (!map) return;
      const targetZoom = zoom != null ? zoom : 14;
      if (map.map && map.map.getView) {
        const view = map.map.getView();
        view.setCenter([lon, lat]);
        view.setZoom(targetZoom);
        return;
      }
      if (typeof map.setZoom === "function") {
        map.setZoom(targetZoom);
      }
      if (typeof map.zoomToExtent === "function") {
        map.zoomToExtent([lon, lat]);
      }
    },
    closeIdentify() {
      this.popupShow = false;
      if (this.identifyOverlay) {
        this.identifyOverlay.set("autoPan", true);
      }
    },
    clearRainfallCenterLocate() {
      this.locateRequestId++;
      this.closeIdentify();
      const markerClass = document.getElementsByClassName("markerToobar_class");
      Array.from(markerClass).forEach(function(marker) {
        marker.remove();
      });
      if (this.identifyOverlay) {
        this.identifyOverlay.setPosition(undefined);
      }
    },
    showLocatePointPopup(lon, lat, section) {
      const that = this;
      const requestId = ++this.locateRequestId;
      const gridRainfall =
        (section && (section.jyl || section.gridRainfall)) ||
        extractCenterGridRainfall(this.getCurrentWarningRawData()) ||
        "";
      const applyPopup = function(extraFields) {
        if (requestId !== that.locateRequestId) return;
        that.identifyModel = Object.assign(
          {
            address: (section && section.address) || "",
            province: "",
            city: "",
            county: "",
            town: "",
            poi: "",
            jyl: gridRainfall
          },
          extraFields || {}
        );
        delete that.identifyModel.type;
        that.identifyModellon = lon;
        that.identifyModellat = lat;
        that.popupShow = true;
        that.$nextTick(function() {
          if (that.identifyOverlay && requestId === that.locateRequestId) {
            that.identifyOverlay.set("autoPan", true);
            that.identifyOverlay.setPosition([lon, lat]);
          }
        });
      };

      this.fetchTiandituGeocodeResult(lon, lat).then(function(result) {
        if (requestId !== that.locateRequestId) return;
        if (result && result.addressComponent) {
          const ac = result.addressComponent;
          applyPopup(
            Object.assign({}, ac, {
              county: ac.county || ac.district || "",
              poi: ac.poi || ac.address || "",
              address:
                (section && section.address) ||
                formatAddressFromTianditu(ac) ||
                result.formatted_address ||
                "",
              jyl: gridRainfall
            })
          );
        } else {
          applyPopup({
            address: (section && section.address) || "",
            jyl: gridRainfall
          });
        }
      });
    },
    getCurrentWarningRawData() {
      if (this.disasterTypeIndex === 1 || this.disasterTypeIndex === 2) {
        return this.rainfallWarningRawData;
      }
      if (this.disasterTypeIndex === 3) {
        return this.csnlWarningRawData;
      }
      if (this.disasterTypeIndex === 4) {
        return this.shWarningRawData;
      }
      return null;
    },
    locateRainfallCenter(section) {
      if (!section || !section.centerPoint) return;
      const coord = parseCenterPoint(section.centerPoint);
      if (!coord) return;
      const lon = coord.lon;
      const lat = coord.lat;
      const markerClass = document.getElementsByClassName("markerToobar_class");
      Array.from(markerClass).forEach(function(marker) {
        marker.remove();
      });
      this.addLocateMarker(lon, lat);
      this.centerMapOnPoint(lon, lat, 14);
      const enrichedSection = Object.assign({}, section);
      if (!enrichedSection.jyl && !enrichedSection.gridRainfall) {
        const gridRainfall = extractCenterGridRainfall(
          this.getCurrentWarningRawData()
        );
        if (gridRainfall) {
          enrichedSection.jyl = gridRainfall;
        }
      }
      this.showLocatePointPopup(lon, lat, enrichedSection);
    },
    getWarningQueryParams() {
      const storeWarning = this.$store.getters["region/warningCode"];
      const warningCode =
        storeWarning || getWarningCodeFromContext(this.regionContext);
      return buildWarningQueryBundle({
        warningCode: warningCode || this.positionXzqCode,
        positionXzqCode: warningCode || this.positionXzqCode,
        tableDirllObj: this.tableDirllObj,
        isByDetailsChart: this.isByDetailsChart,
        isSkDetailsChart: this.isSkDetailsChart,
        isJsDetailsChart: this.isJsDetailsChart,
        disasterTypeIndex: this.disasterTypeIndex,
        storeQuery: this.getStoreQueryCode(),
        storeWarning: storeWarning,
        regionLabel: this.getWarningRegionLabel(),
        taskTime: this.taskSelectedTime
      });
    },
    beginWarningInfoRequest() {
      const requestId = ++this.warningInfoRequestId;
      this.warningInfoLoading = true;
      return requestId;
    },
    isWarningInfoRequestStale(requestId) {
      return isWarningRequestStale(requestId, this.warningInfoRequestId);
    },
    finishWarningInfoRequest(requestId) {
      if (!this.isWarningInfoRequestStale(requestId)) {
        this.warningInfoLoading = false;
      }
    },
    fetchRainfallWarningInfo() {
      if (!shouldFetchRainfallWarning(this.disasterTypeIndex)) {
        return;
      }
      const requestId = this.beginWarningInfoRequest();
      const { code, regionLabel, params } = this.getWarningQueryParams();
      const emptyOpts = { regionLabel, taskTime: this.taskSelectedTime };
      this.rainfallWarningInfo = getEmptyRainfallWarningInfo(
        regionLabel,
        code,
        emptyOpts
      );
      if (!this.taskSelectedTime) {
        this.finishWarningInfoRequest(requestId);
        return;
      }
      const buildOpts = buildWarningDisplayOpts(
        regionLabel,
        this.taskSelectedTime,
        this.getWarningRegionParts()
      );
      queryRainfallRange(params)
        .then(res => {
          if (this.isWarningInfoRequestStale(requestId)) {
            return;
          }
          const payload = resolveWarningApiPayload(res, {
            code: code,
            regionLabel: regionLabel,
            buildOpts: buildOpts,
            emptyOpts: emptyOpts,
            buildInfo: buildRainfallWarningInfo,
            getEmpty: getEmptyRainfallWarningInfo
          });
          this.rainfallWarningRawData = payload.rawData;
          this.rainfallWarningInfo = payload.info;
          if (payload.ok) {
            this.enrichWarningPointAddress(this.rainfallWarningInfo);
          }
        })
        .catch(() => {
          if (this.isWarningInfoRequestStale(requestId)) {
            return;
          }
          this.rainfallWarningRawData = null;
          this.rainfallWarningInfo = getEmptyRainfallWarningInfo(
            regionLabel,
            code,
            emptyOpts
          );
        })
        .finally(() => {
          this.finishWarningInfoRequest(requestId);
        });
    },
    fetchCsnlWarningInfo() {
      if (!shouldFetchCsnlWarning(this.disasterTypeIndex)) {
        return;
      }
      const requestId = this.beginWarningInfoRequest();
      const { code, regionLabel, params } = this.getWarningQueryParams();
      const emptyOpts = { regionLabel, taskTime: this.taskSelectedTime };
      const buildOpts = buildWarningDisplayOpts(
        regionLabel,
        this.taskSelectedTime,
        this.getWarningRegionParts()
      );
      this.csnlWarningInfo = getEmptyCsnlWarningInfo(regionLabel, code, emptyOpts);
      if (!this.taskSelectedTime) {
        this.finishWarningInfoRequest(requestId);
        return;
      }
      queryFloodRangeCsnl(params)
        .then(res => {
          if (this.isWarningInfoRequestStale(requestId)) {
            return;
          }
          const payload = resolveWarningApiPayload(res, {
            code: code,
            regionLabel: regionLabel,
            buildOpts: buildOpts,
            emptyOpts: emptyOpts,
            buildInfo: buildCsnlWarningInfo,
            getEmpty: getEmptyCsnlWarningInfo
          });
          this.csnlWarningRawData = payload.rawData;
          this.csnlWarningInfo = payload.info;
          if (payload.ok) {
            this.enrichWarningPointAddress(this.csnlWarningInfo);
          }
        })
        .catch(() => {
          if (this.isWarningInfoRequestStale(requestId)) {
            return;
          }
          this.csnlWarningRawData = null;
          this.csnlWarningInfo = getEmptyCsnlWarningInfo(
            regionLabel,
            code,
            emptyOpts
          );
        })
        .finally(() => {
          this.finishWarningInfoRequest(requestId);
        });
    },
    fetchShWarningInfo() {
      if (!shouldFetchShWarning(this.disasterTypeIndex)) {
        return;
      }
      const requestId = this.beginWarningInfoRequest();
      const { code, regionLabel, params } = this.getWarningQueryParams();
      const emptyOpts = { regionLabel, taskTime: this.taskSelectedTime };
      const buildOpts = buildWarningDisplayOpts(
        regionLabel,
        this.taskSelectedTime,
        this.getWarningRegionParts()
      );
      this.shWarningInfo = getEmptyShWarningInfo(regionLabel, code, buildOpts);
      if (!this.taskSelectedTime) {
        this.finishWarningInfoRequest(requestId);
        return;
      }
      queryFloodRangeSh(params)
        .then(res => {
          if (this.isWarningInfoRequestStale(requestId)) {
            return;
          }
          const payload = resolveWarningApiPayload(res, {
            code: code,
            regionLabel: regionLabel,
            buildOpts: buildOpts,
            emptyOpts: buildOpts,
            buildInfo: buildShWarningInfo,
            getEmpty: getEmptyShWarningInfo
          });
          this.shWarningRawData = payload.rawData;
          this.shWarningInfo = payload.info;
          if (payload.ok) {
            this.enrichWarningPointAddress(this.shWarningInfo);
          }
        })
        .catch(() => {
          if (this.isWarningInfoRequestStale(requestId)) {
            return;
          }
          this.shWarningRawData = null;
          this.shWarningInfo = getEmptyShWarningInfo(
            regionLabel,
            code,
            buildOpts
          );
        })
        .finally(() => {
          this.finishWarningInfoRequest(requestId);
        });
    },
    // 初始化加载地图
    earthLoaded(map) {
      let that = this;
      earthMap = map;
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
    normalizeUpladeLineFeatures(res) {
      return normalizeAdminBoundaryFeatures(res);
    },
    clearAdminRegionMapDisplay() {
      this.clearRainfallCenterLocate();
      this.clearAdminRegionBoundaries();
      this.goNationalViewViaFacade();
    },
    /** 仅清除行政区边界图层（不改变视野） */
    clearAdminRegionBoundaries() {
      this.removeBufferLayer(ADMIN_BOUNDARY_LAYER_IDS.slice());
      const facade = tryGetMapFacade();
      if (facade) {
        facade.clearHighlight();
      } else if (earthMap && earthMap.layerManager) {
        earthMap.layerManager.clearHightLayer();
      }
    },
    upladeLine(res) {
      if (!res) {
        this.clearAdminRegionMapDisplay();
        return;
      }
      if (this.isMapType || !earthMap || !this.earthMap || !this.earthMap.map) {
        return;
      }
      const features = this.normalizeUpladeLineFeatures(res);
      if (!features.length) {
        return;
      }
      const style = getDefaultAdminOutlineStyle();
      // 重构：优先经 MapFacade 叠加橙色行政区轮廓
      const facade = tryGetMapFacade();
      if (facade && typeof facade.addAdminOutline === "function") {
        const ok = facade.addAdminOutline(features, {
          style,
          layerId: "xzq",
          dataProjection: "EPSG:4490",
          featureProjection: "EPSG:4490"
        });
        if (ok) {
          return;
        }
      }
      const vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
          features: new ol.format.GeoJSON().readFeatures(
            {
              type: "FeatureCollection",
              features: features
            },
            {
              dataProjection: "EPSG:4490",
              featureProjection: "EPSG:4490"
            }
          )
        }),
        zIndex: 20,
        id: "xzq",
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: style.lineColor,
            width: style.lineWidth
          }),
          fill: new ol.style.Fill({
            color: style.fillColor
          })
        })
      });
      this.removeBufferLayer(["xzq"]);
      this.earthMap.map.addLayer(vectorLayer);
      const extent = vectorLayer.getSource().getExtent();
      this.fitExtentViaFacade(extent, {
        padding: [50, 50, 50, 50],
        duration: 1000
      });
    },
    removeBufferLayer(idArray = []) {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.removeMapLayersByIds === "function") {
        const ok = facade.removeMapLayersByIds(idArray);
        if (ok !== false) return;
      }
      const vm = this;
      if (!vm.earthMap || !vm.earthMap.map) {
        return;
      }
      idArray.forEach(itemId => {
        let allLayers = vm.earthMap.map.getLayers().getArray();
        let geoJsonBorderLayers = allLayers.filter(
          l => l.get("id") === itemId || l.getProperties().id === itemId
        );
        geoJsonBorderLayers.forEach(lyr => {
          vm.earthMap.map.removeLayer(lyr);
        });
      });
    },
    _resolveXzqLevelLabel(code) {
      return resolveXzqLevelLabel(code);
    },
    _applySearchXzqfwBoundary(data, options = {}) {
      if (!data) {
        return false;
      }
      const style = Object.assign(
        getDefaultHighlightBoundaryStyle(),
        options.style || {}
      );
      if (this.isMapType) {
        if (
          (this.disasterTypeIndex == 3 || this.disasterTypeIndex == 4) &&
          this.$refs.threeMap
        ) {
          this.$refs.threeMap.addPolyline(data);
          return true;
        }
        return false;
      }
      // 重构：优先经 MapFacade 高亮边界
      const facade = tryGetMapFacade();
      if (facade && typeof facade.highlightBoundary === "function") {
        const ok = facade.highlightBoundary(data, {
          style,
          zoom: options.zoom !== false
        });
        if (ok) {
          return true;
        }
      }
      if (!earthMap) {
        return false;
      }
      let geometry = null;
      if (data.feature) {
        try {
          geometry = JSON.parse(data.feature);
        } catch (e) {
          geometry = null;
        }
      } else if (data.type === "Feature") {
        earthMap.zoomToFeatures([data], {
          setLayer: "hightLayer",
          style,
          zoom: options.zoom !== false
        });
        return true;
      } else if (data.type === "FeatureCollection" && data.features) {
        earthMap.zoomToFeatures(data.features, {
          setLayer: "hightLayer",
          style,
          zoom: options.zoom !== false
        });
        return true;
      } else if (data.type && data.coordinates) {
        geometry = data;
      }
      if (!geometry) {
        return false;
      }
      earthMap.zoomToFeatures(
        [
          {
            type: "Feature",
            properties: {},
            geometry
          }
        ],
        {
          setLayer: "hightLayer",
          style,
          zoom: options.zoom !== false
        }
      );
      return true;
    },
    _loadRegionBoundaryFallback(xzqdm, options = {}) {
      const code = xzqdm ? String(xzqdm).trim() : "";
      if (!code) {
        return Promise.resolve(false);
      }
      const xzqlevel = this._resolveXzqLevelLabel(code);
      if (!xzqlevel) {
        return Promise.resolve(false);
      }
      return getFwByXzqCode({ xzqdm: code, xzqlevel })
        .then(res => {
          if (
            res &&
            res.code === 200 &&
            res.data &&
            this._applySearchXzqfwBoundary(res.data, options)
          ) {
            return true;
          }
          return this._loadRegionBoundaryFromStatic(code, options);
        })
        .catch(() => this._loadRegionBoundaryFromStatic(code, options));
    },
    _loadRegionBoundaryFromStatic(code, options = {}) {
      const localUrl = `${window.servicesConfig.WebServer}static/adArea/${code}.json`;
      return new Promise(resolve => {
        $.get(localUrl)
          .done(res => {
            if (res && this._applySearchXzqfwBoundary(res, options)) {
              resolve(true);
              return;
            }
            resolve(false);
          })
          .fail(() => {
            const remoteUrl = `${window.servicesConfig.WebServer}static/adArea/${code}.json`;
            $.get(remoteUrl)
              .done(res => {
                resolve(
                  !!(res && this._applySearchXzqfwBoundary(res, options))
                );
              })
              .fail(() => resolve(false));
          });
      });
    },
    // 行政区定位
    searchXzqfw(item) {
      const xzqdm = getRainfallDrillCode(item) || item.xzqdm;
      if (!xzqdm) {
        return;
      }
      searchXzqfw({
        xzqdm
      })
        .then(res => {
          if (
            res &&
            res.code === 200 &&
            res.data &&
            this._applySearchXzqfwBoundary(res.data)
          ) {
            return;
          }
          return this._loadRegionBoundaryFallback(xzqdm);
        })
        .catch(() => this._loadRegionBoundaryFallback(xzqdm));
    },
    // 山洪区
    searchSHfw(code) {
      getjcqAndShLk({ xzqdm: code, xzqType: 2 }).then(res => {
        if (
          res &&
          res.code === 200 &&
          res.data &&
          res.data.feature &&
          earthMap
        ) {
          earthMap.zoomToFeatures(
            [
              {
                type: "Feature",
                properties: {},
                geometry: JSON.parse(res.data.feature)
              }
            ],
            {
              setLayer: "hightLayer",
              style: {
                lineColor: "#FF0000",
                lineWidth: 2,
                fillColor: "rgba(255,255,255,0.3)"
              },
              zoom: true
            }
          );
        }
      });
    },
    // 建成区
    searchJCQfw(code) {
      getjcqAndShLk({ xzqdm: code, xzqType: 1 }).then(res => {
        if (
          res &&
          res.code === 200 &&
          res.data &&
          res.data.feature &&
          earthMap
        ) {
          earthMap.zoomToFeatures(
            [
              {
                type: "Feature",
                properties: {},
                geometry: JSON.parse(res.data.feature)
              }
            ],
            {
              setLayer: "hightLayer",
              style: {
                lineColor: "#FF0000",
                lineWidth: 2,
                fillColor: "rgba(255,255,255,0.3)"
              },
              zoom: true
            }
          );
        }
      });
    },
    /** 模块切换 removeAllLayer 后，缓存图层引用失效，需清空 */
    clearRainfallLayerCache() {
      this.layerCache.clear();
      this.currentVisibleLayerKey = null;
      this.updateDateTimeCurrentVisibleLayerKey = null;
      this.drillCurrentVisibleLayerKey = null;
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

      if (this.disasterTypeIndex === 1) {
        // 短临预报
        this.cacheLayers([obj]);
      } else if (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) {
        // 城市内涝或山洪：统一处理逻辑
        if (this.isMapType) {
          // 3D地图
          this.$refs.threeMap.addModelResult(obj.filename);
        } else {
          // 2D地图 - 钻取模式下使用预加载的图层
          if (this.isJsDetailsChart && obj.filename && obj.filename.length > 0) {
            const layerKey = buildDrillRainfallLayerKey(
              obj,
              (this.tableDirllObj && this.tableDirllObj.xzqdm) || ""
            );
            const targetLayer = this.layerCache.get(layerKey);

            if (targetLayer) {
              // 使用预加载的图层
              const olLayer = targetLayer.getLayer();

              // 先清除所有图层
              this.clearBusinessLayersViaFacade();

              // 隐藏旧图层（如果存在）
              if (this.drillCurrentVisibleLayerKey && this.drillCurrentVisibleLayerKey !== layerKey) {
                const oldLayer = this.layerCache.get(this.drillCurrentVisibleLayerKey);
                if (oldLayer) {
                  const oldOlLayer = oldLayer.getLayer();
                  oldOlLayer.setVisible(false);
                }
              }

              // 重新添加当前图层到地图
              this.addHostLayerViaFacade(targetLayer);

              // 显示当前图层
              olLayer.setVisible(true);
              olLayer.setOpacity(0.5);
              this.drillCurrentVisibleLayerKey = layerKey;
            } else {
              // 如果没有预加载的图层，使用原来的方式
              this.clearBusinessLayersViaFacade();
              this.getDljySJZZB(0, obj.filename[0], dateArray, obj, []);
            }
          } else {
            // 非钻取模式，使用原来的方式
            this.clearBusinessLayersViaFacade();
            this.getDljySJZZB(0, obj.filename[0], dateArray, obj, []);
          }
        }
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
      this.duanlinTimeChange(this.dltimeTabActive || 3);
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
    },
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
        apiMethod: cfg.isPast ? getSKLSSJZZB : getDljySJZZB
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
      return config.apiMethod(zbParams)
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
    _handleLayerResponse(res, index, filename, dateArray, obj, layerArray, isPast) {
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

      config.apiMethod(zbParams).then(res => {
        this._handleLayerResponse(res, index, filename, dateArray, obj, layerArray, config.isPast);
      }).catch(err => {
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
    },
    handleDateChange(date) {
      this.liveDate[0] = moment(date[0]._d).format("YYYY-MM-DD HH:mm:ss");
      this.liveDate[1] = moment(date[1]._d).format("YYYY-MM-DD HH:mm:ss");
    },
    onLiveRainTypeChange(data) {
      this.clearBusinessLayersViaFacade();
      this.removeMapAllMaker(); // 清除所有marker
      this.liveRainType = data.target.value;
      this.getSkJsData();
    },
    csnlTabCheck(data) {
      this.csnlValue = data.target.value;
      this.nlChange = 0;
      this.nlCount = 0;
      this.nlData = [];
      this.tabDisasterType(3);
      if (this.isMapType) {
        this.$refs.threeMap.clearEffect();
      }
      this.nlthreeCreated = 1;
      if (data.target.value == 1) {
        this.gqsxstl = true;
        this.timeTabActive = 2;

        if (this.nlColumns.length == 4) {
          this.nlColumns.push({
            title: "预警等级",
            key: "yjlevel",
            scopedSlots: { customRender: "yjlevel" },
            align: "center"
          });
          this.nlColumns.push({
            title: "",
            key: "star",
            dataIndex: "star",
            align: "center",
            scopedSlots: { customRender: "star" },
            width: 50
          });
        }

        this.rankingListTitle = "城市内涝最大积水深度排行（未来三小时）";
        this.statisticsChartTitle = "城市内涝最大积水深度统计（未来三小时）";
        // this.tabDisasterType(3);
      } else {
        this.timeTabActive = 1;
        // 过去3小时
        if (this.nlColumns.length == 5) {
          this.nlColumns.pop();
          this.nlColumns.push({
            title: "",
            key: "star",
            dataIndex: "star",
            align: "center",
            scopedSlots: { customRender: "star" },
            width: 50
          });
        }
        this.disasterTypeIndex = 3;
        this.rankingListTitle = "城市内涝最大积水深度排行（过去三小时）";
        this.statisticsChartTitle = "城市内涝最大积水深度统计（过去三小时）";
        this.isTaskListBtn = true;
        this.getTaskList(4);
        this.gqsxstl = false;
      }
    },
    shTabCheck(data) {
      this.shValue = data.target.value;
      this.nlChange = 0;
      this.nlCount = 0;
      this.nlData = [];
      this.tabDisasterType(4);
      this.timeTabActive = Number(data.target.value);

      if (this.nlColumns.length == 5) {
        this.nlColumns.pop();
        this.nlColumns.push({
          title: "",
          key: "star",
          dataIndex: "star",
          align: "center",
          scopedSlots: { customRender: "star" },
          width: 50
        });
      }
      if (data.target.value == 1) {
        this.gqsxstl = true;
        this.timeTabActive = 2;
        if (this.nlColumns.length == 4) {
          this.nlColumns.push({
            title: "预警等级",
            key: "yjlevel",
            scopedSlots: { customRender: "yjlevel" },
            align: "center"
          });
          this.nlColumns.push({
            title: "",
            key: "star",
            dataIndex: "star",
            align: "center",
            scopedSlots: { customRender: "star" },
            width: 50
          });
        }
        this.rankingListTitle = "山洪最大积水深度排行（未来三小时）";
        this.statisticsChartTitle = "山洪最大积水深度统计（未来三小时）";
      } else {
        this.gqsxstl = false;
        this.timeTabActive = 1;
        if (this.nlColumns.length == 5) {
          this.nlColumns.pop();
          this.nlColumns.push({
            title: "",
            key: "star",
            dataIndex: "star",
            align: "center",
            scopedSlots: { customRender: "star" },
            width: 50
          });
        }
        this.rankingListTitle = "山洪最大积水深度排行（过去三小时）";
        this.statisticsChartTitle = "山洪最大积水深度统计（过去三小时）";
      }
    },
    changeBaseMap(shows) {
      this.basemapShows = shows;
    },
    // 初始化加载时间轴
    initTimeLine() {
      setTimeout(() => {
        if (this.$refs.timeAxis) {
          this.$refs.timeAxis.initTimeLine();
        }
      }, 500);
    },
    // 展示统计
    showStatistics() {
      if (this.currentStep == 1) {
        this.isShowBar = true;
      }
      if (this.currentStep == 3) {
        this.tableShow = true;
      }
      // this.showLeftTool = false;
    },
    removeLayersExceptResourceMenu() {
      const layers = me.earth.layerManager.getOperationLayers();
      const len = layers.length;
      for (let i = len - 1; i >= 0; i--) {
        if (!this.resourceMenuLayerIds.includes(layers[i].id)) {
          me.earth.removeLayer(layers[i]);
        }
      }
    },
    //任务列表
    openTaskList() {
      this.showTaskList = !this.showTaskList;
      this.$refs.buttonPostion.isModel = false;
      this.isOpenLayerList = false;
      this.IdentifyShow = false;
    },
    getTaskList(type, options = {}) {
      const { skipRegionRestore = false } = options;
      if (this.myChart) {
        this.disposeSumChart();
      }
      Object.assign(this, buildTaskListUiResetFlags());
      this.removeMapAllMaker();
      getTaskList({
        taskType: type
      }).then(res => {
        if (res.code !== 200) {
          return;
        }
        if (res.data.length == 0) {
          const emptyPlan = planEmptyTaskListResult({
            pendingDrill: this.pendingCrossModuleFloodDrill,
            disasterTypeIndex: this.disasterTypeIndex
          });
          if (emptyPlan.clearTimeline) {
            this.timeData = [];
            this.initTimeLine();
          }
          if (emptyPlan.clearFloodRanks) {
            this.sHjssdRainRankList = [];
            this.jssdRainRankList = [];
          }
          const pendingDrill = emptyPlan.pendingDrill;
          if (emptyPlan.clearPending) {
            this.pendingCrossModuleFloodDrill = null;
          }
          if (emptyPlan.handleCrossModuleNoData) {
            this.handleCrossModuleFloodDrillNoData(pendingDrill);
          }
          return;
        }
        this.taskList = res.data;
        this.taskStatus = res.data[0].lostdata || "";
        const timeState = resolveTaskSelectedTime({
          savedIsNowTime: sessionStorage.getItem("rapidAnalysis_isNowTime"),
          savedTaskTime: sessionStorage.getItem(
            "rapidAnalysis_taskSelectedTime"
          ),
          latestTaskTime: res.data[0].tasktime || ""
        });
        this.taskSelectedTime = timeState.taskSelectedTime;
        this.isNowTime = timeState.isNowTime;
        this.historyTaskTime = timeState.historyTaskTime;
        this.getNowTime();
        this.applyPostTaskLoadPlan(
          buildPostTaskLoadExecution({
            disasterTypeIndex: this.disasterTypeIndex,
            skipRegionRestore: skipRegionRestore,
            tjuTabChke: this.tjuTabChke,
            csnlValue: this.csnlValue,
            shValue: this.shValue
          })
        );
      });
    },
    /** 执行任务列表加载后的后续动作 */
    applyPostTaskLoadPlan(execution) {
      if (!execution || !Array.isArray(execution.actions)) {
        return;
      }
      execution.actions.forEach(action => {
        if (action === "syncRegion") {
          this.syncActiveRegionToButton();
        } else if (action === "fetchRainfallWarning") {
          this.fetchRainfallWarningInfo();
        } else if (action === "fetchCsnlWarning") {
          this.fetchCsnlWarningInfo();
        } else if (action === "fetchShWarning") {
          this.fetchShWarningInfo();
        } else if (action === "getByyjcsData") {
          this.getByyjcsData();
        } else if (action === "getJsData") {
          this.getJsData();
        } else if (action === "getSixData") {
          this.getSixData();
        } else if (action === "reloadShortTermRainfallLayers") {
          this.reloadShortTermRainfallLayers();
        } else if (action === "getNlyjcsData") {
          this.getNlyjcsData();
        } else if (action === "getJssdData") {
          this.getJssdData();
        } else if (action === "getNlyjcsGqThreeData") {
          this.getNlyjcsGqThreeData();
        } else if (action === "getJsGqthreeData") {
          this.getJsGqthreeData();
        } else if (action === "getshyjcsData") {
          this.getshyjcsData();
        } else if (action === "getshJssdData") {
          this.getshJssdData();
        } else if (action === "getshYjGqData") {
          this.getshYjGqData();
        } else if (action === "getShGqthreeData") {
          this.getShGqthreeData();
        } else if (action === "restoreBoundary") {
          if (this.getActiveFloodXzqdm()) {
            this.$nextTick(() => {
              this.restoreActiveRegionBoundary();
            });
          }
        }
      });
    },
    // 积水深度过去三小时时间轴（仅钻取详情或 3D 使用）
    getSKLSSJZ(id) {
      if (
        (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) &&
        !this.isJsDetailsChart &&
        !this.isMapType
      ) {
        return;
      }
      getSKLSSJZ({
        taskTime: this.taskSelectedTime,
        xzqdm: id || "",
        modelType:
          this.disasterTypeIndex == 3
            ? "1"
            : this.disasterTypeIndex == 4
              ? "2"
              : ""
        // type:'SK'
      }).then(res => {
        if (res.code === 200) {
          // 钻取模式下进行预加载
          if (this.isJsDetailsChart && res.data && res.data.length > 0) {
            console.log('🔵 开始预加载钻取图层（历史），时间轴数据长度:', res.data.length);
            this.cacheDrillLayers(res.data);
          }
          this.timeData = [];
          this.timeData = res.data;
          this.initTimeLine(); // 初始化时间轴
        } else {
          this.timeData = [];
          this.initTimeLine(); // 初始化时间轴
        }
      });
    },
    // 内涝
    openNlWarningTableList() {
      this.nlVisible = true;
    },
    openSHWarningTableList() {
      this.shVisible = true;
    },
    // 暴雨
    openByWarningTableList() {
      this.byVisible = true;
    },
    //切换数据
    tabDisasterType(type) {
      this.syncRegionStoreModule(type);
      const crossModuleFloodDrill = this.buildCrossModuleFloodDrill(type);
      this.floodCrossDrillNoData = false;
      const layerList = this.getOpenLayerListRef();
      if (layerList && layerList.plainOptions1) {
        layerList.plainOptions1.forEach(item => {
          item.isCheck = false;
        });
      }
      if (layerList && layerList.plainOptions2) {
        layerList.plainOptions2.forEach(item => {
          item.isCheck = false;
        });
      }
      this.hlTlData.splice(0);
      this.$refs.buttonPostion.isModel = false;
      this.isOpenLayerList = false;
      this.IdentifyShow = false;
      this.gqsxstl = true;
      if (shouldSearchQxtYjOnSwitch(this.qxyjCheckkData, type)) {
        this.searchQxtYj();
      }
      this.nlColumns = resolveShortTermRankColumnsOnSwitch(this.nlColumns);
      this.isInitTableChart = true;
      this.reconcileRegionFromButton();
      const prep = planModuleSwitchRegionPrep({
        fromIndex: this.disasterTypeIndex,
        toType: type,
        mode: this.regionContext.mode
      });
      if (prep.saveBrowseSnapshot) {
        this.saveBrowseSnapshotIfNeeded();
      }
      if (prep.promoteDrill) {
        this.promoteDrillRegionBeforeModuleSwitch();
      }
      if (prep.syncOnSwitch) {
        this.syncRegionOnModuleSwitch(type);
      }
      const cleanup = planModuleSwitchCleanup();
      if (cleanup.clearDetailFlags) {
        this.isByDetailsChart = false;
        this.isSkDetailsChart = false;
        this.isJsDetailsChart = false;
      }
      if (cleanup.clearFloodSubmergedLayers) {
        this._clearFloodSubmergedMapLayers();
      }
      if (cleanup.clearFloodSubmergedTimer && this._floodSubmergedLoadTimer) {
        clearTimeout(this._floodSubmergedLoadTimer);
        this._floodSubmergedLoadTimer = null;
      }
      if (cleanup.bumpSubmergedRequestId) {
        this.floodSubmergedRequestId += 1;
      }
      if (earthMap) {
        if (cleanup.clearBusinessLayersIfMap) {
          this.clearBusinessLayersViaFacade();
        }
        if (cleanup.clearRainfallCacheIfMap) {
          this.clearRainfallLayerCache();
        }
      }
      if (cleanup.clearAdminBoundaries) {
        this.clearAdminRegionBoundaries();
      }
      if (cleanup.clearMarkers) {
        this.removeMapAllMaker();
      }
      if (cleanup.hideTaskList) {
        this.showTaskList = false;
      }
      this.disasterTypeIndex = type;
      this.currentActiveModule = type;
      const pendingPlan = planModuleSwitchPending({ toType: type });
      if (pendingPlan.adoptCrossModule) {
        this.adoptCrossModuleRegionIfNeeded(crossModuleFloodDrill);
      }
      if (pendingPlan.clearDrillFields) {
        this.detailsTitleXzqh = "";
        this.tableDirllObj = {};
      }
      if (pendingPlan.setPending) {
        this.pendingCrossModuleFloodDrill = this.buildPendingFloodRegion();
      } else if (pendingPlan.clearPending) {
        this.pendingCrossModuleFloodDrill = null;
      }
      const boundaryPlan = planModuleSwitchBoundary({
        toType: type,
        activeCode: this.getActiveFloodXzqdm()
      });
      if (boundaryPlan.action === "syncAndRestore") {
        this.syncActiveRegionToButton();
        this.$nextTick(() => {
          this.restoreActiveRegionBoundary();
        });
      } else if (boundaryPlan.action === "resetNational") {
        if (this.$refs.buttonPostion) {
          this.$refs.buttonPostion.resetToNational({ silent: true });
        }
        this.goNationalViewViaFacade();
      }
      this.timeTabActive = 2;
      const loadPlan = planModuleSwitchLoad({
        toType: type,
        csnlValue: this.csnlValue,
        shValue: this.shValue,
        isMapType: this.isMapType
      });
      const uiMeta = loadPlan.uiMeta;
      if (loadPlan.kind === "shortTerm" && uiMeta) {
        this.isMapType = uiMeta.isMapType;
        this.mapTitleName = uiMeta.mapTitleName;
        this.rankingListTitle = uiMeta.rankingListTitle;
        this.statisticsChartTitle = uiMeta.statisticsChartTitle;
        this.isTaskListBtn = uiMeta.isTaskListBtn;
        this.getTaskList(loadPlan.taskType, {
          skipRegionRestore: loadPlan.skipRegionRestore
        });
      } else if (loadPlan.kind === "live" && uiMeta) {
        this.isMapType = uiMeta.isMapType;
        this.mapTitleName = uiMeta.mapTitleName;
        if (loadPlan.clearScrollTop) {
          this.scrollTopList = [];
        }
        this.isTaskListBtn = uiMeta.isTaskListBtn;
        this.rankingListTitle = uiMeta.rankingListTitle;
        this.statisticsChartTitle = uiMeta.statisticsChartTitle;
        this.getTaskList(loadPlan.taskType, {
          skipRegionRestore: loadPlan.skipRegionRestore
        });
        if (loadPlan.alsoLoadLiveRain) {
          this.getSkJsData();
        }
      } else if (
        loadPlan.kind === "urbanFlood" ||
        loadPlan.kind === "mountainFlood"
      ) {
        this.nlColumns = resolveFloodRankColumns(
          this.nlColumns,
          loadPlan.periodValue
        );
        if (uiMeta) {
          if (uiMeta.tjuTabChke) {
            this.tjuTabChke = uiMeta.tjuTabChke;
          }
          this.mapTitleName = uiMeta.mapTitleName;
          this.rankingListTitle = uiMeta.rankingListTitle;
          this.statisticsChartTitle = uiMeta.statisticsChartTitle;
          this.isTaskListBtn = uiMeta.isTaskListBtn;
        }
        if (loadPlan.clearScrollTop) {
          this.scrollTopList = [];
        }
        if (loadPlan.resetThreeMap && this.$refs.threeMap) {
          this.$refs.threeMap.resetApi();
          this.$refs.threeMap.clearEffect();
        }
        this.getTaskList(loadPlan.taskType, {
          skipRegionRestore: loadPlan.skipRegionRestore
        });
      }
    },
    getShTimeData(modelType, type, xzqdm) {
      let params = {
        modelType: modelType,
        taskTime: this.taskSelectedTime,
        type: type == 1 ? "DL" : "SK",
        xzqdm: xzqdm
      };
      getShTimeData(params).then(res => {
        if (res.code == 200) {
          this.timeData = [];
          this.timeData = res.data;
          this.initTimeLine(); // 初始化时间轴
        }
      });
    },
    // 获取未来三小时的降水排行
    getByyjcsData(type) {
      getByyjcsData({
        taskTime: this.taskSelectedTime
      }).then(res => {
        if (res.code === 200) {
          this.byCount = res.data.count;
          this.byChange = res.data.change;
          this.byData = res.data.list;
          const prepared = prepareRainstormWarningDisplay(res.data.list);
          this.scrollTopList = prepared.scrollTopList;
          if (type != "colorImg") {
            prepared.markerJobs.forEach(job => {
              this.addMarkerViaFacade(
                job.coordinate,
                job.imgUrl,
                job.data,
                job.type
              );
            });
          }
          if (type != "check") {
            this.duanlinTimeChange(3);
          }
        }
      });
    },
    //获取未来三小时的时间轴
    getByyjcsSJZ() {
      getByyjcsSJZ({
        taskTime: this.taskSelectedTime
      }).then(res => {
        if (res.code === 200) {
          this.timeData = [];
          this.timeData = res.data;
          this.initTimeLine(); // 初始化时间轴
        } else {
          this.timeData = [];
          this.initTimeLine(); // 初始化时间轴
        }
      });
    },
    // 获取积水深度时间轴（仅钻取详情或 3D 使用）
    getJsSd(val) {
      if (
        (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) &&
        !this.isJsDetailsChart &&
        !this.isMapType
      ) {
        return;
      }
      getjsTime({
        taskTime: this.taskSelectedTime,
        type: val,
        xzqdm: this.tableDirllObj.xzqdm || this.getFloodQueryXzqdm() || "",
        modelType:
          this.disasterTypeIndex == 3
            ? "1"
            : this.disasterTypeIndex == 4
              ? "2"
              : ""
      }).then(res => {
        if (res.code === 200) {
          // 钻取模式下进行预加载
          if (this.isJsDetailsChart && res.data && res.data.length > 0) {
            console.log('🔵 开始预加载钻取图层，时间轴数据长度:', res.data.length);
            this.cacheDrillLayers(res.data);
          }
          this.timeData = res.data;
          this.initTimeLine(); // 初始化时间轴
        } else {
          this.timeData = [];
          this.initTimeLine(); // 初始化时间轴
        }
      });
    },
    jyPx(type) {
      this.jyOrderType = type;
      if (this.tjuTabChke == "未来三小时") {
        this.getSixData(type);
      } else {
        this.getJsData(type);
      }
    },
    skPx(type) {
      this.skOrderType = type;
      this.getSkJsData(type);
    },
    getJsData(type) {
      const orderType = type || this.jyOrderType || "sumjyDesc";
      this.jyOrderType = orderType;
      this.wlsxsjyRainRankList = [];
      getJsData(
        buildShortTermRankParams({
          orderType,
          taskTime: this.taskSelectedTime,
          queryCode: this.getStoreQueryCode()
        })
      ).then(res => {
        if (res.code === 200) {
          this.wlsxsjyRainRankList = adaptShortTermRankList(res.data);
          this.initChart(this.wlsxsjyRainRankList);
        }
      });
    },
    // 获取实时累计降雨排行
    getSkJsData(orderType) {
      const sortType = orderType || this.skOrderType || "sumjslDesc";
      this.skOrderType = sortType;
      this.disasterTypeIndex = 2;
      this.skjsRainRankList = [];
      getSkJsData(
        buildLiveRainRankParams({
          orderType: sortType,
          liveRainType: this.liveRainType,
          liveDate: this.liveDate,
          taskTime: this.taskSelectedTime,
          queryCode: this.getStoreQueryCode()
        })
      ).then(res => {
        if (res.code !== 200) {
          return;
        }
        this.skjsRainRankList = mapRankResponseList(res, adaptLiveRainRankItem);
        this.initChart(this.skjsRainRankList);
        this.getSkJsPngUrl();
      });
    },
    searchQxtYj() {
      searchQxtYj({}).then(res => {
        if (res.code && res.data) {
          buildQxtYjMarkerJobs(res.data).forEach(job => {
            this.addQxjMarkerViaFacade(
              job.coordinate,
              job.imgUrl,
              job.data,
              job.type
            );
          });
        }
      });
    },
    // 获取积水深度过去3小时
    getJsGqthreeData() {
      this.jssdRainRankList = [];
      getjssdGqSix(this.buildFloodRankParams()).then(res => {
        this.applyFloodRankApiResult(this.jssdRainRankList, res);
      });
    },
    // 获取山洪过去3小时积水排行
    getShGqthreeData() {
      this.sHjssdRainRankList = [];
      getShJsPhGQ(this.buildFloodRankParams()).then(res => {
        this.applyFloodRankApiResult(this.sHjssdRainRankList, res);
      });
    },
    // 获取实况降雨图层
    getSkJsPngUrl() {
      getSkJsPngUrl(
        buildLivePngParams({
          liveRainType: this.liveRainType,
          liveDate: this.liveDate,
          taskTime: this.taskSelectedTime
        })
      ).then(res => {
        if (res.code === 200) {
          const url = this.baseUrl + "file/" + res.data;
          this.clearBusinessLayersViaFacade();
          const imageExtent = LIVE_PNG_IMAGE_EXTENT.slice();
          // 同步给 OL 预览对照
          this.syncOlPreviewImageLayer(url, imageExtent);
          this.addImageLayerViaFacade({
            layerName: LIVE_RAIN_LAYER_NAME,
            url: url,
            imageExtent
          });
        }
      });
    },
    // 获取积水深度排行
    getNlyjcsData() {
      getNlyjcsData(this.buildFloodRankParams()).then(res => {
        this.applyWarningCityApiResult(res);
      });
    },
    // 获取山洪未来三小时预警城市
    getshyjcsData() {
      getShYJcsWL(this.buildFloodRankParams()).then(res => {
        this.applyWarningCityApiResult(res, "SH");
      });
    },
    // 获取积水深度过去三小时排行
    getNlyjcsGqThreeData() {
      getjssdGqSixCsyj(this.buildFloodRankParams()).then(res => {
        this.applyWarningCityApiResult(res, "", this.csnlValue == 1);
      });
    },
    // 获取山洪过去三小时预警城市
    getshYjGqData() {
      getShYJcsGQ(this.buildFloodRankParams()).then(res => {
        this.applyWarningCityApiResult(res);
      });
    },
    // 积水深度排行
    getJssdData() {
      this.jssdRainRankList = [];
      getJssdData(this.buildFloodRankParams()).then(res => {
        this.applyFloodRankApiResult(this.jssdRainRankList, res);
      });
    },
    // 山洪未来3小时积水深度排行
    getshJssdData() {
      this.sHjssdRainRankList = [];
      getShJsPhWL(this.buildFloodRankParams()).then(res => {
        this.applyFloodRankApiResult(this.sHjssdRainRankList, res);
      });
    },
    // 右下图表（委托 StatisticsChartPanel）
    initChart(data) {
      this.$nextTick(() => {
        const panel = this.$refs.statsChartPanel;
        if (!panel) {
          return;
        }
        this.myChart = panel.render(data || []);
      });
    },
    disposeSumChart() {
      const panel = this.$refs.statsChartPanel;
      if (panel && typeof panel.dispose === "function") {
        panel.dispose();
      } else if (this.myChart) {
        try {
          this.myChart.dispose();
        } catch (e) {
          /* ignore */
        }
      }
      this.myChart = null;
    },
    resizeSumChart() {
      const panel = this.$refs.statsChartPanel;
      if (panel && typeof panel.resize === "function") {
        panel.resize();
        return;
      }
      if (this.myChart) {
        this.myChart.resize();
      }
    },
    /** 同步当前可见降雨 PNG 到 OL 预览（短临/实况/内涝） */
    syncOlPreviewImageLayer(url, imageExtent) {
      this.olPreviewImageLayer = buildOlPreviewImagePayload(
        url,
        imageExtent || this.imageExtent,
        0.55
      );
    },
    /** 详情钻取图：从 DetailChartsPanel 取 dom 并初始化 echarts */
    initDetailsChartInstance(kind) {
      const panel = this.$refs.detailChartsPanel;
      const el = panel && typeof panel.getChartEl === "function"
        ? panel.getChartEl(kind)
        : null;
      if (!el) {
        return null;
      }
      if (this.myDetailsChart) {
        try {
          this.myDetailsChart.dispose();
        } catch (e) {
          /* ignore */
        }
        this.myDetailsChart = null;
      }
      this.myDetailsChart = echarts.init(el);
      return this.myDetailsChart;
    },
    tjtTabCheck() {
      this.wlsxsjyRainRankList = [];
      if (this.tjuTabChke == "未来三小时") {
        this.tjuTabChke = "六小时累计";
        this.getJsData();
      } else {
        this.tjuTabChke = "未来三小时";
        this.getSixData();
      }
    },
    // 获取六小时累计数据
    getSixData(type) {
      const orderType = type || this.jyOrderType || "sumjyDesc";
      this.jyOrderType = orderType;
      this.wlsxsjyRainRankList = [];
      let params = {
        orderType,
        taskTime: this.taskSelectedTime,
        xzqdm: this.positionXzqCode
      };
      geWlSixData(params).then(res => {
        this.wlsxsjyRainRankList = adaptShortTermRankList(
          res && res.data ? res.data : []
        );
        this.initChart(this.wlsxsjyRainRankList);
      });
    },
    findFloodRankRowForXzqdm(drillXzqdm, list) {
      return findFloodRankRowForXzqdmFromModule(drillXzqdm, list);
    },
    handleCrossModuleFloodDrillNoData(pending) {
      this.floodCrossDrillNoData = true;
      this.jssdRainRankList = [];
      this.sHjssdRainRankList = [];
      this.scrollTopList = [];
      this.timeData = [];
      this.initTimeLine();
      if (this.myChart) {
        this.disposeSumChart();
      }
      this.isInitTableChart = true;
      this.isJsDetailsChart = false;
      this.isByDetailsChart = false;
      this.isSkDetailsChart = false;
      this.detailsTitleXzqh = "";
      this.tableDirllObj = {};
      if (pending && pending.xzqdm) {
        const drill = resolveDrillRegion({
          xzqdm: pending.xzqdm,
          xiandm: pending.xzqdm,
          name: pending.name
        });
        const code = drill.code || String(pending.xzqdm);
        const label = pending.name || drill.label || "";
        this.applyRegionContext(
          {
            mode: REGION_MODE.BROWSE,
            code,
            label,
            lockMinCode: null,
            lockMinLevel: null,
            warningCode: drill.warningCode || code
          },
          { silent: true, skipBoundary: true }
        );
        this.positionXzqCode = getQueryCode(this.regionContext) || code;
      }
    },
    tryResumeCrossModuleFloodDrill() {
      const pending = this.pendingCrossModuleFloodDrill;
      if (!shouldTryResumeCrossModuleFloodDrill(pending, this.disasterTypeIndex)) {
        return false;
      }
      const list =
        this.disasterTypeIndex === 3
          ? this.jssdRainRankList
          : this.sHjssdRainRankList;
      this.pendingCrossModuleFloodDrill = null;

      if (!list || !list.length) {
        this.handleCrossModuleFloodDrillNoData(pending);
        return true;
      }

      this.floodCrossDrillNoData = false;
      return false;
    },
    // 钻取详情
    openDetailsChart(item) {
      this.floodCrossDrillNoData = false;
      const drillItem =
        this.disasterTypeIndex === 1 || this.disasterTypeIndex === 2
          ? Object.assign({}, item, {
              xzqdm: getRainfallDrillCode(item) || item.xzqdm
            })
          : item;
      this.detailsTitleXzqh = drillItem.name;
      this.tableDirllObj = drillItem;
      this.isInitTableChart = false;
      if (this.disasterTypeIndex === 1 || this.disasterTypeIndex === 2) {
        this.enterDrillRegion(drillItem);
      } else if (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) {
        // 重构：内涝/山洪表格钻取写入新 Store（旧逻辑暂不改 regionContext）
        this.syncRegionStoreDrill(drillItem);
      }
      this.searchXzqfw(drillItem);
      if (this.disasterTypeIndex === 1) {
        this.isByDetailsChart = true;
        this.fetchRainfallWarningInfo();
        this.$nextTick(() => {
          this.getJsDataXz(drillItem);
        });
      } else if (this.disasterTypeIndex === 2) {
        this.isSkDetailsChart = true;
        this.$nextTick(() => {
          this.getSkJsDataXz(drillItem);
        });
      } else if (this.disasterTypeIndex === 3) {
        this.isJsDetailsChart = true;
        this.fetchCsnlWarningInfo();
        this.$nextTick(() => {
          if (this.csnlValue == 1) {
            if (this.isMapType) {
              this.getShTimeData(this.csnlValue, item.xzqdm);
            } else {
              // 先获取详情数据，然后在详情数据获取完成后再获取时间轴并预加载
              this.getJssdDataXz(item);
            }
          } else {
            this.getJSsdXzMes(item);
          }
        });
      } else if (this.disasterTypeIndex === 4) {
        this.isJsDetailsChart = true;
        this.fetchShWarningInfo();
        this.$nextTick(() => {
          if (this.shValue == 1) {
            if (this.isMapType) {
              this.getShTimeData(this.shValue, this.shValue, item.xzqdm);
            } else {
              // 先获取详情数据，然后在详情数据获取完成后再获取时间轴并预加载
              this.getShJssdDataXz(item);
            }
          } else {
            this.getShJsGQXZ(item);
          }
        });
      }
    },
    // 积水深度过去三小时排行下钻详情
    getJSsdXzMes(item) {
      this.jsDatailsLineData = null;
      let params = {
        taskTime: this.taskSelectedTime,
        xzqdm: item.xzqdm
      };
      getSKLSJssdDataXz(params).then(res => {
        if (res.code === 200) {
          this.jsDatailsLineData = res.data;
          // this.timeTabActive = 1;
          if (this.isMapType) {
            this.getShTimeData(this.csnlValue, this.csnlValue, item.xzqdm);
          } else {
            this.getSKLSSJZ(item.xzqdm);
          }
          this.jsChartType = "hour";
          this.setJsChartLine(this.jsDatailsLineData.hour);
        }
      });
    },
    // 山洪积水深度排行下钻详情
    getShJSsdXzMes(item) {
      this.jsDatailsLineData = null;
      let params = {
        taskTime: this.taskSelectedTime,
        xzqdm: item.xzqdm
      };
      getSKLSJssdDataXz(params).then(res => {
        if (res.code === 200) {
          this.jsDatailsLineData = res.data;
          // this.timeTabActive = 1;
          this.getShTimeData(this.shValue, this.shValue, item.xzqdm);
          this.jsChartType = "hour";
          this.setJsChartLine(this.jsDatailsLineData.hour);
        }
      });
    },
    // 详情返回
    returnToInitTableChart() {
      this.exitTableDetailView();
      this.$nextTick(() => {
        this.refreshListAfterExitDetail();
      });
    },
    // 详情图表
    byChangeChartType(type) {
      this.byChartType = type;
      this.setByChartBar(this.byDatailsBarData[this.byChartType]);
    },
    getJsDataXz(item) {
      getJsDataXz({
        taskTime: item.dateTime,
        xzqdm: getRainfallDrillCode(item)
      }).then(res => {
        if (res.code === 200) {
          this.byDatailsBarData = res.data;
          this.setByChartBar(this.byDatailsBarData[this.byChartType]);
        }
      });
    },
    setByChartBar(data) {
      const chart = this.initDetailsChartInstance("by");
      if (!chart) return;
      chart.setOption(buildByDetailChartOption(data));
    },
    //实况降雨
    getSkJsDataXz(item) {
      const drillCode = getRainfallDrillCode(item);
      getSkJsDataXz(
        buildLiveDrillParams({
          taskTime: this.taskSelectedTime,
          liveRainType: this.liveRainType,
          xzqdm: drillCode
        })
      ).then(res => {
        if (res.code === 200) {
          this.setSkChartBar(res.data);
          let obj = {
            xzqdm: drillCode,
            type: "skjyXz",
            name: item.name,
            lon: Number(item.x),
            lat: Number(item.y),
            max: item.maxjsl
          };
          let iconUrl = require("../../assets/images/rapidAnalysis/skjyXzIcon.png");
          this.addMarkerViaFacade([item.x, item.y], iconUrl, obj, "skjyXz");
        }
      });
    },
    setSkChartBar(data) {
      const chart = this.initDetailsChartInstance("sk");
      if (!chart) return;
      chart.setOption(buildSkDetailChartOption(data));
    },
    // 积水深度
    jsChangeChartType(type) {
      this.jsChartType = type;
      this.setJsChartLine(this.jsDatailsLineData[this.jsChartType]);
    },
    getJssdDataXz(item) {
      this.jsDatailsLineData = null;
      getJssdDataXz({
        taskTime: this.taskSelectedTime,
        xzqdm: item.xzqdm
      }).then(res => {
        if (res.code === 200) {
          this.jsDatailsLineData = res.data;
          // this.timeTabActive = 1;
          // 获取时间轴数据并进行预加载
          if (!this.isMapType) {
            // 先获取时间轴数据，然后在回调中触发预加载
            this.getJsSd(resolveFloodTimelineDataType(this.timeTabActive));
          }
          this.setJsChartLine(this.jsDatailsLineData[this.jsChartType]);
        }
      });
    },
    // 山洪未来下钻
    getShJssdDataXz(item) {
      this.jsDatailsLineData = null;
      getShJsWLXZ({
        taskTime: this.taskSelectedTime,
        xzqdm: item.xzqdm
      }).then(res => {
        if (res.code === 200) {
          this.jsDatailsLineData = res.data;
          // this.timeTabActive = 1;
          // 获取时间轴数据并进行预加载
          if (!this.isMapType) {
            // 先获取时间轴数据，然后在回调中触发预加载
            this.getJsSd(resolveFloodTimelineDataType(this.timeTabActive));
          }
          this.setJsChartLine(this.jsDatailsLineData[this.jsChartType]);
        }
      });
    },
    // 山洪过去下钻
    getShJsGQXZ(item) {
      this.jsDatailsLineData = null;
      getShJsGQXZ({
        taskTime: this.taskSelectedTime,
        xzqdm: item.xzqdm
      }).then(res => {
        if (res.code === 200) {
          this.jsDatailsLineData = res.data;
          // this.timeTabActive = 1;
          if (this.isMapType) {
            this.getShTimeData(this.shValue, this.shValue, item.xzqdm);
          } else {
            this.getSKLSSJZ(item.xzqdm);
          }
          this.setJsChartLine(this.jsDatailsLineData[this.jsChartType]);
        }
      });
    },
    setJsChartLine(data) {
      const chart = this.initDetailsChartInstance("js");
      if (!chart) return;
      chart.setOption(
        buildJsDetailChartOption(data, this.jsChartType),
        true
      );
    },
    // 任务列表点击
    taskItemClick(item) {
      // 判断是否为切换至最新时间
      if (item == "new") {
        this.taskSelectedTime = this.taskList[0].tasktime;
        this.isNowTime = true;
        this.historyTaskTime = null;
        this.taskStatus = this.taskList[0] ? this.taskList[0].lostdata : "";
        sessionStorage.setItem('rapidAnalysis_isNowTime', 'true');
        sessionStorage.removeItem('rapidAnalysis_taskSelectedTime');
      } else {
        this.taskSelectedTime = item.tasktime;
        this.isNowTime = false;
        this.historyTaskTime = item.tasktime;
        this.taskStatus = item.lostdata;
        sessionStorage.setItem('rapidAnalysis_isNowTime', 'false');
        sessionStorage.setItem('rapidAnalysis_taskSelectedTime', item.tasktime);
      }
      /*if(item != "new" && !(item.id)){
        this.$message.warning("当前时间段没有任务！");
        return;
      }*/
      if (this.$refs.threeMap && this.isMapType) {
        this.$refs.threeMap.clearEffect();
      }
      this.nlthreeCreated = 1;
      this.removeMapAllMaker();
      //this.newTime = this.taskSelectedTime
      this.getNowTime();
      // 切换任务时间后刷新预警信息
      this.fetchCurrentModuleWarningInfo();
      if (this.disasterTypeIndex === 1) {
        this.getByyjcsData();
        this.getJsData();
      } else if (this.disasterTypeIndex === 3) {
        if (this.csnlValue == 1) {
          this.getNlyjcsData();
          this.getJssdData();
        } else {
          this.getJsGqthreeData();
          this.getNlyjcsGqThreeData();
        }
      } else if (this.disasterTypeIndex === 4) {
        if (this.shValue == 1) {
          this.getshyjcsData();
          this.getshJssdData();
        } else {
          this.getshYjGqData();
          this.getShGqthreeData();
        }
      }
    },
    // 日期面板选中事件
    taskCalendarSelect(date) {
      const that = this;
      const timeDataList = [
        "00:00",
        "01:00",
        "02:00",
        "03:00",
        "04:00",
        "05:00",
        "06:00",
        "07:00",
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
        "23:00"
      ];

      that.taskList.forEach(item => {
        if (item.tasktime.indexOf(moment(date).format("YYYY-MM-DD")) > -1) {
          that.taskTimeDataList.push(item);
        }
      });
      if (process.env.NODE_ENV === 'development') {
        console.log("原始时间数组", that.taskTimeDataList);
      }
      //正常是24个小时，如果that.taskTimeDataList数组当前不够24个小时，则补充
      let timeArr = that.taskTimeDataList.map(
        item => item.tasktime.split(" ")[1]
      );
      let timeArrLen = timeArr.length;
      if (timeArrLen < 24) {
        let addTimeArr = timeDataList.filter(
          item => timeArr.indexOf(item) == -1
        );
        addTimeArr.forEach(item => {
          that.taskTimeDataList.push({
            tasktime: moment(date).format("YYYY-MM-DD") + " " + item
          });
        });
      }
      //保留之前的对象属性，重新排序
      that.taskTimeDataList = that.taskTimeDataList.sort((a, b) => {
        return a.tasktime.localeCompare(b.tasktime);
      });
      // console.log(that.taskTimeDataList)
    },
    // 查看积水深度
    seeJssdChart() {
      this.isByDetailsChart = false;
      this.isSkDetailsChart = false;
      this.isJsDetailsChart = true;
      this.getJssdDataXz();
    },
    // 切换至降雨量
    tabByChart() {
      this.isByDetailsChart = true;
      this.isSkDetailsChart = false;
      this.isJsDetailsChart = false;
    },
    // 清除地图点位
    removeMapAllMaker() {
      this.clearMarkersViaFacade();
    },
    timeTabActiveType(index) {
      this.timeTabActive = index;
      // 清除当前显示的钻取图层key，以便重新加载
      this.drillCurrentVisibleLayerKey = null;

      // 清除旧的图层缓存（历史和未来淹没的图层key不同，需要清除）
      if (this.isJsDetailsChart) {
        // 清除所有钻取相关的图层缓存
        const keysToDelete = [];
        this.layerCache.forEach((value, key) => {
          if (key.includes(this.tableDirllObj.xzqdm || '')) {
            keysToDelete.push(key);
          }
        });
        keysToDelete.forEach(key => {
          const layer = this.layerCache.get(key);
          if (layer) {
            try {
              me.earth.removeLayer(layer);
            } catch (e) {
              console.warn('移除图层失败:', e);
            }
          }
          this.layerCache.delete(key);
        });
      }

      if (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) {
        if (this.timeTabActive === 1) {
          if (this.isMapType) {
            this.getShTimeData(1, 2, this.tableDirllObj.xzqdm);
          } else {
            if (this.shValue == 1) {
              this.getJsSd(index == 1 ? "SK" : "DL");
            } else {
              this.getSKLSSJZ(this.tableDirllObj.xzqdm);
            }
          }
        } else {
          if (this.isMapType) {
            this.getShTimeData(1, 1, this.tableDirllObj.xzqdm);
          } else {
            if (this.shValue == 1) {
              this.getJsSd(index == 1 ? "SK" : "DL");
            } else {
              this.getSKLSSJZ(this.tableDirllObj.xzqdm);
            }
          }
        }
      }
    },
    duanlinTimeChange(index) {
      this.dltimeTabActive = index;
      fetchShortTermTimeline({
        resolution: index,
        taskTime: this.taskSelectedTime,
        fetcherMap: {
          1: dljySixMinSjz,
          2: dljyOnehoursSjz,
          3: dljyThreeHoursSjz
        }
      }).then(res => {
        if (res.code === 200) {
          this.cacheLayers2(res.data);
          this.timeData = res.data;
          this.initTimeLine();
        } else {
          this.timeData = [];
          this.initTimeLine();
        }
      });
    },
    //打开案例收藏的弹窗
    openCaseCollcetion() {
      Object.assign(
        this,
        buildOpenCaseCollectionPatch({
          detailsShow: this.isCaseCollectionDetailsShow,
          fullscreen: this.isCaseCollectionFullscreen
        })
      );
      this.getCaseAll();
    },
    printStarClick(print) {
      Object.assign(this, buildPrintStarPrep(print));
      if (
        isCaseDetailsEditing(
          this.isCaseCollectionDetailsShow,
          this.isCaseCollectionFullscreen
        )
      ) {
        this.addCaseToCollection();
      } else {
        this.isCaseCollectionSelectShow = true;
        this.getCaseAll();
      }
    },
    caseSelectChange(value) {
      this.caseSelectValue = value;
    },
    //单个收藏
    addCaseToCollection() {
      requestSingleCollect(
        buildSingleCollectPointParams({
          caseSelectValue: this.caseSelectValue,
          caseDetailsId: this.caseDetailsId,
          coordinatePoint: this.coordinatePoint,
          caseTaskId: this.caseTaskId,
          singleCollectType: this.singleCollectType,
          disasterTypeIndex: this.disasterTypeIndex
        })
      ).then(result => {
        if (result.ok) {
          this.$message.success(result.message);
          const caseMain = this.getCaseMainRef();
          if (caseMain) caseMain.getCaseInfoData();
        } else {
          this.$message.error(result.message);
        }
      });
    },
    createCase() {
      Object.assign(this, buildCreateCasePanelPatch());
      this.$nextTick(() => {
        if (this.getCaseMainRef()) {
          this.getCaseMainRef().resetCaseForm();
        }
      });
      this.getSaveCase_other();
    },
    getSaveCase_other() {
      requestCreateCaseDraft().then(result => {
        if (result.ok && result.data) {
          this.caseDetailsId = result.data;
        }
      });
    },
    closeCaseDetails() {
      Object.assign(this, buildCloseCaseDetailsPatch());
    },
    showScreenCaseDetails() {
      Object.assign(this, buildExpandCaseDetailsPatch());
    },
    hideScreenCaseDetails() {
      Object.assign(this, buildCollapseCaseDetailsPatch());
    },
    // 任务列表时间收藏案例
    starCase(item) {
      Object.assign(this, buildStarCasePrep(item));
      this.getCaseAll();
      if (
        isCaseDetailsEditing(
          this.isCaseCollectionDetailsShow,
          this.isCaseCollectionFullscreen
        )
      ) {
        this.addCaseToCollection();
      } else {
        Object.assign(this, buildOpenSelectCasePatch());
      }
    },
    // 数据列表收藏
    starCaseData(item, type, yjlx) {
      requestSingleCollect(
        buildSingleCollectDataParams({
          caseDetailsId: this.caseDetailsId,
          item: item,
          type: type,
          yjlx: yjlx
        })
      ).then(result => {
        if (result.ok) {
          this.$message.success(result.message);
          const caseMain = this.getCaseMainRef();
          if (caseMain) caseMain.getCaseInfoData();
        } else {
          this.$message.error(result.message);
        }
      });
    },
    //获取案例列表
    getCaseAll() {
      fetchCaseList(this.caseSearchValue).then(result => {
        if (result.ok) {
          this.caseList = result.data || [];
        }
      });
    },
    //查看案例详情
    showCaseDetails(item) {
      Object.assign(this, buildShowCaseDetailsPatch(item.case_id));
    },
    handleSaveCase(type) {
      const caseMain = this.getCaseMainRef();
      if (!caseMain) {
        this.$message.error("案例详情未就绪");
        return;
      }
      const built = buildSaveCaseRequest(
        {
          form: caseMain.form,
          print: caseMain.dwTableData,
          history: caseMain.historyCaseList,
          cityData: caseMain.cityData,
          dataList: caseMain.dataList,
          caseDetailsId: this.caseDetailsId
        },
        dateVal =>
          moment(dateVal)
            .startOf("hour")
            .format("YYYY-MM-DD HH:mm:ss")
      );
      if (!built.valid) {
        this.$message.error(built.error || "请填写案例名称");
        return;
      }
      requestSaveCase(built.payload).then(result => {
        if (result.ok) {
          Object.assign(
            this,
            buildAfterSaveCasePatch({
              caseId: result.data,
              keepDetailsOpen: type
            })
          );
          this.$message.success(result.message);
          this.getCaseAll();
          const caseMainRef = this.getCaseMainRef();
          if (caseMainRef) caseMainRef.getCaseInfoData(result.data);
        } else {
          this.$message.error(result.message);
        }
      });
    },
    openCaseListDetails() {
      Object.assign(this, buildOpenCaseListDetailsPatch());
    },
    deleteCase(item, type) {
      this.$confirm({
        title: "提示",
        content: "确定要删除当前案例吗？",
        okText: "确认",
        cancelText: "取消",
        onOk: () => {
          return requestDeleteCase(item, type).then(result => {
            if (result.ok) {
              this.$message.success(result.message);
              this.getCaseAll();
            } else {
              this.$message.error(result.message);
            }
          });
        }
      });
    },
    caseHistoryTaskClick(item) {
      item.tasktime = formatCaseHistoryTaskTime(item.task_name);
    },
    seePrint(item) {
      const identifyRef = this.getIdentifyRef();
      if (identifyRef && typeof identifyRef.searchBackward === "function") {
        identifyRef.searchBackward(item.lon, item.lat);
      }
    }
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
