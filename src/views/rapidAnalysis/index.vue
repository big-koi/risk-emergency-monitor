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
    <!-- 任务列表 -->
    <div class="task-list-box">
      <div style="display: flex;">
        <div>
          <buttonPostion
            :regionDisplayLabel="regionToolbarDisplayLabel"
            @upladeLine="upladeLine"
            @positionXzqCode="getPositionXzqCode"
            @regionBack="handleRegionNavigateBack"
            ref="buttonPostion"
          >
          </buttonPostion>
        </div>
        <div @click="showIdentify" class="button">
          <img src="../../assets/images/rapidAnalysis/dwcxIcon.png" alt=""
            style="font-size: 0.2rem;height: 0.2rem;margin-right: 0.05rem;" />点位查询
        </div>
        <div class="button" @click="openLayerList">
          <img style="font-size: 0.2rem;height: 0.2rem;margin-right: 0.05rem;"
            src="../../assets/images/rapidAnalysis/jctcIcon.png" alt="" />基础图层
        </div>
        <div class="button" @click="openCaseCollcetion">
          <a-icon type="star" style="font-size: 0.2rem;height: 0.2rem;margin-right: 0.05rem;color: #98CCFF;" />
          收藏夹
        </div>
        <div class="button" @click="openTaskList" v-if="isTaskListBtn">
          <a-icon type="profile" style="font-size: 18px;color: #1890ff;padding-right: 5px;" />
          任务列表
          <a-icon type="up" v-if="showTaskList" style="font-size: 14px;padding-left: 5px;" />
          <a-icon type="down" v-if="!showTaskList" style="font-size: 14px;padding-left: 5px;" />
        </div>
      </div>
      <div class="task-list" v-if="showTaskList">
        <div class="task-list-btn-box">
          <span class="task-list-return-btn" v-if="taskTimeDataList.length > 0" @click="taskTimeDataList = []"><a-icon
              type="left" />返回</span>
          <div class="switch-to-latest" @click="taskItemClick('new')" v-if="taskTimeDataList.length === 0">
            <a-icon type="sync" />
            切换至最新时间
          </div>
          <a-icon type="close-circle" style="cursor: pointer;" @click="showTaskList = false"
            v-if="taskTimeDataList.length === 0" />
        </div>
        <a-calendar :fullscreen="false" style="width: 100%;" @select="taskCalendarSelect"
          v-show="taskTimeDataList.length === 0" />
        <ul class="tiem-list-box" v-if="taskTimeDataList.length > 0">
          <li class="time-item" v-for="(item, index) in taskTimeDataList" :key="index" :class="item.id != undefined ? 'time-item-active' : 'time-item-no-drop'
            ">
            <span class="time-item-name" @click="taskItemClick(item)">{{
              adjustForecastTime(item.tasktime)
              }}</span>
            <a-icon type="star" class="star-box" @click="starCase(item)" v-if="isCaseCollectionDetailsShow" />
          </li>
        </ul>
      </div>
    </div>
    <!-- 信息查询 -->
    <Identify ref="identifyDom" @addMaker="addMaker" v-if="earthMap" :earthMap="earthMap" :IdentifyShow="IdentifyShow"
      @closeClick="closeClick" @printStar="printStarClick" />
    <!-- 基础图层 -->
    <openLayerList ref="openLayerListRefs" v-show="isOpenLayerList && earthMap" :earthMap="earthMap"
      @openLayer="openLayer" @ischeck="ischeck" @setJcsbLegendShow="setJcsbLegendShow" />
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
    <div class="identify-popup-wrapper" id="mapMarkerModel" v-show="popupShow">
      <div class="identify-popup-header">
        <span>详情</span>
        <a-icon @click="closeIdentify" class="identify-popup-close" style="cursor: pointer" type="close" />
      </div>
      <div class="identify-popup-content" v-if="identifyModel.type == 'qxyj'">
        {{ identifyModel.conten }}
      </div>
      <div class="identify-popup-content" v-else-if="identifyModel.type == 'byyj'">
        <div class="con identify-con">
          <p class="identify-con-label">省名：</p>
          <p class="identify-con-value">
            {{ identifyModel.shengname || "--" }}
          </p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">市名：</p>
          <p class="identify-con-value">{{ identifyModel.shiname || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">预警指标：</p>
          <p class="identify-con-value">{{ identifyModel.maxprcp || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">预警时间：</p>
          <p class="identify-con-value">{{ identifyModel.yjtime || "--" }}</p>
        </div>
      </div>
      <div v-else class="identify-popup-content">
        <div class="con identify-con">
          <p class="identify-con-label">详细地址：</p>
          <p class="identify-con-value">{{ identifyModel.address || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">地点名称：</p>
          <p class="identify-con-value">{{ identifyModel.poi || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">省级名称：</p>
          <p class="identify-con-value">{{ identifyModel.province || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">市级名称：</p>
          <p class="identify-con-value">{{ identifyModel.city || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">县级名称：</p>
          <p class="identify-con-value">{{ identifyModel.county || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">乡镇名称：</p>
          <p class="identify-con-value">{{ identifyModel.town || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">经度：</p>
          <p class="identify-con-value">{{ identifyModellon || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">纬度：</p>
          <p class="identify-con-value">{{ identifyModellat || "--" }}</p>
        </div>
        <!-- <div class="con identify-con">
          <p class="identify-con-label">详细地址：</p>
          <p class="identify-con-value">{{ identifyModel.name || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">地点名称：</p>
          <p class="identify-con-value">{{ identifyModel.name || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">省级名称：</p>
          <p class="identify-con-value">{{ identifyModel.name || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">市级名称：</p>
          <p class="identify-con-value">{{ identifyModel.name || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">县级名称：</p>
          <p class="identify-con-value">{{ identifyModel.name || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">乡镇名称：</p>
          <p class="identify-con-value">{{ identifyModel.name || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">经度：</p>
          <p class="identify-con-value">{{ identifyModel.lon || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">纬度：</p>
          <p class="identify-con-value">{{ identifyModel.lat || "--" }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label"> {{ identifyModel.jyl ? '降雨量极值' : '格网降雨量'}}</p>
          <p class="identify-con-value">{{ (identifyModel.max ? identifyModel.max : identifyModel.jyl) + 'mm' || "--" }}</p>
        </div>
        <div class="con identify-con identify-operation-con">
        </div> -->
      </div>
    </div>
    <!-- 案例收藏模块 -->
    <!-- 查看案例 -->
    <div class="case-collection-wrapper" v-if="isCaseCollectionSeeShow"
      style="width: 400px;height: 500px;top: 70px;left: 1060px;">
      <div class="case-collection-header">
        <div class="case-collection-title">
          <img src="../../assets/images/rapidAnalysis/mark.png" alt="" class="title-icon" />
          <span>收藏夹</span>
        </div>
        <div>
          <a-icon type="fullscreen" class="case-collection-fullscreen" @click="openCaseListDetails" />
          <a-icon type="close-circle" class="case-collection-close" @click="isCaseCollectionSeeShow = false" />
        </div>
      </div>
      <div class="case-collection-content">
        <div class="case-list-search-box">
          <a-input-search v-model="caseSearchValue" allowClear placeholder="请输入关键词" class="case-search-input"
            @search="getCaseAll" />
          <a-button type="primary" icon="audit" @click="createCase" class="case-search-btn">
            创建案例
          </a-button>
        </div>
        <ul class="case-list-box">
          <li v-for="(item, index) in caseList" :key="index">
            <span class="case-name" :title="item.case_name">{{ item.case_name }}</span>
            <span class="see-case-btn" @click="showCaseDetails(item)">查看</span>
          </li>
        </ul>
      </div>
    </div>
    <!-- 选择案例 -->
    <div class="case-collection-wrapper" style="width: 492px;height: 324px;" v-if="isCaseCollectionSelectShow">
      <div class="case-collection-header">
        <div class="case-collection-title">
          <a-icon type="file-search" class="title-icon" />
          <span>加入收藏</span>
        </div>
        <div>
          <!-- <a-icon type="fullscreen" class="case-collection-fullscreen" /> -->
          <a-icon type="close-circle" class="case-collection-close" @click="isCaseCollectionSelectShow = false" />
        </div>
      </div>
      <div class="case-collection-content">
        <div class="case-collection-item">
          <div class="label-name">
            选择案例：
          </div>
          <a-select :value="caseSelectValue" style="width: 100%;" placeholder="请选择案例" @change="caseSelectChange">
            <a-select-option :value="item.case_id" v-for="(item, index) in caseList" :key="index">
              {{ item.case_name }}
            </a-select-option>
          </a-select>
        </div>
        <div class="case-collection-tips">
          没有找到案例？<span class="case-collection-tips-link" @click="createCase">创建新的案例</span>
        </div>
        <div class="case-collection-btn-box" style="margin-top: 50px;">
          <button class="case-collection-btn case-collection-btn-cancel" @click="isCaseCollectionSelectShow = false">
            取消
          </button>
          <button class="case-collection-btn case-collection-btn-confirm" @click="addCaseToCollection">
            确定
          </button>
        </div>
      </div>
    </div>
    <!-- 案例列表放大 -->
    <div class="case-collection-wrapper-shadow" v-if="isCaseListShow">
      <div class="case-collection-wrapper case-collection-wrapper-center" style="width: 800px;height: 500px;">
        <div class="case-collection-header">
          <div class="case-collection-title">
            <a-icon type="file-search" class="title-icon" />
            <span>收藏夹</span>
          </div>
          <div>
            <a-icon type="close-circle" class="case-collection-close" @click="isCaseListShow = false" />
          </div>
        </div>
        <div class="case-collection-content">
          <div class="case-list-search-box" style="margin-bottom: 20px;">
            <a-input-search v-model="caseSearchValue" allowClear placeholder="请输入关键词" class="case-search-input"
              @search="getCaseAll" />
            <a-button type="primary" icon="audit" @click="createCase" class="case-search-btn">
              创建案例
            </a-button>
          </div>
          <a-table :columns="caseColumns" :data-source="caseList" :pagination="false" :scroll="{ y: 300 }" size="small">
            <span slot="num" slot-scope="text, record, index">
              <span>{{ index + 1 }}</span>
            </span>
            <span slot="action" slot-scope="text, record">
              <a-space>
                <a class="case-table-action case-table-action-view" @click="showCaseDetails(record)">查看</a>
                <a class="case-table-action case-table-action-delete" @click="deleteCase(record, '1')">删除</a>
              </a-space>
            </span>
          </a-table>
        </div>
      </div>
    </div>
    <!-- 查看案例详情收起 -->
    <div class="case-collection-wrapper" style="width: 270px;height: 40px;"
      v-if="isCaseCollectionDetailsShow && isCaseCollectionFullscreen">
      <div class="case-collection-header" style="height: 40px;padding-right: 10px;">
        <div class="case-collection-title">
          <a-icon type="file-search" class="title-icon" />
          <span>查看案例</span>
        </div>
        <div>
          <a-icon type="fullscreen" class="case-collection-fullscreen" @click="showScreenCaseDetails" />
          <a-icon type="close-circle" class="case-collection-close" @click="closeCaseDetails" />
        </div>
      </div>
    </div>
    <!-- 查看案例详情 -->
    <div class="case-collection-wrapper" v-drag-resizable style="width: 530px;height: calc(100vh - 340px);"
      v-if="isCaseCollectionDetailsShow && !isCaseCollectionFullscreen">
      <div class="case-collection-header">
        <div class="case-collection-title">
          <a-icon type="file-search" class="title-icon" />
          <span>{{ isNewCaseMode ? "创建案例" : "案例查看" }}</span>
        </div>
        <div>
          <a-icon type="fullscreen-exit" class="case-collection-fullscreen" @click="hideScreenCaseDetails" />
          <a-icon type="close-circle" class="case-collection-close" @click="closeCaseDetails" />
        </div>
      </div>
      <caseMain :caseId="caseDetailsId" ref="caseMain" @handleSaveCase="handleSaveCase"
        @caseHistoryTaskClick="caseHistoryTaskClick" @seePrint="seePrint"></caseMain>
      <div class="case-collection-btn-box">
        <button class="case-collection-btn case-collection-btn-cancel" @click="closeCaseDetails">
          取消
        </button>
        <button class="case-collection-btn case-collection-btn-confirm" @click="handleSaveCase">
          保存
        </button>
      </div>
    </div>
    <!-- 案例收藏模块 -->
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
  getWarningQueryCode,
  getXzqLevel,
  isCityLevelCountyDrill,
  resolveCityLevelDrillRegionLabel,
  extractCenterGridRainfall,
  XZQ_LEVEL,
  formatAddressFromTianditu,
  normalizeLonLat,
  parseCenterPoint
} from "./warningInfoHelper.js";
import {
  createRegionContext,
  cloneRegionContext,
  resolveDrillRegion,
  resolveRainfallDrillRegion,
  getRainfallDrillCode,
  getQueryCode,
  getWarningCodeFromContext,
  pickMostSpecificRegionCode,
  isMoreSpecificRegionCode,
  promoteToFloodQueryCode,
  resolveFloodBrowseRegion,
  REGION_MODE
} from "./regionContext.js";
const TIANDITU_GEOCODE_TK = "73544acc9abce21e7fd4523c6f077d74";
import {
  gerCaseAll,
  singleCollect,
  saveCase,
  deleteCase,
  saveCase_other
} from "@/api/rapidAnalysis/case.js";
import { TreeSelect } from "ant-design-vue";
const SHOW_PARENT = TreeSelect.SHOW_PARENT;
import Identify from "../../components/identify.vue";
import openLayerList from "../../components/openLayerList.vue";
import Vue from "vue";
import TimeAxis from "../../components/rapidAnalysis/timeAxis.vue";
import geoLocation from "../../components/rapidAnalysis/geoLocation.vue";
import ResourceMenu from "../../components/rapidAnalysis/resourceMenu.vue";
import { myMixin } from "./mixin.js";
import buttonPostion from "../../components/buttonPostion/index.vue";
import caseMain from "../../components/rapidAnalysis/caseMain.vue";
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
import { DISASTER_INDEX_MAP } from "@/domain/region/constants";
import {
  tryGetMapFacade,
  initLegacyMap
} from "@/map";
import { buildShortTermRankParams } from "./modules/shortTermForecast";
import {
  buildLiveRainRankParams,
  buildLivePngParams,
  adaptLiveRainRankItem
} from "./modules/liveRainfall";
import {
  buildFloodRankParams as buildFloodRankParamsFromModule,
  adaptFloodRankItem
} from "./modules/urbanFlood";
import {
  buildFileLayerUrl,
  buildOlPreviewImagePayload,
  pickShortTermTimelineFetcher,
  resolveFloodTimelineDataType
} from "./modules/mapLayers";
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

const caseColumns = [
  {
    title: "序号",
    width: 80,
    align: "center",
    scopedSlots: { customRender: "num" }
  },
  {
    title: "案例名称",
    key: "case_name",
    dataIndex: "case_name"
  },
  {
    title: "灾害过程日期",
    dataIndex: "zhgcrq",
    key: "zhgcrq"
  },
  {
    title: "受灾区域",
    dataIndex: "xzqmc",
    key: "xzqmc",
    ellipsis: true,
    width: 250
  },
  {
    title: "操作",
    key: "action",
    width: 120,
    scopedSlots: { customRender: "action" }
  }
];

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
    Identify,
    buttonPostion,
    openLayerList,
    caseMain,
    RegionStatusPanel,
    OlPreviewMap,
    RankingListPanel,
    WarningInfoPanel,
    StatisticsChartPanel,
    WarningCitySidePanel,
    DetailChartsPanel,
    WarningScrollBanner,
    TimelineResolutionTabs,
    MapLegendPanel
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
      mapTitleName: "未来三小时短临降雨预报图",
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
      caseColumns,
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
     * 获取预警等级配置
     * @param {string} yjlevel - 预警等级
     * @param {boolean} isMapType - 是否为3D地图
     * @param {string} prefix - 类名前缀（如 'SH' 表示山洪）
     * @returns {Object} 包含 className 和 iconUrl 的配置对象
     */
    getWarningLevelConfig(yjlevel, isMapType = false, prefix = '') {
      const configMap = {
        '红色预警': {
          className: `${prefix}hongseyujing-bg`,
          icon3D: '@path:images/hongseyujing.png',
          icon2D: require('@/assets/images/rapidAnalysis/hongseyujing.png')
        },
        '橙色预警': {
          className: `${prefix}chengseyujing-bg`,
          icon3D: '@path:images/chengseyujing.png',
          icon2D: require('@/assets/images/rapidAnalysis/chengseyujing.png')
        },
        '黄色预警': {
          className: `${prefix}huangseyujing-bg`,
          icon3D: '@path:images/huangseyujing.png',
          icon2D: require('@/assets/images/rapidAnalysis/huangseyujing.png')
        },
        '蓝色预警': {
          className: `${prefix}lanseyujing-bg`,
          icon3D: '@path:images/lanseyujing.png',
          icon2D: require('@/assets/images/rapidAnalysis/lanseyujing.png')
        }
      };
      const defaultConfig = configMap['蓝色预警'];
      const config = configMap[yjlevel] || defaultConfig;
      return {
        className: config.className,
        iconUrl: isMapType ? config.icon3D : config.icon2D
      };
    },
    /**
     * 处理预警城市数据并添加到地图
     * @param {Array} list - 预警城市列表
     * @param {string} prefix - 类名前缀（如 'SH' 表示山洪）
     * @param {boolean} shouldAddMarker - 是否添加标记（用于过去三小时数据）
     */
    processWarningCityData(list, prefix = '', shouldAddMarker = true) {
      this.scrollTopList = [];
      if (this.$refs.threeMap && this.isMapType) {
        this.$refs.threeMap.clearMaker();
      }

      // 为每个预警城市设置图标和样式
      list.forEach((item, index) => {
        const config = this.getWarningLevelConfig(item.yjlevel, this.isMapType, prefix);
        item.iconUrl = config.iconUrl;

        // 顶部轮播数组
        this.scrollTopList.push({
          index: index,
          class: config.className,
          name: `${item.shengname}-${item.shiname}`
        });
      });

      // 3D地图：统一添加所有标记（只添加一次）
      if (this.isMapType && this.$refs.threeMap) {
        this.$refs.threeMap.addMaker(list);
      } else if (!this.isMapType && shouldAddMarker) {
        // 2D地图：逐个添加标记
        list.forEach((item) => {
          const obj = {
            name: `${item.shengname}-${item.shiname}`,
            datatime: item.datatime,
            xzqdm: item.xzqdm
          };
          diitgis.addMarker([item.x, item.y], item.iconUrl, obj, 'yjdj');
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
      const { silent = false, skipButtonSync = false, skipBoundary = false, skipStore = false } = options;
      const next = Object.assign({}, this.regionContext, partial);
      this.regionContext = next;
      this.positionXzqCode = getQueryCode(next);

      // 重构：浏览态写入时影子同步到 Region Store，减少双源漂移
      if (!skipStore && next.mode !== REGION_MODE.DRILL) {
        this.syncRegionStoreBrowse(
          next.code && String(next.code).trim() !== "100000"
            ? String(next.code).trim()
            : "",
          next.label || "全国"
        );
      }

      if (!skipButtonSync && this.$refs.buttonPostion) {
        const lock =
          next.mode === REGION_MODE.DRILL && next.lockMinCode
            ? {
                minCode: next.lockMinCode,
                minLevel: next.lockMinLevel
              }
            : null;
        const btnCode = next.code ? String(next.code).trim() : "";
        const btnHasCode = btnCode && btnCode !== "100000";
        let btnLabel = next.label || "";
        if (btnHasCode && !btnLabel) {
          btnLabel = this.resolveRegionButtonLabel(next);
        }
        if (btnHasCode && (!btnLabel || btnLabel === "全国")) {
          btnLabel = this.resolveRegionDisplayLabel(btnCode);
        }
        this.$refs.buttonPostion.applyRegionContext({
          code: btnHasCode ? btnCode : "100000",
          label: btnHasCode ? btnLabel || btnCode : "全国",
          lock,
          silent,
          skipBoundary
        });
      }
    },
    /** 解析工具栏展示名称（下钻后 label 可能为空） */
    resolveRegionButtonLabel(ctx) {
      if (ctx && ctx.label && ctx.label !== "全国") {
        return ctx.label;
      }
      if (
        (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) &&
        ctx &&
        ctx.code
      ) {
        const ref = this.$refs.buttonPostion;
        if (ref && ref.locationName && ref.locationName !== "全国") {
          return ref.locationName;
        }
      }
      const obj = this.tableDirllObj;
      if (obj && typeof obj === "object" && Object.keys(obj).length) {
        if (obj.shengname && !obj.shiname) {
          return obj.shengname;
        }
        if (obj.shiname && obj.shengname) {
          return obj.shengname + obj.shiname;
        }
        if (obj.shiname) {
          return obj.shiname;
        }
        if (obj.name) {
          return obj.name;
        }
      }
      if (this.detailsTitleXzqh) {
        return this.detailsTitleXzqh;
      }
      const ref = this.$refs.buttonPostion;
      if (ref && ref.locationName && ref.locationName !== "全国") {
        return ref.locationName;
      }
      const parts = this.getWarningRegionParts();
      if (parts.regionLabel && parts.regionLabel !== "全国") {
        return parts.regionLabel;
      }
      return "";
    },
    /** 模块切换/同步工具栏时解析展示名称（多源兜底） */
    resolveRegionDisplayLabel(code) {
      const codeStr = code ? String(code).trim() : "";
      if (!codeStr || codeStr === "100000") {
        return "全国";
      }
      const ctx = Object.assign({}, this.regionContext, {
        code: codeStr,
        warningCode: codeStr
      });
      if (ctx.label && ctx.label !== "全国") {
        return ctx.label;
      }
      let label = this.resolveRegionButtonLabel(ctx);
      if (label && label !== "全国") {
        return label;
      }
      const parts = this.getWarningRegionParts();
      if (parts.provinceName && parts.cityName && parts.countyName) {
        return `${parts.provinceName}${parts.cityName}${parts.countyName}`;
      }
      if (parts.provinceName && parts.cityName) {
        return `${parts.provinceName}${parts.cityName}`;
      }
      if (parts.provinceName) {
        return parts.provinceName;
      }
      if (parts.regionLabel && parts.regionLabel !== "全国") {
        return parts.regionLabel;
      }
      if (ctx.label && ctx.label !== "全国") {
        return ctx.label;
      }
      return "";
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
      if (this.regionContext.mode !== REGION_MODE.DRILL) {
        this.regionContext.browseSnapshot = cloneRegionContext(
          Object.assign({}, this.regionContext, {
            mode: REGION_MODE.BROWSE,
            lockMinCode: null,
            lockMinLevel: null,
            browseSnapshot: null
          })
        );
      }
      const drill = resolveRainfallDrillRegion(item);
      const drillCode = drill.code || getRainfallDrillCode(item);
      const drillLabel =
        drill.label ||
        item.shengname ||
        item.shiname ||
        item.xzqmc ||
        item.name ||
        "";
      this.applyRegionContext(
        {
          mode: REGION_MODE.DRILL,
          code: drillCode,
          label: drillLabel,
          lockMinCode: drill.lockMinCode,
          lockMinLevel: drill.lockMinLevel,
          warningCode: drill.warningCode || drillCode
        },
        { silent: true, skipBoundary: true }
      );
      this.positionXzqCode = getQueryCode(this.regionContext) || drillCode;
      this.syncRegionStoreDrill(item);
    },
    /** 退出下钻：恢复进入下钻前的浏览范围 */
    exitDrillRegion() {
      const snap = this.regionContext.browseSnapshot;
      if (snap) {
        const label = this.resolveRegionButtonLabel(snap);
        this.applyRegionContext(
          Object.assign({}, snap, {
            mode: REGION_MODE.BROWSE,
            label: label || snap.label,
            lockMinCode: null,
            lockMinLevel: null,
            browseSnapshot: snap
          }),
          { silent: true }
        );
      } else {
        this.applyRegionContext(
          {
            mode: REGION_MODE.BROWSE,
            lockMinCode: null,
            lockMinLevel: null
          },
          { silent: true }
        );
      }
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
      if (!ref || !ref.locationCode) {
        return "";
      }
      const code = String(ref.locationCode).trim();
      if (!code || code === "100000") {
        return "";
      }
      return code;
    },
    /** 浏览态：双向同步行政区（按钮 ↔ context），修复 code/name 不一致 */
    reconcileRegionFromButton() {
      if (this.regionContext.mode === REGION_MODE.DRILL) {
        return;
      }
      const btnCode = this.getButtonRegionCode();
      const ctxCode = getQueryCode(this.regionContext);
      const posCode = this.positionXzqCode
        ? String(this.positionXzqCode).trim()
        : "";
      const ref = this.$refs.buttonPostion;

      // context 有有效码但按钮仍显示全国：回写按钮
      if (!btnCode) {
        const contextCode = pickMostSpecificRegionCode([ctxCode, posCode]);
        if (contextCode) {
          const label =
            this.resolveRegionDisplayLabel(contextCode) ||
            this.regionContext.label;
          this.applyRegionContext(
            {
              mode: REGION_MODE.BROWSE,
              code: contextCode,
              label: label || contextCode,
              lockMinCode: null,
              lockMinLevel: null,
              warningCode: contextCode,
              browseSnapshot: this.regionContext.browseSnapshot
            },
            { silent: true, skipBoundary: true }
          );
          this.positionXzqCode = contextCode;
        }
        return;
      }

      // 按钮 code 有效但 name 仍为「全国」：强制同步展示名
      const btnShowsNationalMismatch =
        ref &&
        ref.locationCode &&
        String(ref.locationCode) !== "100000" &&
        (!ref.locationName || ref.locationName === "全国");
      if (btnShowsNationalMismatch) {
        const activeCode = pickMostSpecificRegionCode([
          btnCode,
          ctxCode,
          posCode
        ]);
        if (activeCode) {
          const label =
            this.resolveRegionDisplayLabel(activeCode) ||
            this.regionContext.label;
          this.applyRegionContext(
            {
              mode: REGION_MODE.BROWSE,
              code: activeCode,
              label: label || activeCode,
              lockMinCode: null,
              lockMinLevel: null,
              warningCode: activeCode,
              browseSnapshot: this.regionContext.browseSnapshot
            },
            { silent: true, skipBoundary: true }
          );
          this.positionXzqCode = activeCode;
        }
        return;
      }

      const activeCode = pickMostSpecificRegionCode([
        ctxCode,
        posCode,
        btnCode
      ]);
      if (!activeCode) {
        return;
      }
      const btnLabel =
        ref && ref.locationName && ref.locationName !== "全国"
          ? ref.locationName
          : "";
      const needUpdate =
        activeCode !== ctxCode ||
        isMoreSpecificRegionCode(btnCode, ctxCode) ||
        (btnLabel && btnLabel !== this.regionContext.label);
      if (!needUpdate) {
        return;
      }
      const label =
        activeCode === btnCode && btnLabel
          ? btnLabel
          : this.resolveRegionDisplayLabel(activeCode) ||
            this.regionContext.label ||
            btnLabel ||
            activeCode;
      this.applyRegionContext(
        {
          mode: REGION_MODE.BROWSE,
          code: activeCode,
          label,
          lockMinCode: null,
          lockMinLevel: null,
          warningCode: activeCode,
          browseSnapshot: this.regionContext.browseSnapshot
        },
        { skipButtonSync: true }
      );
      this.positionXzqCode = activeCode;
    },
    /** 离开降雨模块前保存浏览态快照（兼容 regionContext 与 positionXzqCode 双轨） */
    saveBrowseSnapshotIfNeeded() {
      if (this.regionContext.mode !== REGION_MODE.BROWSE) {
        return;
      }
      this.reconcileRegionFromButton();
      let code = this.getActiveFloodXzqdm();
      const ref = this.$refs.buttonPostion;
      if (!code || code === "100000") {
        return;
      }
      let label = this.regionContext.label;
      if (
        ref &&
        ref.locationCode &&
        String(ref.locationCode).trim() === String(code) &&
        ref.locationName &&
        ref.locationName !== "全国"
      ) {
        label = ref.locationName;
      } else if (!label || label === "全国") {
        if (ref && ref.locationName && ref.locationName !== "全国") {
          label = ref.locationName;
        } else {
          label = code;
        }
      }
      this.regionContext.browseSnapshot = cloneRegionContext({
        code,
        label,
        mode: REGION_MODE.BROWSE,
        lockMinCode: null,
        lockMinLevel: null,
        warningCode: code,
        browseSnapshot: null
      });
    },
    /** 下钻态切 1/2 前：提升为浏览态，保留 browseSnapshot 供「返回」恢复 */
    promoteDrillRegionBeforeModuleSwitch() {
      if (this.regionContext.mode !== REGION_MODE.DRILL) {
        return false;
      }
      const code = this.getActiveFloodXzqdm();
      if (!code || code === "100000") {
        return false;
      }
      const label = this.resolveRegionButtonLabel(this.regionContext);
      const promoted = {
        mode: REGION_MODE.BROWSE,
        code: this.regionContext.code || code,
        label: label || this.regionContext.label,
        lockMinCode: null,
        lockMinLevel: null,
        warningCode: this.regionContext.warningCode || code,
        browseSnapshot: null
      };
      promoted.browseSnapshot = cloneRegionContext(promoted);
      this.applyRegionContext(promoted, { silent: true, skipBoundary: true });
      this.positionXzqCode = code;
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
        this.resolveRegionDisplayLabel(code) || this.regionContext.label || code;
      this.applyRegionContext(
        {
          mode: REGION_MODE.BROWSE,
          code,
          label,
          lockMinCode: null,
          lockMinLevel: null,
          warningCode: code,
          browseSnapshot: this.regionContext.browseSnapshot
        },
        { silent: true, skipBoundary: true }
      );
      this.positionXzqCode = code;
      return true;
    },
    /** 恢复浏览态行政区，先同步按钮再异步恢复边界 */
    restoreBrowseRegionFromSnapshot() {
      const activeCode = this.getActiveFloodXzqdm();
      const snap = this.regionContext.browseSnapshot;
      const snapCode = snap ? getQueryCode(snap) : "";
      if (activeCode && (!snapCode || activeCode !== snapCode)) {
        return this.applyActiveBrowseRegion();
      }
      if (!snap || !snapCode) {
        return activeCode ? this.applyActiveBrowseRegion() : false;
      }
      const label = this.resolveRegionButtonLabel(snap);
      this.applyRegionContext(
        Object.assign({}, snap, {
          mode: REGION_MODE.BROWSE,
          label: label || snap.label,
          lockMinCode: null,
          lockMinLevel: null,
          browseSnapshot: snap
        }),
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
      const btnCode = this.getButtonRegionCode();
      const fromCtx = getQueryCode(this.regionContext);
      const warningCode = this.regionContext.warningCode
        ? String(this.regionContext.warningCode).trim()
        : "";
      const rawCode = this.regionContext.code
        ? String(this.regionContext.code).trim()
        : "";
      const posCode = this.positionXzqCode
        ? String(this.positionXzqCode).trim()
        : "";
      return pickMostSpecificRegionCode([
        fromCtx,
        warningCode,
        rawCode,
        posCode,
        btnCode
      ]);
    },
    /** 内涝/山洪浏览态接口/地图查询码（县码自动上溯到市） */
    getFloodQueryXzqdm() {
      if (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) {
        // 钻取详情：优先 Store.mapRegion（保留县码）
        if (this.isJsDetailsChart) {
          const mapCode = this.getStoreMapCode();
          if (mapCode) return mapCode;
          return this.getActiveFloodXzqdm();
        }
        // 浏览态：优先 Store.queryCode（市码）
        const storeQuery = this.getStoreQueryCode();
        if (storeQuery) return storeQuery;
      }
      const raw = this.getActiveFloodXzqdm();
      if (!raw) {
        return "";
      }
      if (this.isJsDetailsChart) {
        return raw;
      }
      if (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) {
        return promoteToFloodQueryCode(raw) || raw;
      }
      return raw;
    },
    /** 地图定位用的行政区码：浏览用查询码，钻取用 mapRegion */
    getFloodMapXzqdm() {
      if (
        (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) &&
        this.isJsDetailsChart
      ) {
        return this.getStoreMapCode() || this.getFloodQueryXzqdm();
      }
      return this.getStoreQueryCode() || this.getFloodQueryXzqdm();
    },
    /** 内涝/山洪浏览态：将县选区上溯到市并写入 context */
    applyFloodBrowseRegionPromotion(code, labelHint) {
      const rawCode = code ? String(code).trim() : "";
      if (!rawCode || rawCode === "100000") {
        return null;
      }
      const hint =
        labelHint ||
        this.regionContext.label ||
        this.resolveRegionDisplayLabel(rawCode);
      const resolved = resolveFloodBrowseRegion(rawCode, hint);
      const nextCode = resolved.code || rawCode;
      if (
        nextCode === rawCode &&
        getXzqLevel(rawCode) !== XZQ_LEVEL.COUNTY
      ) {
        return { code: nextCode, label: resolved.label || hint, warningCode: resolved.warningCode || nextCode };
      }
      if (getXzqLevel(rawCode) === XZQ_LEVEL.COUNTY || nextCode !== rawCode) {
        this.applyRegionContext(
          {
            mode: REGION_MODE.BROWSE,
            code: nextCode,
            label: resolved.label || hint || nextCode,
            lockMinCode: null,
            lockMinLevel: null,
            warningCode: resolved.warningCode || nextCode,
            browseSnapshot: this.regionContext.browseSnapshot
          },
          { silent: true, skipBoundary: true }
        );
        this.positionXzqCode = nextCode;
        return resolved;
      }
      return { code: nextCode, label: resolved.label || hint, warningCode: resolved.warningCode || nextCode };
    },
    /** 是否处于右侧表格钻取详情页 */
    isInTableDetailView() {
      return (
        this.isByDetailsChart ||
        this.isSkDetailsChart ||
        this.isJsDetailsChart
      );
    },
    /** 将当前行政区同步到工具栏（模块切换/无数据时兜底） */
    syncActiveRegionToButton() {
      this.reconcileRegionFromButton();
      const code = this.getActiveFloodXzqdm();
      if (!code) {
        return;
      }
      const ref = this.$refs.buttonPostion;
      let label = this.resolveRegionDisplayLabel(code);
      if (
        !label &&
        ref &&
        ref.locationCode &&
        String(ref.locationCode).trim() === String(code) &&
        ref.locationName &&
        ref.locationName !== "全国"
      ) {
        label = ref.locationName;
      }
      if (!label) {
        label = this.regionContext.label;
      }
      if (
        this.isInTableDetailView() &&
        this.regionContext.mode === REGION_MODE.DRILL
      ) {
        const lock = this.regionContext.lockMinCode
          ? {
              minCode: this.regionContext.lockMinCode,
              minLevel: this.regionContext.lockMinLevel
            }
          : null;
        if (ref) {
          ref.applyRegionContext({
            code: String(code),
            label: label || code,
            lock,
            silent: true,
            skipBoundary: true
          });
        }
        this.positionXzqCode = code;
        return;
      }
      this.applyRegionContext(
        {
          mode: REGION_MODE.BROWSE,
          code,
          label: label || code,
          lockMinCode: null,
          lockMinLevel: null,
          warningCode: code,
          browseSnapshot: this.regionContext.browseSnapshot
        },
        { silent: true, skipBoundary: true }
      );
      this.positionXzqCode = code;
    },
    /**
     * 短临/实况县钻取后切内涝/山洪：携带市县级字段供上溯到市
     */
    buildCrossModuleFloodDrill(targetType) {
      if (
        (targetType !== 3 && targetType !== 4) ||
        !(this.isByDetailsChart || this.isSkDetailsChart)
      ) {
        return null;
      }
      const obj = this.tableDirllObj;
      if (!obj || !(obj.xzqdm || obj.xiandm)) {
        return null;
      }
      const countyCode = String(obj.xiandm || obj.xzqdm);
      return {
        xzqdm: countyCode,
        xiandm: countyCode,
        shiid: obj.shiid,
        shiname: obj.shiname,
        shengname: obj.shengname,
        xianname: obj.xianname,
        name:
          obj.name ||
          obj.shengname ||
          (obj.shiname
            ? (obj.shengname || "") + obj.shiname
            : "") ||
          this.detailsTitleXzqh ||
          ""
      };
    },
    /**
     * 降雨下钻切内涝/山洪：县码上溯到市，同步浏览态行政区
     */
    adoptCrossModuleRegionIfNeeded(crossModuleFloodDrill) {
      if (crossModuleFloodDrill && crossModuleFloodDrill.xzqdm) {
        const drill = resolveDrillRegion(crossModuleFloodDrill);
        const code = drill.code || String(crossModuleFloodDrill.xzqdm);
        const label =
          drill.label ||
          crossModuleFloodDrill.name ||
          this.regionContext.label;
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
        return;
      }
      const rawCode = this.getActiveFloodXzqdm();
      if (!rawCode) {
        return;
      }
      this.applyFloodBrowseRegionPromotion(
        rawCode,
        this.regionContext.label || this.resolveRegionDisplayLabel(rawCode)
      );
      this.syncActiveRegionToButton();
    },
    buildPendingFloodRegion(extra = {}) {
      const code = this.getFloodQueryXzqdm();
      if (!code) {
        return null;
      }
      return Object.assign(
        {
          xzqdm: String(code),
          name: this.regionContext.label || ""
        },
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
      if (!list || !list.length) {
        return [];
      }
      if (!xzqdm) {
        return list;
      }
      const region = String(xzqdm).trim();
      return list.filter(name => {
        const code = String(name).split("_")[0];
        if (region.endsWith("0000")) {
          return code.startsWith(region.slice(0, 2));
        }
        if (region.endsWith("00") && region.length === 6) {
          return code === region || code.startsWith(region.slice(0, 4));
        }
        return code === region;
      });
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
      const isFuture =
        (this.disasterTypeIndex === 3 && this.csnlValue == 1) ||
        (this.disasterTypeIndex === 4 && this.shValue == 1);
      const modelType = this.disasterTypeIndex === 3 ? "1" : "2";
      const params = {
        modelType,
        taskTime: this.taskSelectedTime
      };
      if (isFuture) {
        params.type = "DL";
      }
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
      (rawData || []).forEach(item => {
        const adapted = adaptFloodRankItem(item);
        if (adapted) {
          targetList.push(adapted);
        }
      });
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
      if (this.disasterTypeIndex === 3) {
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
    getPositionXzqCode(xzqdm) {
      this.clearRainfallCenterLocate();
      let code =
        xzqdm && String(xzqdm).trim() && String(xzqdm) !== "100000"
          ? String(xzqdm).trim()
          : "";
      const ref = this.$refs.buttonPostion;
      const label =
        ref && ref.locationName ? ref.locationName : code ? code : "全国";

      if (!code) {
        this.navigateToNational({ skipButtonReset: true });
        return;
      }

      if (this.regionContext.mode === REGION_MODE.DRILL) {
        const warningCode =
          this.regionContext.lockMinLevel === "city" &&
          code &&
          getXzqLevel(code) === XZQ_LEVEL.COUNTY
            ? this.regionContext.lockMinCode
            : code;
        this.applyRegionContext(
          {
            code,
            label: code ? label : this.regionContext.label,
            warningCode: warningCode || this.regionContext.warningCode
          },
          { skipButtonSync: true }
        );
      } else {
        let browseCode = code;
        let browseLabel = code ? label : "全国";
        if (
          (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) &&
          !this.isJsDetailsChart
        ) {
          const promoted = resolveFloodBrowseRegion(browseCode, browseLabel);
          browseCode = promoted.code || browseCode;
          browseLabel = promoted.label || browseLabel;
        }
        const browseCtx = {
          code: browseCode,
          label: browseLabel,
          mode: REGION_MODE.BROWSE,
          lockMinCode: null,
          lockMinLevel: null,
          warningCode: browseCode
        };
        browseCtx.browseSnapshot = cloneRegionContext(
          Object.assign({}, browseCtx, { browseSnapshot: null })
        );
        this.applyRegionContext(browseCtx, { skipButtonSync: true });
        code = browseCode;
      }

      this.positionXzqCode = code;
      if (
        (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) &&
        !this.isJsDetailsChart &&
        getXzqLevel(
          xzqdm && String(xzqdm).trim() !== "100000"
            ? String(xzqdm).trim()
            : ""
        ) === XZQ_LEVEL.COUNTY
      ) {
        this.syncActiveRegionToButton();
      }
      // 重构：浏览态同步到 region Store（钻取态不覆盖 browse）
      if (
        this.regionContext.mode !== REGION_MODE.DRILL &&
        !this.isInTableDetailView()
      ) {
        const browseLabel =
          (this.regionContext && this.regionContext.label) || label || "全国";
        this.syncRegionStoreBrowse(code, browseLabel);
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
      this.removeBufferLayer(["xzq", "bufferGeoJsonLayers", "hightLayer"]);
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
      this.pendingCrossModuleFloodDrill = null;
      this.floodCrossDrillNoData = false;
      this.timeTabActive = 2;
      this.isInitTableChart = true;
      this.isByDetailsChart = false;
      this.isSkDetailsChart = false;
      this.isJsDetailsChart = false;
      this.clearTableDetailViewLayers();
      this.tableDirllObj = {};
      this.detailsTitleXzqh = "";
      if (
        !skipDrillExit &&
        (this.disasterTypeIndex === 1 || this.disasterTypeIndex === 2)
      ) {
        this.exitDrillRegion();
      } else if (
        !skipDrillExit &&
        (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4)
      ) {
        // 内涝/山洪旧逻辑未走 exitDrillRegion，重构 Store 单独退出钻取
        this.syncRegionStoreExitDrill();
      }
      return true;
    },
    /** 行政区切换后刷新当前模块浏览数据 */
    refreshBrowseDataAfterRegionChange() {
      if (this.disasterTypeIndex === 1) {
        this.getJsData();
      } else if (this.disasterTypeIndex === 2) {
        this.getSkJsData();
      } else if (
        (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) &&
        !this.isJsDetailsChart
      ) {
        this.floodCrossDrillNoData = false;
        this.pendingCrossModuleFloodDrill = this.buildPendingFloodRegion();
        this.refreshCurrentFloodModuleData();
      }
      this.fetchCurrentModuleWarningInfo();
    },
    /** 退出钻取详情后恢复列表/图表 */
    refreshListAfterExitDetail() {
      const restoredCode = getQueryCode(this.regionContext);
      if (!restoredCode) {
        this.goNationalViewViaFacade();
      }
      if (
        restoredCode &&
        (this.disasterTypeIndex === 1 || this.disasterTypeIndex === 2)
      ) {
        this.restoreActiveRegionBoundary();
      }
      if (this.disasterTypeIndex === 1) {
        this.fetchRainfallWarningInfo();
        this.getByyjcsData();
        this.getJsData();
        this.initChart(this.wlsxsjyRainRankList);
      } else if (this.disasterTypeIndex === 2) {
        this.showMaker(false, "skjyXz");
        this.initChart(this.skjsRainRankList);
      } else if (this.disasterTypeIndex === 3) {
        this.tabDisasterType(3);
      } else if (this.disasterTypeIndex === 4) {
        this.tabDisasterType(4);
      }
    },
    /** 回到全国并同步地图、预警、右侧列表 */
    navigateToNational(options = {}) {
      const { skipButtonReset = false } = options;
      this.exitTableDetailView();
      if (this.regionContext.mode === REGION_MODE.DRILL) {
        this.exitDrillRegion();
      }
      this.applyRegionContext(
        {
          code: "",
          label: "全国",
          mode: REGION_MODE.BROWSE,
          lockMinCode: null,
          lockMinLevel: null,
          warningCode: "",
          browseSnapshot: null
        },
        { silent: true, skipButtonSync: skipButtonReset }
      );
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
      const step = payload.step || "toNational";
      if (step === "countyToCity") {
        this.getPositionXzqCode(payload.code);
        return;
      }
      if (step === "exitLock") {
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
      if (step === "toNational") {
        if (this.$refs.buttonPostion) {
          this.$refs.buttonPostion.resetToNational({ silent: true });
        }
        this.navigateToNational({ skipButtonReset: true });
      }
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
      // 重构：非详情钻取时优先 Store.displayRegion
      if (!isDrill) {
        try {
          const display = this.$store.getters["region/displayRegion"];
          if (display) {
            if (!display.code) {
              return "全国";
            }
            if (display.name && display.name !== "全国") {
              return display.name;
            }
          }
        } catch (e) {
          /* ignore */
        }
      }
      const ctx = this.regionContext;
      const warningCode = getWarningCodeFromContext(ctx);
      const queryCode = getWarningQueryCode({
        positionXzqCode: warningCode || this.positionXzqCode,
        tableDirllObj: this.tableDirllObj,
        isByDetailsChart: this.isByDetailsChart,
        isSkDetailsChart: this.isSkDetailsChart,
        isJsDetailsChart: this.isJsDetailsChart
      });
      if (!isDrill && !queryCode) {
        return "全国";
      }

      if (ctx && ctx.label && ctx.label !== "全国") {
        if (ctx.mode === REGION_MODE.DRILL) {
          return ctx.label;
        }
        if (getQueryCode(ctx)) {
          return ctx.label;
        }
      }

      const parts = this.getWarningRegionParts();
      const posCode = warningCode || this.positionXzqCode
        ? String(warningCode || this.positionXzqCode).trim()
        : "";

      // 市级视图下钻区县排行：括号内仍展示市一级（如「广西壮族自治区桂林市」）
      if (
        isDrill &&
        isCityLevelCountyDrill(posCode, this.tableDirllObj, {
          isByDetailsChart: this.isByDetailsChart,
          isSkDetailsChart: this.isSkDetailsChart
        })
      ) {
        const cityLabel = resolveCityLevelDrillRegionLabel(
          parts,
          this.tableDirllObj
        );
        if (cityLabel) return cityLabel;
      }

      if (parts.provinceName && parts.cityName && parts.countyName) {
        return `${parts.provinceName}${parts.cityName}${parts.countyName}`;
      }
      if (parts.provinceName && parts.cityName) {
        return `${parts.provinceName}${parts.cityName}`;
      }
      if (parts.provinceName && !parts.cityName) {
        return parts.provinceName;
      }

      if (isDrill && this.tableDirllObj && this.tableDirllObj.name) {
        if (getXzqLevel(queryCode) === XZQ_LEVEL.COUNTY) {
          return this.tableDirllObj.name;
        }
      }

      if (!posCode || posCode === "100000") {
        return "全国";
      }
      if (ctx && ctx.label) {
        return ctx.label;
      }
      const ref = this.$refs.buttonPostion;
      if (ref && ref.locationName && ref.locationName !== "全国") {
        return ref.locationName;
      }
      return parts.regionLabel || "全国";
    },
    getWarningRegionParts() {
      const ref = this.$refs.buttonPostion;
      const ctx = this.regionContext;
      const ctxCode = getQueryCode(ctx);
      const ctxLabel =
        ctx && ctx.label && ctx.label !== "全国" ? ctx.label : "";

      if (!ref || !ref.selected) {
        return {
          provinceName: "",
          cityName: "",
          countyName: "",
          regionLabel: ctxLabel || "全国"
        };
      }
      if (!ref.locationCode || String(ref.locationCode) === "100000") {
        return {
          provinceName: "",
          cityName: "",
          countyName: "",
          regionLabel: ctxLabel || "全国"
        };
      }
      if (
        ctxCode &&
        ctxLabel &&
        (!ref.locationName || ref.locationName === "全国")
      ) {
        return {
          provinceName: "",
          cityName: "",
          countyName: "",
          regionLabel: ctxLabel
        };
      }
      const provinceName =
        (ref.selected.province && ref.selected.province.name) || "";
      const cityName = (ref.selected.city && ref.selected.city.xzqmc) || "";
      const countyName = (ref.selected.county && ref.selected.county.xzqmc) || "";
      let regionLabel = ref.locationName || "全国";
      if (provinceName && cityName && countyName) {
        regionLabel = `${provinceName}${cityName}${countyName}`;
      } else if (provinceName && cityName) {
        regionLabel = `${provinceName}${cityName}`;
      } else if (provinceName) {
        regionLabel = provinceName;
      }
      return {
        provinceName,
        cityName,
        countyName,
        regionLabel
      };
    },
    enrichWarningPointAddress(warningInfo) {
      if (!warningInfo || !warningInfo.sections) return;
      const that = this;
      const targets = warningInfo.sections.filter(function(s) {
        return (
          s.centerPoint &&
          (s.centerInline || s.floodPoint) &&
          !s.centerLineHtml &&
          (s.addressLoading || !s.address)
        );
      });
      targets.forEach(function(sec) {
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
      const url =
        'https://api.tianditu.gov.cn/geocoder?postStr={"lon":' +
        lon +
        ',"lat":' +
        lat +
        ',"ver":1}&type=geocode&tk=' +
        TIANDITU_GEOCODE_TK;
      return fetch(url)
        .then(res => res.json())
        .then(res => {
          if (res.status === "0" && res.result) {
            const ac = res.result.addressComponent;
            const addr =
              formatAddressFromTianditu(ac) ||
              (res.result.formatted_address || "");
            return addr;
          }
          return "";
        });
    },
    fetchTiandituGeocodeResult(lon, lat) {
      const url =
        'https://api.tianditu.gov.cn/geocoder?postStr={"lon":' +
        lon +
        ',"lat":' +
        lat +
        ',"ver":1}&type=geocode&tk=' +
        TIANDITU_GEOCODE_TK;
      return fetch(url)
        .then(res => res.json())
        .then(res => {
          if (res.status === "0" && res.result) {
            return res.result;
          }
          return null;
        })
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
      let code = getWarningQueryCode({
        positionXzqCode: warningCode || this.positionXzqCode,
        tableDirllObj: this.tableDirllObj,
        isByDetailsChart: this.isByDetailsChart,
        isSkDetailsChart: this.isSkDetailsChart,
        isJsDetailsChart: this.isJsDetailsChart
      });
      if (
        (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) &&
        !this.isJsDetailsChart &&
        code
      ) {
        code = promoteToFloodQueryCode(code) || code;
      }
      // 短临/实况：优先 Store 查询码（与排行列表一致）
      if (
        (this.disasterTypeIndex === 1 || this.disasterTypeIndex === 2) &&
        !this.isByDetailsChart &&
        !this.isSkDetailsChart
      ) {
        const storeQuery = this.getStoreQueryCode();
        if (storeQuery) {
          code = storeQuery;
        }
      }
      // 内涝/山洪：浏览态用 Store.queryCode；钻取详情预警仍按策略用市码
      if (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) {
        const storeWarning = this.$store.getters["region/warningCode"];
        const storeQuery = this.getStoreQueryCode();
        if (this.isJsDetailsChart) {
          code = storeWarning || storeQuery || code;
        } else if (storeQuery) {
          code = storeQuery;
        }
      }
      const regionLabel = this.getWarningRegionLabel();
      const params = { taskTime: this.taskSelectedTime };
      if (code) {
        params.code = code;
      }
      return { code, regionLabel, params };
    },
    beginWarningInfoRequest() {
      const requestId = ++this.warningInfoRequestId;
      this.warningInfoLoading = true;
      return requestId;
    },
    isWarningInfoRequestStale(requestId) {
      return requestId !== this.warningInfoRequestId;
    },
    finishWarningInfoRequest(requestId) {
      if (!this.isWarningInfoRequestStale(requestId)) {
        this.warningInfoLoading = false;
      }
    },
    fetchRainfallWarningInfo() {
      if (this.disasterTypeIndex !== 1 && this.disasterTypeIndex !== 2) {
        return;
      }
      const requestId = this.beginWarningInfoRequest();
      const { code, regionLabel, params } = this.getWarningQueryParams();
      this.rainfallWarningInfo = getEmptyRainfallWarningInfo(regionLabel, code, {
        regionLabel,
        taskTime: this.taskSelectedTime
      });
      if (!this.taskSelectedTime) {
        this.finishWarningInfoRequest(requestId);
        return;
      }
      const regionParts = this.getWarningRegionParts();
      queryRainfallRange(params)
        .then(res => {
          if (this.isWarningInfoRequestStale(requestId)) {
            return;
          }
          if (res.code === 200 && res.data) {
            this.rainfallWarningRawData = res.data;
            this.rainfallWarningInfo = buildRainfallWarningInfo(res.data, code, {
              regionLabel,
              taskTime: this.taskSelectedTime,
              provinceName: regionParts.provinceName,
              cityName: regionParts.cityName,
              countyName: regionParts.countyName
            });
            this.enrichWarningPointAddress(this.rainfallWarningInfo);
          } else {
            this.rainfallWarningRawData = null;
            this.rainfallWarningInfo = getEmptyRainfallWarningInfo(regionLabel, code, {
              regionLabel,
              taskTime: this.taskSelectedTime
            });
          }
        })
        .catch(() => {
          if (this.isWarningInfoRequestStale(requestId)) {
            return;
          }
          this.rainfallWarningRawData = null;
          this.rainfallWarningInfo = getEmptyRainfallWarningInfo(regionLabel, code, {
            regionLabel,
            taskTime: this.taskSelectedTime
          });
        })
        .finally(() => {
          this.finishWarningInfoRequest(requestId);
        });
    },
    fetchCsnlWarningInfo() {
      if (this.disasterTypeIndex !== 3) {
        return;
      }
      const requestId = this.beginWarningInfoRequest();
      const { code, regionLabel, params } = this.getWarningQueryParams();
      const opts = { regionLabel, taskTime: this.taskSelectedTime };
      this.csnlWarningInfo = getEmptyCsnlWarningInfo(regionLabel, code, opts);
      if (!this.taskSelectedTime) {
        this.finishWarningInfoRequest(requestId);
        return;
      }
      const regionParts = this.getWarningRegionParts();
      const floodOpts = {
        regionLabel,
        taskTime: this.taskSelectedTime,
        provinceName: regionParts.provinceName,
        cityName: regionParts.cityName,
        countyName: regionParts.countyName
      };
      queryFloodRangeCsnl(params)
        .then(res => {
          if (this.isWarningInfoRequestStale(requestId)) {
            return;
          }
          if (res.code === 200 && res.data) {
            this.csnlWarningRawData = res.data;
            this.csnlWarningInfo = buildCsnlWarningInfo(res.data, code, floodOpts);
            this.enrichWarningPointAddress(this.csnlWarningInfo);
          } else {
            this.csnlWarningRawData = null;
            this.csnlWarningInfo = getEmptyCsnlWarningInfo(regionLabel, code, floodOpts);
          }
        })
        .catch(() => {
          if (this.isWarningInfoRequestStale(requestId)) {
            return;
          }
          this.csnlWarningRawData = null;
          this.csnlWarningInfo = getEmptyCsnlWarningInfo(regionLabel, code, floodOpts);
        })
        .finally(() => {
          this.finishWarningInfoRequest(requestId);
        });
    },
    fetchShWarningInfo() {
      if (this.disasterTypeIndex !== 4) {
        return;
      }
      const requestId = this.beginWarningInfoRequest();
      const { code, regionLabel, params } = this.getWarningQueryParams();
      const regionParts = this.getWarningRegionParts();
      const floodOpts = {
        regionLabel,
        taskTime: this.taskSelectedTime,
        provinceName: regionParts.provinceName,
        cityName: regionParts.cityName,
        countyName: regionParts.countyName
      };
      this.shWarningInfo = getEmptyShWarningInfo(regionLabel, code, floodOpts);
      if (!this.taskSelectedTime) {
        this.finishWarningInfoRequest(requestId);
        return;
      }
      queryFloodRangeSh(params)
        .then(res => {
          if (this.isWarningInfoRequestStale(requestId)) {
            return;
          }
          if (res.code === 200 && res.data) {
            this.shWarningRawData = res.data;
            this.shWarningInfo = buildShWarningInfo(res.data, code, floodOpts);
            this.enrichWarningPointAddress(this.shWarningInfo);
          } else {
            this.shWarningRawData = null;
            this.shWarningInfo = getEmptyShWarningInfo(regionLabel, code, floodOpts);
          }
        })
        .catch(() => {
          if (this.isWarningInfoRequestStale(requestId)) {
            return;
          }
          this.shWarningRawData = null;
          this.shWarningInfo = getEmptyShWarningInfo(regionLabel, code, floodOpts);
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

        if (
          that.$refs.identifyDom.searchType == 1 &&
          that.$refs.identifyDom.isstartPickPoint
        ) {
          that.$refs.identifyDom.getJwData(evt);
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
        if (this.disasterTypeIndex == 3) {
          if (this.isJsDetailsChart && this.tableDirllObj) {
            this.openDetailsChart(this.tableDirllObj);
          } else {
            if (this.csnlValue == 1) {
              this.getTaskList(2);
            } else {
              this.getTaskList(4);
            }
          }
        } else {
          if (this.isJsDetailsChart && this.tableDirllObj) {
            this.openDetailsChart(this.tableDirllObj);
          } else {
            if (this.csnlValue == 1) {
              this.getTaskList(5);
            } else {
              this.getTaskList(6);
            }
          }
        }
      } else {
        if (this.disasterTypeIndex == 3) {
          if (this.isJsDetailsChart && this.tableDirllObj) {
            this.openDetailsChart(this.tableDirllObj);
          } else {
            if (this.csnlValue == 1) {
              this.getTaskList(2);
            } else {
              this.getTaskList(4);
            }
          }
        } else {
          if (this.isJsDetailsChart && this.tableDirllObj) {
            this.openDetailsChart(this.tableDirllObj);
          } else {
            if (this.csnlValue == 1) {
              this.getTaskList(5);
            } else {
              this.getTaskList(6);
            }
          }
        }
      }
    },
    normalizeUpladeLineFeatures(res) {
      if (!res) return [];
      if (res.type === "FeatureCollection" && Array.isArray(res.features)) {
        return res.features;
      }
      if (res.type === "Feature") {
        return [res];
      }
      if (res.type && res.coordinates) {
        return [
          {
            type: "Feature",
            properties: {},
            geometry: res
          }
        ];
      }
      return [];
    },
    clearAdminRegionMapDisplay() {
      this.clearRainfallCenterLocate();
      this.clearAdminRegionBoundaries();
      this.goNationalViewViaFacade();
    },
    /** 仅清除行政区边界图层（不改变视野） */
    clearAdminRegionBoundaries() {
      this.removeBufferLayer(["xzq", "bufferGeoJsonLayers", "hightLayer"]);
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
      const style = {
        lineColor: "#FFA000",
        lineWidth: 5,
        fillColor: "rgba(255,255,255,0)"
      };
      // 重构：优先经 MapFacade 叠加橙色行政区轮廓
      const facade = tryGetMapFacade();
      if (facade && facade.adapter && typeof facade.adapter.addAdminOutline === "function") {
        const ok = facade.adapter.addAdminOutline(features, {
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
            color: "#FFA000",
            width: 5
          }),
          fill: new ol.style.Fill({
            color: "rgba(255,255,255,0)"
          })
        })
      });
      this.removeBufferLayer(["xzq"]);
      this.earthMap.map.addLayer(vectorLayer);
      const extent = vectorLayer.getSource().getExtent();
      this.earthMap.map.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 1000
      });
    },
    removeBufferLayer(idArray = []) {
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
      const region = code ? String(code).trim() : "";
      if (!region || region === "100000") {
        return "";
      }
      if (region.endsWith("0000")) {
        return "省";
      }
      if (region.endsWith("00")) {
        return "市";
      }
      return "县";
    },
    _applySearchXzqfwBoundary(data, options = {}) {
      if (!data) {
        return false;
      }
      const style = Object.assign(
        {
          lineColor: "#FF0000",
          lineWidth: 2,
          fillColor: "rgba(255,255,255,0)"
        },
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
      if (!targetLayer || !me || !me.earth) {
        return;
      }
      try {
        me.earth.addLayer(targetLayer);
      } catch (e) {
        /* 图层可能已在地图上 */
      }
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
            const isPast =
              (this.disasterTypeIndex === 3 && this.csnlValue === 2) ||
              (this.disasterTypeIndex === 4 && this.shValue === 2);
            const filename = obj.filename[0];
            const layerKey = `${obj.time}_${filename}_${this.tableDirllObj.xzqdm || ''}`;
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
              me.earth.addLayer(targetLayer);

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
      if (list.length - 1 >= index) {
        const mapImgUrl = buildFileLayerUrl(
          this.baseUrl,
          list[index].filename
        );
        const layerKey = list[index].filename; // 或 obj.filename，确保唯一性
        let targetLayer = this.layerCache.get(layerKey);

        // 如果该图层还没创建过，则创建并缓存
        if (!targetLayer) {
          console.log(`🔁 创建新图层，时间点：${layerKey}`);

          targetLayer = me.earth.layerManager.createLayer(
            "降雨数据叠加",
            8,
            mapImgUrl,
            {
              visible: false, // 先不可见
              opacity: 0.5,
              name: "降雨数据叠加",
              projection: 4326,
              imageExtent: this.imageExtent
            }
          );
          me.earth.addLayer(targetLayer);
          // 监听图片加载完成事件（可选，可用于调试或后续功能）
          const olLayer = targetLayer.getLayer(); // 获取 OpenLayers 图层
          const source = olLayer.getSource();

          if (source && source.on) {
            source.on("imageloadend", () => {
              console.log(`✅ 图层加载完成: ${layerKey}`);
              // 如果当前正要显示该图层，则设为 visible
              if (this.updateDateTimeCurrentVisibleLayerKey === layerKey) {
                olLayer.setVisible(true);
                const i = index + 1;
                this.cacheLayers(list, i);
              }
            });
          }
          // 缓存该图层
          this.layerCache.set(layerKey, targetLayer);
        } else {
          this.ensureRainfallLayerOnMap(targetLayer);
        }

        if (
          this.updateDateTimeCurrentVisibleLayerKey &&
          this.updateDateTimeCurrentVisibleLayerKey !== layerKey
        ) {
          const oldLayer = this.layerCache.get(this.updateDateTimeCurrentVisibleLayerKey);
          if (oldLayer) {
            const olLayer = oldLayer.getLayer();
            olLayer.setVisible(false); // 隐藏旧图层
          }
        }

        // 显示当前目标图层
        const olLayer = targetLayer.getLayer();
        olLayer.setVisible(true); // 确保显示
        olLayer.setOpacity(0.5); // 设置透明度
        this.updateDateTimeCurrentVisibleLayerKey = layerKey; // 更新当前显示的 key
        // 重构：短临当前帧同步 OL 预览栅格
        this.syncOlPreviewImageLayer(mapImgUrl, this.imageExtent);
      }
    },
    cacheLayers2(list, index = 1) {
      if (list.length - 1 >= index) {
        const mapImgUrl = buildFileLayerUrl(
          this.baseUrl,
          list[index].filename
        );
        const layerKey = list[index].filename; // 或 obj.filename，确保唯一性
        let targetLayer = this.layerCache.get(layerKey);

        // 如果该图层还没创建过，则创建并缓存
        if (!targetLayer) {
          console.log(`🔁 创建新图层，时间点：${layerKey}`);

          targetLayer = me.earth.layerManager.createLayer(
            "降雨数据叠加",
            8,
            mapImgUrl,
            {
              visible: false, // 先不可见
              opacity: 0.5,
              name: "降雨数据叠加",
              projection: 4326,
              imageExtent: this.imageExtent
            }
          );
          me.earth.addLayer(targetLayer);
          // 监听图片加载完成事件（可选，可用于调试或后续功能）
          const olLayer = targetLayer.getLayer(); // 获取 OpenLayers 图层
          const source = olLayer.getSource();

          if (source && source.on) {
            source.on("imageloadend", () => {
              console.log(`✅ 图层加载完成: ${layerKey}`);
              // 如果当前正要显示该图层，则设为 visible
              olLayer.setVisible(false);
              // olLayer.setOpacity(0.5);
              const i = index + 1;
              this.cacheLayers2(list, i);
            });
          }
          // 缓存该图层
          this.layerCache.set(layerKey, targetLayer);
        } else {
          this.ensureRainfallLayerOnMap(targetLayer);
        }

        const oldLayer = this.layerCache.get(this.currentVisibleLayerKey);
        if (oldLayer) {
          const olLayer = oldLayer.getLayer();
          olLayer.setVisible(false); // 隐藏旧图层
          // olLayer.setOpacity(0);
        }

        // 显示当前目标图层
        const olLayer = targetLayer.getLayer();
        olLayer.setVisible(true); // 确保显示
        olLayer.setOpacity(0); // 设置透明度
        this.currentVisibleLayerKey = layerKey; // 更新当前显示的 key
      }
    },
    /** 切回短临预报时重新加载降雨时间轴与图层 */
    reloadShortTermRainfallLayers() {
      if (this.disasterTypeIndex !== 1 || this.isMapType || !this.taskSelectedTime) {
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
      if (!list || list.length === 0 || index >= list.length) {
        if (index === 0) {
          console.log('⚠️ 预加载失败：时间轴数据为空或无效');
        }
        return;
      }

      const dateArray = this.taskSelectedTime.split(/[- :]/);
      const obj = list[index];
      const isPast =
        (this.disasterTypeIndex === 3 && this.csnlValue === 2) ||
        (this.disasterTypeIndex === 4 && this.shValue === 2);

      // 为每个filename创建图层
      if (obj.filename && Array.isArray(obj.filename) && obj.filename.length > 0) {
        const filename = obj.filename[0];
        const mapImgUrl = this._buildLayerImageUrl(dateArray, obj, filename, isPast);
        const layerKey = `${obj.time}_${filename}_${this.tableDirllObj.xzqdm || ''}`;

        let targetLayer = this.layerCache.get(layerKey);

        if (index === 0) {
          console.log(`🔵 开始预加载第 ${index + 1}/${list.length} 个图层，时间: ${obj.time}`);
        }

        // 如果该图层还没创建过，则创建并缓存
        if (!targetLayer) {
          console.log(`🔁 预加载钻取图层，时间点：${obj.time}, filename: ${filename}`);

          // 先获取图层的extent
          const config = this._getLayerConfig(filename);
          config.apiMethod({
            taskTime: this.taskSelectedTime,
            type: config.timeType,
            xzqdm: config.xzqdm || ""
          }).then(res => {
            if (res.code === 200) {
              const imageExtent = res.data.split(",").map(Number);

              targetLayer = me.earth.layerManager.createLayer(
                "积水深度图" + mapImgUrl,
                8,
                mapImgUrl,
                {
                  visible: true, // 先不可见
                  opacity: 0.5,
                  name: "积水深度图",
                  projection: 4326,
                  imageExtent: imageExtent
                }
              );
              me.earth.addLayer(targetLayer);

              // 监听图片加载完成事件
              const olLayer = targetLayer.getLayer();
              const source = olLayer.getSource();

              if (source && source.on) {
                source.on("imageloadend", () => {
                  console.log(`✅ 钻取图层加载完成: ${layerKey}`);
                  olLayer.setVisible(false);
                  // 继续预加载下一个时间点
                  const nextIndex = index + 1;
                  if (nextIndex < list.length) {
                    this.cacheDrillLayers(list, nextIndex);
                  }
                });
              }

              // 缓存该图层
              this.layerCache.set(layerKey, targetLayer);

              // 如果没有imageloadend事件，直接继续下一个
              if (!source || !source.on) {
                const nextIndex = index + 1;
                if (nextIndex < list.length) {
                  this.cacheDrillLayers(list, nextIndex);
                }
              }
            } else {
              // 如果获取extent失败，继续下一个
              const nextIndex = index + 1;
              if (nextIndex < list.length) {
                this.cacheDrillLayers(list, nextIndex);
              }
            }
          }).catch(err => {
            console.error('预加载图层失败:', err);
            // 继续下一个
            const nextIndex = index + 1;
            if (nextIndex < list.length) {
              this.cacheDrillLayers(list, nextIndex);
            }
          });
        } else {
          // 图层已存在，继续下一个
          const nextIndex = index + 1;
          if (nextIndex < list.length) {
            this.cacheDrillLayers(list, nextIndex);
          }
        }
      } else {
        // 没有filename，继续下一个
        const nextIndex = index + 1;
        if (nextIndex < list.length) {
          this.cacheDrillLayers(list, nextIndex);
        }
      }
    },
    /**
     * 获取图层配置信息
     * @param {string} filename - 文件名
     * @returns {Object} 配置对象
     */
    _getLayerConfig(filename, obj) {
      const isPast =
        (this.disasterTypeIndex === 3 && this.csnlValue === 2) ||
        (this.disasterTypeIndex === 4 && this.shValue === 2);

      const apiMethod = isPast ? getSKLSSJZZB : getDljySJZZB;
      let timeType = resolveFloodTimelineDataType(this.timeTabActive);
      if (obj && obj.submergedExtreme) {
        timeType = obj.isFuture ? "DL" : "SK";
      }

      let xzqdm = "";
      if (!this.isMapType) {
        xzqdm = filename.split("_")[0];
      }

      // 城市内涝过去三小时：如果 xzqdm 为空，使用空字符串；其他情况直接使用 xzqdm
      const finalXzqdm = this.isJsDetailsChart
        ? this.tableDirllObj.xzqdm
        : (this.disasterTypeIndex === 3 && this.csnlValue === 2 ? (xzqdm || "") : xzqdm);

      return {
        apiMethod,
        isPast,
        timeType,
        xzqdm: finalXzqdm
      };
    },

    /**
     * 极值图（JZT 接口）图片地址
     * 例：.../projectServerTask/2026/202607/20260709/flood_output/2026070909_DL/post/130900_maxdepth.png
     */
    _buildSubmergedExtremeImageUrl(dateArray, obj, filename) {
      const timeArray = (obj.time || this.taskSelectedTime).split(/[- :]/);
      const timeFolder = `${timeArray[0]}${timeArray[1]}${timeArray[2]}${timeArray[3]}`;
      const typeSuffix = obj.isFuture ? "DL" : "SK";
      const base = `${this.baseUrl}file/projectServerTask/`;
      if (this.disasterTypeIndex === 4 && !obj.isFuture) {
        return (
          `${base}${dateArray[0]}/${dateArray[0]}${dateArray[1]}/` +
          `${dateArray[0]}${dateArray[1]}${dateArray[2]}_skls_yhsk/flood_output/` +
          `${dateArray[0]}${dateArray[1]}${dateArray[2]}${dateArray[3]}_skls_yhsk_SK/post/${filename}`
        );
      }
      return (
        `${base}${dateArray[0]}/${dateArray[0]}${dateArray[1]}/` +
        `${dateArray[0]}${dateArray[1]}${dateArray[2]}/flood_output/` +
        `${timeFolder}_${typeSuffix}/post/${filename}`
      );
    },

    /**
     * 构建图层图片URL
     * @param {Array} dateArray - 日期数组
     * @param {Object} obj - 时间对象
     * @param {string} filename - 文件名
     * @param {boolean} isPast - 是否为过去三小时
     * @returns {string} 图片URL
     */
    _buildLayerImageUrl(dateArray, obj, filename, isPast) {
      if (obj && obj.submergedExtreme) {
        return this._buildSubmergedExtremeImageUrl(dateArray, obj, filename);
      }
      if (isPast) {
        // 过去三小时：使用 dateArray 构建路径（山洪）或 timeArray（城市内涝）
        if (this.disasterTypeIndex === 4 && this.shValue === 2) {
          // 山洪过去三小时：使用 dateArray
          return `${this.baseUrl}file/projectServerTask/${dateArray[0]}/${dateArray[0]}${dateArray[1]}/${dateArray[0]}${dateArray[1]}${dateArray[2]}_skls_yhsk/flood_output/${dateArray[0]}${dateArray[1]}${dateArray[2]}${dateArray[3]}_skls_yhsk_SK/depth2png/${filename}`;
        } else {
          // 城市内涝过去三小时：使用 timeArray
          const timeArray = obj.time.split(/[- :]/);
          return `${this.baseUrl}file/projectServerTask/${dateArray[0]}/${dateArray[0]}${dateArray[1]}/${dateArray[0]}${dateArray[1]}${dateArray[2]}_skls_yhsk/flood_output/${timeArray[0]}${timeArray[1]}${timeArray[2]}${timeArray[3]}_skls_yhsk_SK/depth2png/${filename}`;
        }
      } else {
        // 未来三小时
        const timeArray = obj.time.split(/[- :]/);
        const timeType = resolveFloodTimelineDataType(this.timeTabActive);
        return `${this.baseUrl}file/projectServerTask/${dateArray[0]}/${dateArray[0]}${dateArray[1]}/${dateArray[0]}${dateArray[1]}${dateArray[2]}/flood_output/${timeArray[0]}${timeArray[1]}${timeArray[2]}${timeArray[3]}_${timeType}/depth2png/${filename}`;
      }
    },

    _getMapImageProjection() {
      try {
        const view =
          me.earth && me.earth.map && me.earth.map.getView && me.earth.map.getView();
        const code =
          view && view.getProjection && view.getProjection().getCode();
        if (code) {
          return code;
        }
      } catch (e) {
        /* ignore */
      }
      return "EPSG:4490";
    },
    _clearFloodSubmergedMapLayers() {
      if (!this.floodSubmergedOlLayers || !this.floodSubmergedOlLayers.length) {
        return;
      }
      this.floodSubmergedOlLayers.forEach(layer => {
        try {
          me.earth.removeLayer(layer);
        } catch (e) {
          try {
            const map = me.earth && me.earth.map;
            const olLayer = layer && layer.getLayer && layer.getLayer();
            if (map && olLayer) {
              map.removeLayer(olLayer);
            }
          } catch (err) {
            /* ignore */
          }
        }
      });
      this.floodSubmergedOlLayers = [];
    },
    _isFloodSubmergedRequestStale(obj) {
      return (
        obj &&
        obj.submergedExtreme &&
        obj.submergedRequestId !== undefined &&
        obj.submergedRequestId !== this.floodSubmergedRequestId
      );
    },
    _parseLayerImageExtent(raw) {
      if (raw === null || raw === undefined || raw === "") {
        return null;
      }
      const parts = String(raw)
        .split(",")
        .map(v => Number(String(v).trim()));
      if (parts.length !== 4 || parts.some(n => !Number.isFinite(n))) {
        return null;
      }
      let [minX, minY, maxX, maxY] = parts;
      if (minX > maxX) {
        [minX, maxX] = [maxX, minX];
      }
      if (minY > maxY) {
        [minY, maxY] = [maxY, minY];
      }
      if (maxX - minX <= 0 || maxY - minY <= 0) {
        return null;
      }
      return [minX, minY, maxX, maxY];
    },
    _addSubmergedImageLayer(item, zIndex) {
      if (!item || !item.imageExtent) {
        return null;
      }
      const projection = this._getMapImageProjection();
      const layer = me.earth.layerManager.createLayer(
        item.layerName,
        8,
        item.url,
        {
          visible: true,
          opacity: 0.65,
          name: item.layerName,
          projection: projection === "EPSG:4490" ? 4490 : 4326,
          imageExtent: item.imageExtent
        }
      );
      const olLayer = layer.getLayer && layer.getLayer();
      if (olLayer && olLayer.setZIndex) {
        olLayer.setZIndex(1000 + zIndex);
      }
      me.earth.addLayer(layer);
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
      if (!layerArray || !layerArray.length) {
        return;
      }
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      layerArray.forEach(item => {
        const extent = item.imageExtent;
        if (!extent || extent.length !== 4) {
          return;
        }
        minX = Math.min(minX, extent[0]);
        minY = Math.min(minY, extent[1]);
        maxX = Math.max(maxX, extent[2]);
        maxY = Math.max(maxY, extent[3]);
      });
      if (!Number.isFinite(minX)) {
        return;
      }
      const activeCode = this.getActiveFloodXzqdm();
      const maxZoom = activeCode ? 12 : 7;
      try {
        if (me.earth && me.earth.map && me.earth.map.getView) {
          me.earth.map.getView().fit([minX, minY, maxX, maxY], {
            size: me.earth.map.getSize(),
            padding: [60, 60, 60, 60],
            maxZoom,
            duration: 300
          });
        }
      } catch (e) {
        /* fit 失败不影响图层展示 */
      }
    },
    _fetchSubmergedLayerItem(filename, index, dateArray, obj) {
      const config = this._getLayerConfig(filename, obj);
      const zbParams = {
        taskTime: this.taskSelectedTime,
        type: config.timeType,
        xzqdm: config.xzqdm || ""
      };
      if (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) {
        zbParams.modelType = this.disasterTypeIndex === 3 ? "1" : "2";
      }
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
          const xzqdm = String(filename).split("_")[0];
          return {
            layerName: `积水深度图_${xzqdm}`,
            url: mapImgUrl,
            imageExtent,
            xzqdm
          };
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
      const layerArray = [];
      let pending = filenames.length;
      if (!pending) {
        this.floodMapNoSubmergedData = true;
        return;
      }
      filenames.forEach((filename, index) => {
        this._fetchSubmergedLayerItem(filename, index, dateArray, obj).then(item => {
          if (this._isFloodSubmergedRequestStale(obj)) {
            return;
          }
          if (item) {
            layerArray.push(item);
            this._addSubmergedImageLayer(item, this.floodSubmergedOlLayers.length);
          }
          pending -= 1;
          if (pending === 0) {
            this._finishSubmergedLayersLoaded(obj, layerArray);
          }
        });
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
      if (res && res.code === 200 && res.data) {
        this.jsImageExtent = [res.data];
        const mapImgUrl = this._buildLayerImageUrl(dateArray, obj, filename, isPast);

        if (this.disasterTypeIndex === 3 && this.csnlValue === 2) {
          console.log("mapImgUrl", mapImgUrl);
        }

        const imageExtent = this._parseLayerImageExtent(res.data);
        if (!imageExtent) {
          if (obj && obj.submergedExtreme) {
            console.warn("极值图范围无效，跳过:", filename, res.data);
          }
        } else if (obj && obj.submergedExtreme) {
          const xzqdm = String(filename).split("_")[0];
          layerArray.push({
            layerName: `积水深度图_${xzqdm}`,
            url: mapImgUrl,
            imageExtent,
            xzqdm
          });
        } else {
          layerArray.push({
            layerName: "积水深度图" + index,
            url: mapImgUrl,
            imageExtent
          });
        }
      } else if (obj && obj.submergedExtreme) {
        console.warn("极值图范围查询失败，跳过:", filename, res);
      }
      if (obj && obj.submergedExtreme) {
        return;
      }
      this._continueFloodLayerBatch(index, obj, dateArray, layerArray);
    },

    /**
     * 获取积水深度图层数据
     * @param {number} index - 当前索引
     * @param {string} filename - 文件名
     * @param {Array} dateArray - 日期数组
     * @param {Object} obj - 时间对象
     * @param {Array} layerArray - 图层数组
     */
    getDljySJZZB(index, filename, dateArray, obj, layerArray) {
      // 只处理城市内涝和山洪
      if (this.disasterTypeIndex !== 3 && this.disasterTypeIndex !== 4) {
        return;
      }

      const config = this._getLayerConfig(filename, obj);
      const zbParams = {
        taskTime: this.taskSelectedTime,
        type: config.timeType,
        xzqdm: config.xzqdm || ""
      };
      if (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) {
        zbParams.modelType = this.disasterTypeIndex === 3 ? "1" : "2";
      }

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
      (this.yjcsTlCheckData = true),
        (this.jyfwTlCheckData = true),
        (this.jydjTlCheckData = true),
        (this.jssdTlCheckData = true);
      this.jylzdgwCheckData = true;

      this.removeMapAllMaker(); // 清除所有marker
      getTaskList({
        taskType: type
      }).then(res => {
        if (res.code === 200) {
          if (res.data.length == 0) {
            this.timeData = [];
            this.initTimeLine(); // 初始化时间轴
            // 清空山洪右侧表格
            this.sHjssdRainRankList = [];
            this.jssdRainRankList = [];
            const pendingDrill = this.pendingCrossModuleFloodDrill;
            this.pendingCrossModuleFloodDrill = null;
            if (pendingDrill && [3, 4].includes(this.disasterTypeIndex)) {
              this.handleCrossModuleFloodDrillNoData(pendingDrill);
            }
          } else {
            this.taskList = res.data;
            this.taskStatus = res.data[0].lostdata || "";

            // 从 sessionStorage 恢复历史时间状态
            const savedIsNowTime = sessionStorage.getItem('rapidAnalysis_isNowTime');
            const savedTaskTime = sessionStorage.getItem('rapidAnalysis_taskSelectedTime');

            // 只有在最新时间模式或没有保存历史时间时，才使用最新时间
            if (savedIsNowTime === 'true' || !savedTaskTime) {
              this.taskSelectedTime = res.data[0].tasktime || "";
              this.isNowTime = true;
              this.historyTaskTime = null;
            } else {
              // 恢复历史时间
              this.taskSelectedTime = savedTaskTime;
              this.isNowTime = false;
              this.historyTaskTime = savedTaskTime;
            }

            this.getNowTime();
            if (!skipRegionRestore && this.disasterTypeIndex === 1) {
              this.syncActiveRegionToButton();
              this.fetchRainfallWarningInfo();
              if (this.tjuTabChke == "六小时累计") {
                this.getByyjcsData(); // 含 duanlinTimeChange，加载暴雨预警与降雨图
                this.getJsData();
              } else {
                this.getSixData();
                this.reloadShortTermRainfallLayers();
              }
              if (this.getActiveFloodXzqdm()) {
                this.$nextTick(() => {
                  this.restoreActiveRegionBoundary();
                });
              }
            } else if (this.disasterTypeIndex === 1) {
              this.fetchRainfallWarningInfo();
              if (this.tjuTabChke == "六小时累计") {
                this.getByyjcsData();
                this.getJsData();
              } else {
                this.getSixData();
                this.reloadShortTermRainfallLayers();
              }
            } else if (!skipRegionRestore && this.disasterTypeIndex === 2) {
              this.syncActiveRegionToButton();
              this.fetchRainfallWarningInfo();
              if (this.getActiveFloodXzqdm()) {
                this.$nextTick(() => {
                  this.restoreActiveRegionBoundary();
                });
              }
            } else if (this.disasterTypeIndex === 2) {
              this.fetchRainfallWarningInfo();
            } else if (this.disasterTypeIndex === 3) {
              this.fetchCsnlWarningInfo();
              if (this.csnlValue == 1) {
                this.getNlyjcsData();
                this.getJssdData();
              } else {
                this.getNlyjcsGqThreeData();
                this.getJsGqthreeData();
              }
            } else if (this.disasterTypeIndex === 4) {
              this.fetchShWarningInfo();
              if (this.shValue == 1) {
                this.getshyjcsData();
                this.getshJssdData();
              } else {
                this.getshYjGqData();
                this.getShGqthreeData();
              }
            }
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
      this.$refs.openLayerListRefs.plainOptions1.forEach(item => {
        item.isCheck = false;
      });
      this.$refs.openLayerListRefs.plainOptions2.forEach(item => {
        item.isCheck = false;
      });
      this.hlTlData.splice(0);
      this.$refs.buttonPostion.isModel = false;
      this.isOpenLayerList = false;
      this.IdentifyShow = false;
      this.gqsxstl = true;
      if (this.qxyjCheckkData && type == 1) {
        this.searchQxtYj();
      }
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
      this.isInitTableChart = true;
      this.reconcileRegionFromButton();
      if ([1, 2].includes(this.disasterTypeIndex) && type !== this.disasterTypeIndex) {
        this.saveBrowseSnapshotIfNeeded();
      }
      if (this.regionContext.mode === REGION_MODE.DRILL) {
        this.promoteDrillRegionBeforeModuleSwitch();
      }
      this.syncRegionOnModuleSwitch(type);
      this.isByDetailsChart = false;
      this.isSkDetailsChart = false;
      this.isJsDetailsChart = false;
      this._clearFloodSubmergedMapLayers();
      if (this._floodSubmergedLoadTimer) {
        clearTimeout(this._floodSubmergedLoadTimer);
        this._floodSubmergedLoadTimer = null;
      }
      this.floodSubmergedRequestId += 1;
      if (earthMap) {
        this.clearBusinessLayersViaFacade();
        this.clearRainfallLayerCache();
      }
      this.clearAdminRegionBoundaries();
      this.removeMapAllMaker(); // 清除所有marker
      this.showTaskList = false;
      // 1 未来三小时降水排行 2 实时累计降雨排行 3 积水深度排行
      this.disasterTypeIndex = type;
      this.currentActiveModule = type; // 更新当前激活的模块
      if (type === 3 || type === 4) {
        this.adoptCrossModuleRegionIfNeeded(crossModuleFloodDrill);
        this.detailsTitleXzqh = "";
        this.tableDirllObj = {};
        this.pendingCrossModuleFloodDrill = this.buildPendingFloodRegion();
      } else {
        this.pendingCrossModuleFloodDrill = null;
      }
      if ([1, 2, 3, 4].includes(type)) {
        const activeCode = this.getActiveFloodXzqdm();
        if (activeCode) {
          this.syncActiveRegionToButton();
          this.$nextTick(() => {
            this.restoreActiveRegionBoundary();
          });
        } else {
          if (this.$refs.buttonPostion) {
            this.$refs.buttonPostion.resetToNational({ silent: true });
          }
          this.goNationalViewViaFacade();
        }
      }
      this.timeTabActive = 2;
      if (type === 1) {
        this.isMapType = false;
        this.mapTitleName = "未来三小时短临降雨预报图";
        this.rankingListTitle = "降水排行（未来三小时）";
        this.statisticsChartTitle = "降水统计（未来三小时）";
        this.isTaskListBtn = true;
        this.getTaskList(1, { skipRegionRestore: true });
      } else if (type === 2) {
        this.isMapType = false;
        this.mapTitleName = "全国累计降雨实况图";
        this.scrollTopList = [];
        this.isTaskListBtn = false;
        this.rankingListTitle = "降水排行（实况降雨）";
        this.statisticsChartTitle = "降水统计（实况降雨）";
        this.getTaskList(3, { skipRegionRestore: true });
        this.getSkJsData();
      } else if (type === 3) {
        if (this.nlColumns.length == 4) {
          if (this.csnlValue == 1) {
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
        } else {
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
        this.tjuTabChke = "六小时累计";
        this.mapTitleName = "全国城市内涝积水分布图";
        this.rankingListTitle = "城市内涝最大积水深度排行（未来三小时）";
        this.statisticsChartTitle = "城市内涝最大积水深度统计（未来三小时）";
        this.scrollTopList = [];
        this.isTaskListBtn = true;
        // this.csnlValue = '1'
        if (this.isMapType) {
          this.$refs.threeMap.resetApi();
          this.$refs.threeMap.clearEffect();
        }
        if (this.csnlValue == 1) {
          this.getTaskList(2, { skipRegionRestore: true });
        } else {
          this.getTaskList(4, { skipRegionRestore: true });
        }
      } else if (type === 4) {
        if (this.nlColumns.length == 4) {
          if (this.shValue == 1) {
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
        } else {
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
        this.mapTitleName = "全国山洪积水分布图";
        this.rankingListTitle = "山洪最大积水深度排行（未来三小时）";
        this.statisticsChartTitle = "山洪最大积水深度统计（未来三小时）";
        this.scrollTopList = [];
        this.isTaskListBtn = true;

        if (this.isMapType) {
          this.$refs.threeMap.resetApi();
          this.$refs.threeMap.clearEffect();
        }
        if (this.shValue == 1) {
          this.getTaskList(5, { skipRegionRestore: true });
        } else {
          this.getTaskList(6, { skipRegionRestore: true });
        }
        // this.shValue = '1'
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
          this.scrollTopList = [];
          //渲染暴雨点位
          res.data.list.forEach((item, index) => {
            let iconUrl = require("@/assets/images/earth/byyj.png");
            let obj = {
              name: item.shengname + "-" + item.shiname,
              dateTime: item.yjtime,
              xzqdm: item.xzqdm,
              type: "byyj",
              lon: item.x,
              lat: item.y,
              index: index + 1,
              shengname: item.shengname,
              shiname: item.shiname,
              maxprcp: item.maxprcp,
              yjtime: item.yjtime
            };
            // 顶部轮播数组
            this.scrollTopList.push({
              index: index,
              class: "byyj-bg",
              name: item.shengname + "-" + item.shiname,
              type: "byyj"
            });
            if (type != "colorImg") {
              diitgis.addMarker([item.x, item.y], iconUrl, obj, "byyj");
            }
          });
          // this.getByyjcsSJZ();
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
          res.data.forEach(item => {
            this.wlsxsjyRainRankList.push({
              ...item,
              name: item.xianname + "-" + item.shiname + "-" + item.shengname,
              max: item.maxjy,
              maxgw: item.maxgwjy,
              sum: item.sumjy,
              xzqdm: item.xiandm || item.xzqdm,
              xiandm: item.xiandm,
              dateTime: item.pgtime
            });
          });
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
        if (res.code === 200) {
          res.data.forEach(item => {
            const adapted = adaptLiveRainRankItem(item);
            if (adapted) {
              this.skjsRainRankList.push(adapted);
            }
          });

          this.initChart(this.skjsRainRankList);
          this.getSkJsPngUrl();
        }
      });
    },
    searchQxtYj() {
      searchQxtYj({}).then(res => {
        if (res.code && res.data) {
          res.data.forEach(item => {
            let obj = {
              lon: item.x,
              lat: item.y,
              conten: item.content,
              type: "qxyj"
            };
            let iconUrl = require("@/assets/images/rapidAnalysis/qxyjIcon.png");
            diitgis.addqxjMarker([item.x, item.y], iconUrl, obj, "qxyj");
          });
        }
      });
    },
    // 获取积水深度过去3小时
    getJsGqthreeData() {
      this.jssdRainRankList = [];
      getjssdGqSix(this.buildFloodRankParams()).then(res => {
        if (res.code === 200 && res.data) {
          this.pushFloodRankItems(this.jssdRainRankList, res.data);
          this.finishFloodRankLoad(this.jssdRainRankList);
        } else if (this.getActiveFloodXzqdm()) {
          this.finishFloodRankLoad([]);
        }
      });
    },
    // 获取山洪过去3小时积水排行
    getShGqthreeData() {
      this.sHjssdRainRankList = [];
      getShJsPhGQ(this.buildFloodRankParams()).then(res => {
        if (res.code === 200 && res.data) {
          this.pushFloodRankItems(this.sHjssdRainRankList, res.data);
          this.finishFloodRankLoad(this.sHjssdRainRankList);
        } else if (this.getActiveFloodXzqdm()) {
          this.finishFloodRankLoad([]);
        }
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
          const imageExtent = [69.995, -0.005, 140.005, 60.005];
          // 同步给 OL 预览对照
          this.syncOlPreviewImageLayer(url, imageExtent);
          this.addImageLayerViaFacade({
            layerName: "实况降雨图层",
            url: url,
            imageExtent
          });
        }
      });
    },
    // 获取积水深度排行
    getNlyjcsData() {
      getNlyjcsData(this.buildFloodRankParams()).then(res => {
        if (res.code === 200) {
          this.nlCount = res.data.count;
          this.nlChange = res.data.change;
          this.nlData = res.data.list;
          this.processWarningCityData(res.data.list);
        }
      });
    },
    // 获取山洪未来三小时预警城市
    getshyjcsData() {
      getShYJcsWL(this.buildFloodRankParams()).then(res => {
        if (res.code === 200) {
          this.shCount = res.data.count;
          this.nlCount = res.data.count;
          this.nlChange = res.data.change;
          this.nlData = res.data.list;
          this.processWarningCityData(res.data.list, 'SH');
        }
      });
    },
    // 获取积水深度过去三小时排行
    getNlyjcsGqThreeData() {
      getjssdGqSixCsyj(this.buildFloodRankParams()).then(res => {
        if (res.code === 200) {
          this.nlCount = res.data.count;
          this.nlChange = res.data.change;
          this.nlData = res.data.list;
          this.processWarningCityData(res.data.list, '', this.csnlValue == 1);
        }
      });
    },
    // 获取山洪过去三小时预警城市
    getshYjGqData() {
      getShYJcsGQ(this.buildFloodRankParams()).then(res => {
        if (res.code === 200) {
          this.nlCount = res.data.count;
          this.nlChange = res.data.change;
          this.nlData = res.data.list;
          this.processWarningCityData(res.data.list);
        }
      });
    },
    // 积水深度排行
    getJssdData() {
      this.jssdRainRankList = [];
      getJssdData(this.buildFloodRankParams()).then(res => {
        if (res.code === 200 && res.data) {
          this.pushFloodRankItems(this.jssdRainRankList, res.data);
          this.finishFloodRankLoad(this.jssdRainRankList);
        } else if (this.getActiveFloodXzqdm()) {
          this.finishFloodRankLoad([]);
        }
      });
    },
    // 山洪未来3小时积水深度排行
    getshJssdData() {
      this.sHjssdRainRankList = [];
      getShJsPhWL(this.buildFloodRankParams()).then(res => {
        if (res.code === 200 && res.data) {
          this.pushFloodRankItems(this.sHjssdRainRankList, res.data);
          this.finishFloodRankLoad(this.sHjssdRainRankList);
        } else if (this.getActiveFloodXzqdm()) {
          this.finishFloodRankLoad([]);
        }
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
        res.data.forEach(item => {
          this.wlsxsjyRainRankList.push({
            ...item,
            name: item.xianname + "-" + item.shiname + "-" + item.shengname,
            max: item.maxjy,
            sum: item.sumjy,
            maxgw: item.maxgwjy,
            xzqdm: item.xiandm || item.xzqdm,
            xiandm: item.xiandm,
            dateTime: item.pgtime
          });
        });
        this.initChart(this.wlsxsjyRainRankList);
      });
    },
    findFloodRankRowForXzqdm(drillXzqdm, list) {
      if (!drillXzqdm || !list || !list.length) {
        return null;
      }
      const d = String(drillXzqdm);
      let hit = list.find(r => r && String(r.xzqdm) === d);
      if (hit) {
        return hit;
      }
      return (
        list.find(r => {
          if (!r || r.xzqdm == null) {
            return false;
          }
          const p = String(r.xzqdm);
          if (d.startsWith(p) || p.startsWith(d)) {
            return true;
          }
          return false;
        }) || null
      );
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
      if (!pending || ![3, 4].includes(this.disasterTypeIndex)) {
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
      getSkJsDataXz({
        skTime: this.taskSelectedTime,
        xzqdm: drillCode,
        skType: this.liveRainType
      }).then(res => {
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
          diitgis.addMarker([item.x, item.y], iconUrl, obj, "skjyXz");
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
      //获取所有marker_class的class然后清除掉
      const marker_class = document.getElementsByClassName("marker_class");
      const markersArray = Array.from(marker_class);
      markersArray.forEach(marker => marker.remove());
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
      const api = pickShortTermTimelineFetcher(index, {
        1: dljySixMinSjz,
        2: dljyOnehoursSjz,
        3: dljyThreeHoursSjz
      });
      if (!api) {
        this.timeData = [];
        this.initTimeLine();
        return;
      }
      api({ taskTime: this.taskSelectedTime }).then(res => {
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
      if (
        !this.isCaseCollectionDetailsShow &&
        !this.isCaseCollectionFullscreen
      ) {
        this.caseDetailsId = "";
      }
      this.isCaseCollectionDetailsShow = false;
      this.isCaseCollectionFullscreen = true;
      this.isCaseCollectionSeeShow = true;
      this.getCaseAll();
    },
    printStarClick(print) {
      this.caseSearchValue = undefined;
      this.singleCollectType = "3";
      this.coordinatePoint = print;
      if (
        this.isCaseCollectionDetailsShow &&
        !this.isCaseCollectionFullscreen
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
      let yjlx = "1";
      if (this.disasterTypeIndex == 1) {
        yjlx = "1";
      } else if (this.disasterTypeIndex == 3) {
        yjlx = "2";
      } else if (this.disasterTypeIndex == 4) {
        yjlx = "5";
      }
      singleCollect({
        caseid: this.caseSelectValue || this.caseDetailsId,
        lat: this.coordinatePoint.lat,
        lon: this.coordinatePoint.lon,
        taskid: this.caseTaskId,
        type: this.singleCollectType,
        yjlx: yjlx
      }).then(res => {
        if (res.code === 200) {
          this.$message.success("收藏成功");
          this.$refs.caseMain.getCaseInfoData();
        } else {
          this.$message.error("收藏失败");
        }
      });
    },
    createCase() {
      this.isNewCaseMode = true;
      this.caseDetailsId = "";
      this.isCaseCollectionSeeShow = false;
      this.isCaseCollectionSelectShow = false;
      this.isCaseCollectionDetailsShow = true;
      this.isCaseCollectionFullscreen = false;
      this.isCaseListShow = false;
      this.$nextTick(() => {
        if (this.$refs.caseMain) {
          this.$refs.caseMain.resetCaseForm();
        }
      });
      this.getSaveCase_other();
    },
    getSaveCase_other() {
      saveCase_other({}).then(res => {
        if (res.code === 200) {
          this.caseDetailsId = res.data.alId;
        }
      })
    },
    closeCaseDetails() {
      this.isCaseCollectionSelectShow = false;
      this.isCaseCollectionDetailsShow = false;
      this.isCaseCollectionFullscreen = false;
    },
    showScreenCaseDetails() {
      this.isCaseCollectionDetailsShow = true;
      this.isCaseCollectionFullscreen = false;
    },
    hideScreenCaseDetails() {
      this.isCaseCollectionDetailsShow = true;
      this.isCaseCollectionFullscreen = true;
    },
    // 任务列表时间收藏案例
    starCase(item) {
      this.caseTaskId = item.id;
      this.getCaseAll();
      this.singleCollectType = "4";
      if (
        this.isCaseCollectionDetailsShow &&
        !this.isCaseCollectionFullscreen
      ) {
        // this.$refs.caseMain.getCaseInfoData();
        this.addCaseToCollection();
      } else {
        this.caseSelectValue = undefined;
        this.isCaseCollectionSelectShow = true;
      }
    },
    // 数据列表收藏
    starCaseData(item, type, yjlx) {
      singleCollect({
        caseid: this.caseDetailsId,
        taskid: item.id,
        type: type,
        yjlx: yjlx
      }).then(res => {
        if (res.code === 200) {
          this.$message.success("收藏成功");
          this.$refs.caseMain.getCaseInfoData();
        } else {
          this.$message.error("收藏失败");
        }
      });
    },
    //获取案例列表
    getCaseAll() {
      gerCaseAll({
        name: this.caseSearchValue
      }).then(res => {
        if (res.code === 200) {
          this.caseList = res.data;
        }
      });
    },
    //查看案例详情
    showCaseDetails(item) {
      this.isNewCaseMode = false;
      this.caseDetailsId = item.case_id;
      this.isCaseCollectionSeeShow = false;
      this.isCaseCollectionDetailsShow = true;
      this.isCaseCollectionFullscreen = false;
      this.isCaseListShow = false;
    },
    handleSaveCase(type) {
      const form = this.$refs.caseMain.form;
      const print = this.$refs.caseMain.dwTableData;
      const history = this.$refs.caseMain.historyCaseList;
      const cityData = this.$refs.caseMain.cityData;
      const dataList = this.$refs.caseMain.dataList;
      let kssj = "";
      let jssj = "";
      if (form.date[0] && form.date[1]) {
        kssj = moment(form.date[0])
          .startOf("hour")
          .format("YYYY-MM-DD HH:mm:ss");
        jssj = moment(form.date[1])
          .startOf("hour")
          .format("YYYY-MM-DD HH:mm:ss");
      }
      if (form.name != "") {
        saveCase({
          almc: form.name,
          bz: form.desc,
          city: cityData,
          data: dataList,
          history: history,
          kssj: kssj,
          jssj: jssj,
          point: print,
          xzqdm: form.region.join(","),
          caseid: this.caseDetailsId
        }).then(res => {
          if (res.code === 200) {
            this.isNewCaseMode = false;
            // if(this.caseDetailsId === ""){
            this.caseDetailsId = res.data;
            // }
            if (type) {
              this.isCaseCollectionDetailsShow = type;
            } else {
              this.isCaseCollectionDetailsShow = false;
            }
            this.$message.success("保存成功");
            this.getCaseAll();
            this.$refs.caseMain.getCaseInfoData(res.data);
          } else {
            this.$message.error("保存失败");
          }
        });
      } else {
        this.$message.error("请填写案例名称");
      }
    },
    openCaseListDetails() {
      this.isCaseListShow = true;
      this.isCaseCollectionSeeShow = false;
    },
    deleteCase(item, type) {
      this.$confirm({
        title: "提示",
        content: "确定要删除当前案例吗？",
        okText: "确认",
        cancelText: "取消",
        onOk: () => {
          deleteCase({
            caseid: item.case_id,
            id: type != "1" ? item.id : "",
            type: type
          }).then(res => {
            if (res.code === 200) {
              this.$message.success("删除成功");
              this.getCaseAll();
              // this.$emit("deleteCase");
              // this.getCaseInfoData();
            } else {
              this.$message.error("删除失败");
            }
          });
        }
      });

      // this.$refs.caseMain.deleteCase(item,tyoe);
    },
    caseHistoryTaskClick(item) {
      // this.isNowTime = false;
      const that = this;
      if (item.task_type === "1") {
        // this.tabDisasterType(1)
      } else if (item.task_type === "2") {
        // this.tabDisasterType(3)
      } else if (item.task_type === "5") {
        // this.tabDisasterType(4)
      }

      const originalStr = item.task_name;
      const formattedStr = originalStr
        .replace(/年|月/g, "-")
        .replace("日", " ")
        .replace("时", ":00");
      item.tasktime = formattedStr;
      // that.taskItemClick(item)
    },
    seePrint(item) {
      // let obj = {
      //   type: "casePrint",
      //   lon: Number(item.lon),
      //   lat: Number(item.lat),
      // };
      // let iconUrl = require("../../assets/images/rapidAnalysis/locat.png");
      // diitgis.addToobarrMarker([item.lon, item.lat], iconUrl, obj);
      this.$refs.identifyDom.searchBackward(item.lon, item.lat);
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
