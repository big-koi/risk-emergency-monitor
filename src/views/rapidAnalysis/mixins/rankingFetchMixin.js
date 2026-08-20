/**
 * 排行 / 时间轴 / 预警城市 数据拉取壳
 */
import {
  getByyjcsData as fetchByyjcsDataApi,
  getByyjcsSJZ as fetchByyjcsSjzApi,
  getjsTime as fetchJsTimeApi,
  getJsData as fetchJsDataApi,
  getSkJsData as fetchSkJsDataApi,
  getSkJsPngUrl as fetchSkJsPngUrlApi,
  getNlyjcsData as fetchNlyjcsDataApi,
  getJssdData as fetchJssdDataApi,
  getjssdGqSix,
  getjssdGqSixCsyj,
  getShJsPhGQ,
  getShJsPhWL,
  getShYJcsGQ,
  getShYJcsWL,
  getShTimeData as fetchShTimeDataApi,
  searchQxtYj as fetchSearchQxtYjApi,
  geWlSixData
} from "@/api/rapidAnalysis/index.js";
import {
  buildShortTermRankParams,
  DEFAULT_SHORT_TERM_RESOLUTION,
  adaptShortTermRankList
} from "../modules/shortTermForecast";
import {
  buildLiveRainRankParams,
  buildLivePngParams,
  adaptLiveRainRankItem,
  LIVE_PNG_IMAGE_EXTENT,
  LIVE_RAIN_LAYER_NAME
} from "../modules/liveRainfall";
import {
  resolveShortTermOrderType,
  resolveLiveOrderType,
  planJyPxAction,
  planByyjcsDataApply,
  planShortTermRankApply,
  planLiveRankApply,
  planSixHourRankApply
} from "../modules/rankings";
import {
  shouldFetchFloodDepthTimeline,
  buildJsDepthTimelineParams,
  buildShModelTimelineParams
} from "../modules/urbanFlood";
import {
  prepareRainstormWarningDisplay,
  buildQxtYjMarkerJobs
} from "../modules/warnings";

export const rankingFetchMixin = {
  methods: {
    getShTimeData(modelType, type, xzqdm) {
      fetchShTimeDataApi(
        buildShModelTimelineParams({
          modelType: modelType,
          taskTime: this.taskSelectedTime,
          type: type,
          xzqdm: xzqdm
        })
      ).then(res => {
        this.applyTimelineResponse(res, { skipOnFail: true });
      });
    },
    // 获取未来三小时的降水排行
    getByyjcsData(type) {
      fetchByyjcsDataApi({
        taskTime: this.taskSelectedTime
      }).then(res => {
        const plan = planByyjcsDataApply(res, type);
        if (!plan.ok) {
          return;
        }
        this.byCount = plan.byCount;
        this.byChange = plan.byChange;
        this.byData = plan.byData;
        const prepared = prepareRainstormWarningDisplay(plan.list);
        this.scrollTopList = prepared.scrollTopList;
        if (plan.addMarkers) {
          prepared.markerJobs.forEach(job => {
            this.addMarkerViaFacade(
              job.coordinate,
              job.imgUrl,
              job.data,
              job.type
            );
          });
        }
        if (plan.reloadTimeline) {
          this.duanlinTimeChange(DEFAULT_SHORT_TERM_RESOLUTION);
        }
      });
    },
    //获取未来三小时的时间轴
    getByyjcsSJZ() {
      fetchByyjcsSjzApi({
        taskTime: this.taskSelectedTime
      }).then(res => {
        this.applyTimelineResponse(res);
      });
    },
    // 获取积水深度时间轴（仅钻取详情或 3D 使用）
    getJsSd(val) {
      if (
        !shouldFetchFloodDepthTimeline({
          disasterTypeIndex: this.disasterTypeIndex,
          isJsDetailsChart: this.isJsDetailsChart,
          isMapType: this.isMapType
        })
      ) {
        return;
      }
      fetchJsTimeApi(
        buildJsDepthTimelineParams({
          taskTime: this.taskSelectedTime,
          type: val,
          xzqdm:
            (this.tableDirllObj && this.tableDirllObj.xzqdm) ||
            this.getFloodQueryXzqdm() ||
            "",
          disasterTypeIndex: this.disasterTypeIndex
        })
      ).then(res => {
        if (
          this.isJsDetailsChart &&
          res &&
          res.code === 200 &&
          res.data &&
          res.data.length > 0
        ) {
          console.log(
            "🔵 开始预加载钻取图层，时间轴数据长度:",
            res.data.length
          );
        }
        this.applyTimelineResponse(res, {
          isJsDetailsChart: this.isJsDetailsChart
        });
      });
    },
    jyPx(type) {
      this.jyOrderType = type;
      const action = planJyPxAction(this.tjuTabChke);
      if (action === "getSixData") {
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
      const orderType = resolveShortTermOrderType(type, this.jyOrderType);
      this.jyOrderType = orderType;
      this.wlsxsjyRainRankList = [];
      fetchJsDataApi(
        buildShortTermRankParams({
          orderType,
          taskTime: this.taskSelectedTime,
          queryCode: this.getStoreQueryCode()
        })
      ).then(res => {
        const plan = planShortTermRankApply(res, adaptShortTermRankList);
        if (!plan.ok) {
          return;
        }
        this.wlsxsjyRainRankList = plan.list;
        if (plan.initChart) {
          this.initChart(this.wlsxsjyRainRankList);
        }
      });
    },
    // 获取实时累计降雨排行
    getSkJsData(orderType) {
      const sortType = resolveLiveOrderType(orderType, this.skOrderType);
      this.skOrderType = sortType;
      this.disasterTypeIndex = 2;
      this.skjsRainRankList = [];
      fetchSkJsDataApi(
        buildLiveRainRankParams({
          orderType: sortType,
          liveRainType: this.liveRainType,
          liveDate: this.liveDate,
          taskTime: this.taskSelectedTime,
          queryCode: this.getStoreQueryCode()
        })
      ).then(res => {
        const plan = planLiveRankApply(res, adaptLiveRainRankItem);
        if (!plan.ok) {
          return;
        }
        this.skjsRainRankList = plan.list;
        if (plan.initChart) {
          this.initChart(this.skjsRainRankList);
        }
        if (plan.loadPng) {
          this.getSkJsPngUrl();
        }
      });
    },
    searchQxtYj() {
      fetchSearchQxtYjApi({}).then(res => {
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
      fetchSkJsPngUrlApi(
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
      fetchNlyjcsDataApi(this.buildFloodRankParams()).then(res => {
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
      fetchJssdDataApi(this.buildFloodRankParams()).then(res => {
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
      const orderType = resolveShortTermOrderType(type, this.jyOrderType);
      this.jyOrderType = orderType;
      this.wlsxsjyRainRankList = [];
      geWlSixData({
        orderType,
        taskTime: this.taskSelectedTime,
        xzqdm: this.positionXzqCode
      }).then(res => {
        const plan = planSixHourRankApply(res, adaptShortTermRankList);
        this.wlsxsjyRainRankList = plan.list;
        if (plan.initChart) {
          this.initChart(this.wlsxsjyRainRankList);
        }
      });
    },
  }
};

export default rankingFetchMixin;
