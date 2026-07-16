<!-- 快速分析 -->
<template>
  <div class="rapid-analysis" style="width: 100%;height: 100%;">
    <!-- 更新时间 -->
    <div class="new-date-time">
      <span style="display: inline-block; vertical-align: middle;"> 更新时间： {{ newTime }}</span>
      <a-tooltip overlayClassName="tooltipStyle">
        <template #title>
          <span style="color: #FFAD00;">{{ taskStatus }}</span>
        </template>
        <img v-if='taskStatus' src="@/assets/images/tishi.png" alt="" class="taskStatus">
      </a-tooltip>

    </div>
    <!-- 滚动播放预警 -->
    <a-carousel :autoplay="true" :interval="3000" :dots="false" class="scroll-carousel" v-if="scrollTopList.length > 0">
      <div v-for="item in scrollTopList" :key="item.index" class="scroll-item" :class="item.class">
        {{ item.name }}
      </div>
    </a-carousel>
    <!-- 左侧模块切换 -->
    <div class="side-btns">
      <!-- <img src="@/assets/images/sideIcon/layer.png" alt="" /> -->
      <a-tooltip placement="right">
        <template slot="title">
          <span>未来三小时短临预报</span>
        </template>
        <img src="@/assets/images/sideIcon/forecast.png" alt="" @click="tabDisasterType(1)" />
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
        <img src="@/assets/images/sideIcon/live.png" alt="" @click="tabDisasterType(2)" />
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
        <img src="@/assets/images/sideIcon/depth.png" alt="" @click="tabDisasterType(3)" />
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
        <img src="@/assets/images/sideIcon/shMenu.png" alt="" @click="tabDisasterType(4)" />
      </a-popover>
    </div>
    <!-- 地图标题 -->
    <div class="map-title-box">
      <img class="left-icon" src="@/assets/images/sideIcon/triangle.png" alt="" />
      <p>{{ mapTitleName }}</p>
      <p v-if="disasterTypeIndex != 2">{{ dateTime }}</p>
      <p v-if="disasterTypeIndex === 2">{{ wlDataTime }} - {{ taskSelectedTime }}</p>
      <img class="right-icon" src="@/assets/images/sideIcon/triangle.png" alt="" />
    </div>
    <!-- 自定义时间 -->
    <div class="date-picker-box" v-show="liveRainType === 'other' && disasterTypeIndex === 2">
      <a-range-picker showTime format="YYYY-MM-DD HH:mm:ss" v-model="liveDate" @change="handleDateChange" />
    </div>

    <!-- 任务列表 -->
    <div class="task-list-box" v-if="isTaskListBtn">
      <div class="button" @click="openTaskList">任务列表</div>
      <div class="task-list" v-if="showTaskList">
        <div class="switch-to-latest" @click="taskItemClick('new')">
          <a-icon type="sync" />
          切换至最新时间
        </div>
        <a-table class="task-table" :columns="taskColumns" :data-source="taskList" :pagination="false"
          :scroll="{ y: 270 }">
          <span slot="taskname" slot-scope="text, record, index">
            <a href="javascript:;" style="text-decoration: underline;" @click="taskItemClick(record)">
              {{ text }}
            </a>
          </span>
        </a-table>
      </div>
    </div>
    <!-- 暴雨 -->
    <div class="side-card" @click="openByWarningTableList" v-if="disasterTypeIndex === 1">
      <span>暴雨预警城市</span>
      >
      <div class="banner">+{{ byChange }}</div>
      <p class="change-count">
        <b>{{ byCount }}</b>个
      </p>
    </div>
    <a-modal v-model="byVisible" title="暴雨预警城市" centered :width="800" :bodyStyle="{
      padding: '0px 20px'
    }" @ok="byVisible = false">
      <a-table :columns="byColumns" :data-source="byData" :pagination="false" :scroll="{ y: 210 }" bordered>
        <span slot="num" slot-scope="text, record, index">
          <div style="position: relative;">
            <img src="../../assets/images/rapidAnalysis/new_icon.png" alt=""
              style="position: absolute;top: -10px;left: -10px;" v-if="record.isnew === 'true'" />
            <span style="padding-left: 10px;">{{ index + 1 }}</span>
          </div>
        </span>
      </a-table>
    </a-modal>
    <!-- 内涝 -->
    <div class="side-card" @click="openNlWarningTableList" v-if="disasterTypeIndex === 3">
      <span>{{ csnlValue == 1 ? '内涝预警城市' : '内涝城市' }}</span>
      >
      <div class="banner">+{{ nlChange }}</div>
      <p class="change-count">
        <b>{{ nlCount }}</b>个
      </p>
    </div>
    <a-modal v-model="nlVisible" :title="csnlValue == 1 ? '内涝预警城市' : '内涝城市'" centered :width="800" :bodyStyle="{
      padding: '0px 20px'
    }" @ok="nlVisible = false">
      <a-table :columns="nlColumns" :data-source="nlData" :pagination="false" :scroll="{ y: 210 }" bordered>
        <span slot="num" slot-scope="text, record, index">
          <div style="position: relative;">
            <img src="../../assets/images/rapidAnalysis/new_icon.png" alt=""
              style="position: absolute;top: -10px;left: -10px;" v-if="record.isnew === 'true'" />
            <span style="padding-left: 10px;">{{ index + 1 }}</span>
          </div>
        </span>
        <span slot="yjlevel" slot-scope="text, record">
          <a-button type="primary" v-if="record.yjlevel === '红色预警'" style="background: #FC5558;border: none;">
            {{ record.yjlevel }}
          </a-button>
          <a-button type="primary" v-if="record.yjlevel === '橙色预警'" style="background: #FD7823;border: none;">
            {{ record.yjlevel }}
          </a-button>
          <a-button type="primary" v-if="record.yjlevel === '黄色预警'" style="background: #F5AB18;border: none;">
            {{ record.yjlevel }}
          </a-button>
          <a-button type="primary" v-if="record.yjlevel === '蓝色预警'" style="background: #5B86FC;border: none;">
            {{ record.yjlevel }}
          </a-button>
          <a-button type="primary" v-if="record.yjlevel === '无预警'" style="background: #5B86FC;border: none;">
            {{ record.yjlevel }}
          </a-button>
        </span>
      </a-table>
    </a-modal>

    <!-- 山洪 -->
    <div class="side-card" @click="openSHWarningTableList" v-if="disasterTypeIndex === 4">
      <span>{{ shValue == 1 ? '山洪预警城市' : '山洪城市' }}</span>
      >
      <div class="banner">+{{ nlChange }}</div>
      <p class="change-count">
        <b>{{ nlCount }}</b>个
      </p>
    </div>
    <a-modal v-model="shVisible" :title="shValue == 1 ? '山洪预警城市' : '山洪城市'" centered :width="800" :bodyStyle="{
      padding: '0px 20px'
    }" @ok="shVisible = false">
      <a-table :columns="nlColumns" :data-source="nlData" :pagination="false" :scroll="{ y: 210 }" bordered>
        <span slot="num" slot-scope="text, record, index">
          <div style="position: relative;">
            <img src="../../assets/images/rapidAnalysis/new_icon.png" alt=""
              style="position: absolute;top: -10px;left: -10px;" v-if="record.isnew === 'true'" />
            <span style="padding-left: 10px;">{{ index + 1 }}</span>
          </div>
        </span>
        <span slot="yjlevel" slot-scope="text, record">
          <a-button type="primary" v-if="record.yjlevel === '红色预警'" style="background: #FC5558;border: none;">
            {{ record.yjlevel }}
          </a-button>
          <a-button type="primary" v-if="record.yjlevel === '橙色预警'" style="background: #FD7823;border: none;">
            {{ record.yjlevel }}
          </a-button>
          <a-button type="primary" v-if="record.yjlevel === '黄色预警'" style="background: #F5AB18;border: none;">
            {{ record.yjlevel }}
          </a-button>
          <a-button type="primary" v-if="record.yjlevel === '蓝色预警'" style="background: #5B86FC;border: none;">
            {{ record.yjlevel }}
          </a-button>
          <a-button type="primary" v-if="record.yjlevel === '无预警'" style="background: #5B86FC;border: none;">
            {{ record.yjlevel }}
          </a-button>
        </span>
      </a-table>
    </a-modal>

    <div class="warning-card" v-if="false">
      <p class="type">
        <a-icon type="thunderbolt" />
        暴雨预警
      </p>
      <p class="location">广东省-惠州市</p>
    </div>
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
      <!-- <p class="update-time">更新时间：{{ taskSelectedTime ? taskSelectedTime : new Date().toLocaleString() }}</p> -->
      <div class="chart-box-title" style="display: flex;justify-content: space-between;">
        <span class="title-text">{{ tjuTabChke != '六小时累计' ? rankingListTitle.replace('未来三小时', '六小时累计')
          : rankingListTitle
          }}</span>
        <div class="tjtTabStyle" @click="tjtTabCheck" v-if="disasterTypeIndex === 1">
          <span>{{ tjuTabChke }}</span>
        </div>
      </div>
      <!-- 未来三小时降雨 -->
      <div class="list-box" v-if="disasterTypeIndex === 1">
        <div class="list-item"
          style="background: linear-gradient(139deg,rgba(41,141,255,0.48) 8%, rgba(13,102,176,0.62) 89%);margin: 0;">
          <span class="name" style="display: inline-block; width: 27%;text-align: center">行政区</span>
          <span class="sum" style="display: inline-block; width: 25%;text-align: center;display: flex;">累计降雨量
            <div style="display: flex;flex-direction: column;justify-content: center;">
              <!-- <a-icon type="up" style="font-size: 12px;" @click="jyPx('sumjyDesc')" />
              <a-icon type="down" style="font-size: 12px;" @click="jyPx('sumjyAsc')" /> -->
              <img src="../../assets/images/rapidAnalysis/pxup.png" style="margin:0 0 5px 5px;" alt=""
                @click="jyPx('sumjyDesc')">
              <img src="../../assets/images/rapidAnalysis/pxdown.png" style="margin:0 0 5px 5px;" alt=""
                @click="jyPx('sumjyAsc')">
            </div>
          </span>
          <span class="max"
            style="display: inline-block; width: 20%;line-height: 20px;text-align: center;display: flex;">最大小时<br />降雨量
            <div style="display: flex;flex-direction: column;justify-content: center;">
              <img src="../../assets/images/rapidAnalysis/pxup.png" style="margin:0 0 5px 5px;" alt=""
                @click="jyPx('maxjyDesc')">
              <img src="../../assets/images/rapidAnalysis/pxdown.png" style="margin:0 0 5px 5px;" alt=""
                @click="jyPx('maxjyAsc')">
            </div>
          </span>
          <span class="maxgw"
            style="display: inline-block; width: 30%;line-height: 20px;text-align: center;display: flex;">小时最大格网<br />降雨量
            <div style="display: flex;flex-direction: column;justify-content: center;">
              <img src="../../assets/images/rapidAnalysis/pxup.png" style="margin:0 0 5px 5px;" alt=""
                @click="jyPx('maxgwjyDesc')">
              <img src="../../assets/images/rapidAnalysis/pxdown.png" style="margin:0 0 5px 5px;" alt=""
                @click="jyPx('maxgwjyAsc')">
            </div>
          </span>
        </div>
        <div style="height: 3rem;overflow-y: scroll;">
          <div class="list-item" v-for="item in wlsxsjyRainRankList" :key="item.id" @click="openDetailsChart(item)">
            <span class="name" style="display: inline-block; width: 32%;text-align: center">{{ item.name }}</span>
            <span class="sum" style="display: inline-block; width: 20%;text-align: center">{{ item.sum }}mm</span>
            <span class="max" style="display: inline-block; width: 20%;text-align: center">{{ item.max }}mm</span>
            <span class="max" style="display: inline-block; width: 30%;text-align: center">{{ item.maxgw }}mm</span>
          </div>
        </div>
      </div>
      <!-- 降水排行 -->
      <div class="list-box" v-if="disasterTypeIndex === 2">
        <div class="list-item"
          style="background: linear-gradient(139deg,rgba(41,141,255,0.48) 8%, rgba(13,102,176,0.62) 89%);margin: 0;">
          <span class="name">行政区</span>
          <span class="sum">过去累计降雨量</span>
          <span class="sum">最大格网降雨量</span>
        </div>
        <div style="height: 3rem;overflow-y: scroll;">
          <div class="list-item" v-for="item in skjsRainRankList" :key="item.id" @click="openDetailsChart(item)">
            <span class="name">{{ item.name }}</span>
            <span class="sum">{{ item.sum }}mm</span>
            <span class="sum">{{ item.maxjsl }}mm</span>
          </div>
        </div>
      </div>
      <!-- 积水深度排行 -->
      <div class="list-box" v-if="disasterTypeIndex === 3">
        <div class="list-item"
          style="background: linear-gradient(139deg,rgba(41,141,255,0.48) 8%, rgba(13,102,176,0.62) 89%);margin: 0;">
          <span class="name">行政区</span>
          <span class="sum">最大积水时间</span>
          <span class="max">最大积水深度</span>
        </div>
        <div style="height: 3rem;overflow-y: scroll;">
          <div class="list-item" v-for="item in jssdRainRankList" :key="item.id" @click="openDetailsChart(item)">
            <span class="name">{{ item.name }}</span>
            <span class="sum">{{ item.datatime }}</span>
            <span class="max">{{ item.sum }}m</span>
          </div>
        </div>
      </div>
      <!-- 山洪排行 -->
      <div class="list-box" v-if="disasterTypeIndex === 4">
        <div class="list-item"
          style="background: linear-gradient(139deg,rgba(41,141,255,0.48) 8%, rgba(13,102,176,0.62) 89%);margin: 0;">
          <span class="name">行政区</span>
          <span class="sum">最大积水时间</span>
          <span class="max">最大积水深度</span>
        </div>
        <div style="height: 3rem;overflow-y: scroll;">
          <div class="list-item" v-for="item in sHjssdRainRankList" :key="item.id" @click="openDetailsChart(item)">
            <span class="name">{{ item.name }}</span>
            <span class="sum">{{ item.datatime }}</span>
            <span class="max">{{ item.sum }}m</span>
          </div>
        </div>
      </div>
      <div class="chart-box-title">
        <!-- <span class="title-text">{{ statisticsChartTitle }}</span> -->
        <span class="title-text">{{ tjuTabChke != '六小时累计' ? statisticsChartTitle.replace('未来三小时', '六小时累计')
          : statisticsChartTitle
        }}</span>
      </div>
      <div class="sum-chart-box">
        <div id="sum-chart-dom"></div>
      </div>
    </div>
    <!-- 详情图表-暴雨 -->
    <div class="statisticalDetailsChart" v-show="isByDetailsChart">
      <div class="chart-box-title">
        <span class="title-text">{{ detailsTitleXzqh }}逐{{ byChartType === 'hour' ? '小时' : '6分钟' }}最大降雨量</span>
        <span class="return-btn" @click="returnToInitTableChart"><a-icon type="left" class="return-icon" />返回</span>
      </div>
      <div class="chart-box">
        <div class="tool-box">
          <!-- <button class="tool-btn" @click="seeJssdChart">查看积水深度</button> -->
          <ul class="chart-tab-box">
            <li :class="{ active: byChartType === 'hour' }" @click="byChangeChartType('hour')">
              逐小时
            </li>
            <li :class="{ active: byChartType === 'minute' }" @click="byChangeChartType('minute')">
              逐6分钟
            </li>
          </ul>
        </div>
        <div class="chart-box-content">
          <div class="chart-item" id="byDetailsChart"></div>
        </div>
      </div>
    </div>
    <!-- 详情图表-实况 -->
    <div class="statisticalDetailsChart" v-show="isSkDetailsChart">
      <div class="chart-box-title">
        <span class="title-text">{{ detailsTitleXzqh }}每小时最大降雨量</span>
        <span class="return-btn" @click="returnToInitTableChart"><a-icon type="left" class="return-icon" />返回</span>
      </div>
      <div class="chart-box">
        <!-- <ul class="chart-tab-box">
          <li :class="{ active: jsChartType === '小时' }" @click="jsChangeChartType('小时')">逐小时</li>
          <li :class="{ active: jsChartType === '分钟' }" @click="jsChangeChartType('分钟')">逐6分钟</li>
        </ul> -->
        <div class="chart-box-content" style="height: calc(100% - 0.08rem);">
          <div class="chart-item" id="skDetailsChart"></div>
        </div>
      </div>
    </div>
    <!-- 详情图表-积水深度and山洪详情 -->
    <div class="statisticalDetailsChart" v-show="isJsDetailsChart">
      <div class="chart-box-title">
        <span class="title-text">{{ detailsTitleXzqh }}逐{{ byChartType === 'hour' ? '小时' : '6分钟' }}最大积水深度</span>
        <span class="return-btn" @click="returnToInitTableChart"><a-icon type="left" class="return-icon" />返回</span>
      </div>
      <div class="chart-box">
        <div class="tool-box" v-if="csnlValue == 1">
          <!-- <button class="tool-btn" @click="tabByChart" v-if="disasterTypeIndex === 1">
            切换至降雨量
          </button> -->
          <ul class="chart-tab-box">
            <li :class="{ active: jsChartType === 'hour' }" @click="jsChangeChartType('hour')">
              逐小时
            </li>
            <li :class="{ active: jsChartType === 'minute' }" @click="jsChangeChartType('minute')">
              逐6分钟
            </li>
          </ul>
        </div>
        <div class="chart-box-content">
          <div class="chart-item" id="jsDetailsChart"></div>
        </div>
      </div>
    </div>

    <!-- 时间轴 -->
    <div class="time-tab-btn-box"
      v-if="[3].includes(disasterTypeIndex) && isJsDetailsChart && csnlValue == 1 || [4].includes(disasterTypeIndex) && isJsDetailsChart && shValue == 1">
      <div class="tab-btn-item" :class="timeTabActive === 1 ? 'active' : ''" @click="timeTabActiveType(1)">
        历史淹没
      </div>
      <div class="tab-btn-item" :class="timeTabActive === 2 ? 'active' : ''" @click="timeTabActiveType(2)">
        未来淹没
      </div>
    </div>
    <div class="time-tab-btn-box" v-if="disasterTypeIndex == 1">
      <div class="tab-btn-item" :class="dltimeTabActive === 1 ? 'active' : ''" @click="duanlinTimeChange(1)">
        六分钟
      </div>
      <div class="tab-btn-item" :class="dltimeTabActive === 2 ? 'active' : ''" @click="duanlinTimeChange(2)">
        一小时
      </div>
      <div class="tab-btn-item" :class="dltimeTabActive === 3 ? 'active' : ''" @click="duanlinTimeChange(3)">
        三小时
      </div>
    </div>
    <div>

    </div>
    <TimeAxis ref="timeAxis" v-if="timeAxisShow" key="timeId" @updateDateTime="updateDateTime"
      :timeTabActive="timeTabActive" :timeData="timeData"></TimeAxis>
    <!-- 图例 -->
    <div class="map-legend-box" v-if="legendShow" :style="{ bottom: disasterTypeIndex === 2 ? '0.1rem' : '1.5rem' }">
      <div class="legend-header">
        <div class="title">图例</div>
      </div>
      <div class="legend-content">
        <div class="legend-item" v-if="disasterTypeIndex === 1" style="padding-top: 0.1rem;">
          <img src="../../assets/images/earth/byyj.png" alt="" />
          <span class="name">预警城市</span>
        </div>
        <h4 class="item-title" v-if="![3, 4].includes(disasterTypeIndex)">降雨范围</h4>
        <!-- <div class="legend-item-dl" v-if="disasterTypeIndex === 1">
          <div class="color-block" v-for="(item, index) in dlLegendObj.colors" :key="index" :style="{
            background: item
          }"></div>
          <div class="levels-block">
            <span>0.00</span>
            <span>5.4</span>
            <span>14.4</span>
            <span>29.8</span>
            <span>100.0</span>
          </div>
        </div> -->


        <div class="legend-item2" v-if="disasterTypeIndex === 1">
          <div class="item">
            <span class="color-block" style="background: #fff;"></span>
            <span class="name">无降水</span>
          </div>
          <div class="item">
            <span class="color-block" style="background: #d1feca;"></span>
            <span class="name">0-2.5</span>
          </div>
          <div class="item">
            <span class="color-block" style="background: #adfca4;"></span>
            <span class="name">2.5-5</span>
          </div>
          <div class="item">
            <span class="color-block" style="background: #4fec5d;"></span>
            <span class="name">5-10</span>
          </div>
          <div class="item">
            <span class="color-block" style="background: #01c90d;"></span>
            <span class="name">10-25</span>
          </div>
          <div class="item">
            <span class="color-block" style="background: #73a6fd;"></span>
            <span class="name">25-50</span>
          </div>
          <div class="item">
            <span class="color-block" style="background: #6300fc;"></span>
            <span class="name">50-100</span>
          </div>
          <div class="item">
            <span class="color-block" style="background: #fe00fe;"></span>
            <span class="name"> >100</span>
          </div>
        </div>
        <div class="legend-item2" v-if="disasterTypeIndex === 2">
          <div class="item">
            <span class="color-block" style="background: #00FF53;"></span>
            <span class="name">0-10</span>
          </div>
          <div class="item">
            <span class="color-block" style="background: #35A304;"></span>
            <span class="name">10-25</span>
          </div>
          <div class="item">
            <span class="color-block" style="background: #5EBAFE;"></span>
            <span class="name">25-50</span>
          </div>
          <div class="item">
            <span class="color-block" style="background: #1400F8;"></span>
            <span class="name">50-100</span>
          </div>
          <div class="item">
            <span class="color-block" style="background: #E11BE2;"></span>
            <span class="name">100-250</span>
          </div>
          <div class="item">
            <span class="color-block" style="background: #872713;"></span>
            <span class="name">＞＝250</span>
          </div>
        </div>
        <!-- 积水深度图例 -->
        <template v-if="[3, 4].includes(disasterTypeIndex)">
          <h4 class="item-title">预警等级</h4>
          <div class="legend-item">
            <div class="item">
              <img src="../../assets/images/rapidAnalysis/lanseyujing.png" alt="" />
              <span class="name">0.05-0.15m T≥1h</span>
              <span class="name">蓝色预警</span>
            </div>
            <div class="item">
              <img src="../../assets/images/rapidAnalysis/huangseyujing.png" alt="" />
              <span class="name">0.15-0.30m T≥1h<br />0.05-0.15m T≥3h</span>
              <span class="name">黄色预警</span>
            </div>
            <div class="item">
              <img src="../../assets/images/rapidAnalysis/chengseyujing.png" alt="" />
              <span class="name">0.30-0.50m T≥1h<br />0.15-0.30m T≥3h</span>
              <span class="name">橙色预警</span>
            </div>
            <div class="item">
              <img src="../../assets/images/rapidAnalysis/hongseyujing.png" alt="" />
              <span class="name">≥0.50m T≥1h<br />0.30-0.50m T≥3h</span>
              <span class="name"> 红色预警</span>
            </div>
          </div>
          <h4 class="item-title">积水深度</h4>
          <div class="legend-item2" v-if="[3, 4].includes(disasterTypeIndex)">
            <div class="item">
              <span class="color-block" style="background: #3B9DFF;"></span>
              <span class="name">0.1-0.27</span>
            </div>
            <div class="item">
              <span class="color-block" style="background: #0808FF;"></span>
              <span class="name">0.27-0.5</span>
            </div>
            <div class="item">
              <span class="color-block" style="background: #E7FF4A;"></span>
              <span class="name">0.5-1.0</span>
            </div>
            <div class="item">
              <span class="color-block" style="background: #FFA600;"></span>
              <span class="name">1.0-2.0</span>
            </div>
            <div class="item">
              <span class="color-block" style="background: #FF0000;"></span>
              <span class="name">2.0-3.0</span>
            </div>
            <div class="item">
              <span class="color-block" style="background: #4C0073;"></span>
              <span class="name">＞3.0</span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import ZfEarth from "../../components/Earth/Earth";
import diitgis from "@/components/Layer/LayerManagerForDiitGIS";
import threeMap from "../../components/threeMap/index"
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
  getNowTime,
  getDljySJZZB,
  getSKLSSJZZB,
  geWlSixData,
  getjssdGqSix,
  getjssdGqSixCsyj,
  getSKLSJssdDataXz,
  getSKLSSJZ,
  resetList,
  getShTimeData,
  getShYJcsGQ,
  getShYJcsWL,
  getShJsPhGQ,
  getShJsPhWL,
  getToken,
  getShJsGQXZ,
  getShJsWLXZ,
  getjcqAndShLk, dljySixMinSjz, dljyOnehoursSjz, dljyThreeHoursSjz
} from "@/api/rapidAnalysis/index.js";
import { TreeSelect } from "ant-design-vue";
const SHOW_PARENT = TreeSelect.SHOW_PARENT;

import Vue from "vue";
import TimeAxis from "../../components/rapidAnalysis/timeAxis.vue";
import geoLocation from "../../components/rapidAnalysis/geoLocation.vue";
import ResourceMenu from "../../components/rapidAnalysis/resourceMenu.vue";

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
    align: 'center'
  },
  {
    title: "省名",
    dataIndex: "shengname",
    key: "shengname",
    align: 'center'

  },
  {
    title: "市名",
    dataIndex: "shiname",
    key: "shiname",
    align: 'center'

  },
  {
    title: "预警时间",
    key: "yjtime",
    dataIndex: "yjtime",
    align: 'center'

  },
  {
    title: "预警指标",
    key: "maxprcp",
    dataIndex: "maxprcp",
    align: 'center'

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
    align: 'center'

  },
  {
    title: "省名",
    dataIndex: "shengname",
    key: "shengname",
    align: 'center'

  },
  {
    title: "市名",
    dataIndex: "shiname",
    key: "shiname",
    align: 'center'

  },
  {
    title: "预警时间",
    key: "pgtime",
    dataIndex: "pgtime",
    align: 'center'

  },
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
  components: {
    ZfEarth,
    TimeAxis,
    geoLocation,
    ResourceMenu,
    threeMap
  },
  provide: function () {
    //依赖注入
    return {
      eventBus: this.eventBus
    };
  },
  data() {
    return {
      isMapType: false,
      tableDirllObj: '',//表格下钻数据
      taskStatus: '',
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
      csnlValue: '1',
      shValue: '1',
      showTaskList: false,
      isTaskListBtn: true,
      taskColumns: [
        {
          title: "序号",
          dataIndex: "index",
          align: "center",
          width: "20%",
          customRender: (text, record, index) => index + 1
        },
        {
          title: "历史任务",
          dataIndex: "taskname",
          align: "center",
          width: "80%",
          scopedSlots: { customRender: "taskname" }
        }
      ],
      taskList: [],
      disasterTypeIndex: 1, // 1未来三小时降雨 2降水排行 3积水深度排行
      wlsxsjyRainRankList: [],
      skjsRainRankList: [],
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
      myChart: null,
      myDetailsChart: null,
      rankingListTitle: "降水排行（未来三小时）",// 排行名称
      tjuTabChke: '六小时累计',
      WLTABLEcolumns: [
        {
          title: '行政区',
          dataIndex: 'name',
          key: 'name',
          align: "center",
          ellipsis: true
        },
        {
          title: '累计降雨量',
          dataIndex: 'sum',
          key: 'sum',
          align: "center",
          scopedSlots: { customRender: 'sum' },
          ellipsis: true

        },
        {
          title: '最大小时降雨量',
          dataIndex: 'max',
          key: 'max',
          align: "center",
          scopedSlots: { customRender: 'max' },
          ellipsis: true

        },
      ],
      jsPhcolumns: [
        {
          title: '行政区',
          dataIndex: 'name',
          key: 'name',
          align: "center",
          ellipsis: true
        },
        {
          title: '过去累计降雨量',
          dataIndex: 'sum',
          key: 'sum',
          align: "center",
          scopedSlots: { customRender: 'sum' },
          ellipsis: true

        },
      ],
      JSSDcolumns: [
        {
          title: '行政区',
          dataIndex: 'name',
          key: 'name',
          align: "center",
          ellipsis: true
        },
        {
          title: '最大积水时间 ',
          dataIndex: 'datatime',
          key: 'datatime',
          align: "center",
          scopedSlots: { customRender: 'datatime' },
          ellipsis: true

        },
        {
          title: '最大积水深度 ',
          dataIndex: 'sum',
          key: 'sum',
          align: "center",
          scopedSlots: { customRender: 'sum' },
          ellipsis: true

        },
      ],
      statisticsChartTitle: "降水统计（未来三小时）", // 统计图名称
      isInitTableChart: true,
      isByDetailsChart: false,
      isSkDetailsChart: false,
      isJsDetailsChart: false,
      isSHDetailsChart: false,
      byChartType: "hour",
      jsChartType: "hour",
      byDatailsBarData: null, //详情数据
      jsDatailsLineData: null, //详情数据
      liveDate: [undefined, undefined], // 自定义时间
      taskSelectedTime: null,
      detailsTitleXzqh: "",
      timeTabActive: 2, // 1历史淹没 2未来淹没
      dltimeTabActive: 1,
      timeData: [], // 时间轴传递数据
      scrollTopList: [], // 顶部滚动播报
      mapTitleName: "全国未来三小时短临降雨预报图",
      dlLegendObj: {
        levels: window.webConfig.dlLevels,
        colors: window.webConfig.dlColors
      },
      newTime: null, //最新时间
      jsImageExtent: [], //积水的城市四至范围
      setIntervalTime: null,
      threeCreated: 1,
      nlthreeCreated: 1
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
    // 是否显示时间轴
    timeAxisShow() {
      // return true;
      return this.disasterTypeIndex != 2;
    },
    wlDataTime(val) {
      if (this.liveRainType != 'other') {
        // 根据传入的值来获取之前的时间，比如传入12就获取当前taskSelectedTime的值12小时以前的时间
        const time = moment(this.taskSelectedTime).subtract(Number(this.liveRainType), "hours").format("YYYY-MM-DD HH:mm");
        return time;
      }
    }
  },
  errorCaptured(err, vm, info) {
    console.error(err, vm, info); // 这里可以添加错误处理逻辑
    return true; // 返回true表示继续向父组件传递错误，false则停止冒泡
  },
  created() {
    // this.getNowTime()
  },
  methods: {
    moment,
    //获取最新时间
    getNowTime() {
      getNowTime({
        taskTime: this.taskSelectedTime
      }).then(res => {
        if (res.code === 200) {
          this.newTime = res.data
        }
      })
    },
    // 初始化加载地图
    earthLoaded(map) {
      earthMap = map;
      earthMap.setZoom(5);
      earthMap.zoomToExtent([110.55, 29.32]);
    },
    // 行政区定位
    searchXzqfw(code) {
      searchXzqfw({
        xzqdm: code
      }).then(res => {
        if (res.code === 200) {
          // if (this.disasterTypeIndex == 3 || this.disasterTypeIndex == 4) {
          //   this.$refs.threeMap.addPolyline(res.data)
          // } else {
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
          //   }
        }
      });
    },
    // 山洪区
    searchSHfw(code) {
      getjcqAndShLk({ xzqdm: code, xzqType: 2 }).then(res => {
        if (res.code === 200) {
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
          //   }
        }
      })
    },
    // 建成区
    searchJCQfw(code) {
      getjcqAndShLk({ xzqdm: code, xzqType: 1 }).then(res => {
        if (res.code === 200) {
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
          //   }
        }
      })
    },
    // 时间轴的当前时间
    updateDateTime(obj) {
      this.dateTime = obj.data;
      const dateArray = this.taskSelectedTime.split(/[- :]/);

      if (this.disasterTypeIndex === 1) {
        const mapImgUrl = `${this.baseUrl}file/${obj.filename}`;
        // const mapImgUrl = `${this.baseUrl}${obj.filename}`
        earthMap.removeAllLayer();
        const imageExtent = [
          73.06457922444216,
          17.43170579946752,
          135.47990896511072,
          54.09018157258503
        ]
        diitgis.addImage({
          layerName: "降雨数据叠加",
          url: mapImgUrl,
          imageExtent
        });
      } else if (this.disasterTypeIndex === 3) {
        earthMap.removeAllLayer();
        this.getDljySJZZB(0, obj.filename[0], dateArray, obj, [])

      } else if (this.disasterTypeIndex === 4) {
        earthMap.removeAllLayer();
        this.getDljySJZZB(0, obj.filename[0], dateArray, obj, [])
      }
    },
    getDljySJZZB(index, filename, dateArray, obj, layerArray) {
      const xzqdm = filename.split("_")[0];
      let that = this;
      if (that.disasterTypeIndex == 3 && that.csnlValue == 1) {
        getDljySJZZB({
          taskTime: this.taskSelectedTime,
          type: this.timeTabActive === 1 ? 'SK' : 'DL',
          xzqdm: xzqdm
        }).then(res => {
          if (res.code === 200) {
            const timeArray = obj.time.split(/[- :]/);
            this.jsImageExtent = [res.data];
            const mapImgUrl = `${this.baseUrl}file/projectServerTask/${dateArray[0]}/${dateArray[0]}${dateArray[1]}/${dateArray[0]}${dateArray[1]}${dateArray[2]}/flood_output/${timeArray[0]}${timeArray[1]}${timeArray[2]}${timeArray[3]}_${this.timeTabActive === 1 ? 'SK' : 'DL'}/depth2png/${filename}`;
            // earthMap.removeAllLayer();
            const imageExtent = [
              Number(res.data.split(",")[0]),
              Number(res.data.split(",")[1]),
              Number(res.data.split(",")[2]),
              Number(res.data.split(",")[3])
            ];
            layerArray.push({
              layerName: "积水深度图" + index,
              url: mapImgUrl,
              imageExtent
            })
            if (index < obj.filename.length - 1) {
              that.getDljySJZZB(index + 1, obj.filename[index + 1], dateArray, obj, layerArray)
            } else {
              diitgis.addImage({
                layerName: layerArray[0].layerName,
                url: layerArray[0].url,
                imageExtent: layerArray[0].imageExtent,
                name: null,
                index: 0,
                layerArray: layerArray
              });
            }
          }
        })
      } else if (that.disasterTypeIndex == 3 && that.csnlValue == 2) {
        getSKLSSJZZB({
          taskTime: that.taskSelectedTime,
          type: 'SK',
          xzqdm: xzqdm
        }).then(res => {
          if (res.code === 200) {
            const timeArray = obj.time.split(/[- :]/);
            this.jsImageExtent = [res.data];
            const mapImgUrl = `${this.baseUrl}file/projectServerTask/${dateArray[0]}/${dateArray[0]}${dateArray[1]}/${dateArray[0]}${dateArray[1]}${dateArray[2]}_skls_yhsk/flood_output/${dateArray[0]}${dateArray[1]}${dateArray[2]}${dateArray[3]}_skls_yhsk_SK/depth2png/${filename}`;
            // earthMap.removeAllLayer();

            const imageExtent = [
              Number(res.data.split(",")[0]),
              Number(res.data.split(",")[1]),
              Number(res.data.split(",")[2]),
              Number(res.data.split(",")[3])
            ];
            layerArray.push({
              layerName: "积水深度图" + index,
              url: mapImgUrl,
              imageExtent
            })
            if (index < obj.filename.length - 1) {
              that.getDljySJZZB(index + 1, obj.filename[index + 1], dateArray, obj, layerArray)
            } else {
              diitgis.addImage({
                layerName: layerArray[0].layerName,
                url: layerArray[0].url,
                imageExtent: layerArray[0].imageExtent,
                name: null,
                index: 0,
                layerArray: layerArray
              });
            }
          }
        })
      } else if (that.disasterTypeIndex == 4 && that.shValue == 1) {
        getDljySJZZB({
          taskTime: this.taskSelectedTime,
          type: this.timeTabActive === 1 ? 'SK' : 'DL',
          xzqdm: xzqdm
        }).then(res => {
          if (res.code === 200) {
            const timeArray = obj.time.split(/[- :]/);
            this.jsImageExtent = [res.data];
            // const mapImgUrl = `${this.baseUrl}${filename}`
            const mapImgUrl = `${this.baseUrl}file/projectServerTask/${dateArray[0]}/${dateArray[0]}${dateArray[1]}/${dateArray[0]}${dateArray[1]}${dateArray[2]}/flood_output/${timeArray[0]}${timeArray[1]}${timeArray[2]}${timeArray[3]}_${this.timeTabActive === 1 ? 'SK' : 'DL'}/depth2png/${filename}`;
            // earthMap.removeAllLayer();
            const imageExtent = [
              Number(res.data.split(",")[0]),
              Number(res.data.split(",")[1]),
              Number(res.data.split(",")[2]),
              Number(res.data.split(",")[3])
            ];
            layerArray.push({
              layerName: "积水深度图" + index,
              url: mapImgUrl,
              imageExtent
            })
            /*diitgis.addImage({
              layerName: "积水深度图"+index,
              url: mapImgUrl,
              imageExtent
            });*/
            if (index < obj.filename.length - 1) {
              that.getDljySJZZB(index + 1, obj.filename[index + 1], dateArray, obj, layerArray)
            } else {
              diitgis.addImage({
                layerName: layerArray[0].layerName,
                url: layerArray[0].url,
                imageExtent: layerArray[0].imageExtent,
                name: null,
                index: 0,
                layerArray: layerArray
              });
            }
          }
        })
      } else if (that.disasterTypeIndex == 4 && that.shValue == 2) {
        getSKLSSJZZB({
          taskTime: that.taskSelectedTime,
          type: 'SK',
          xzqdm: xzqdm
        }).then(res => {
          if (res.code === 200) {
            const timeArray = obj.time.split(/[- :]/);
            this.jsImageExtent = [res.data];
            const mapImgUrl = `${this.baseUrl}file/projectServerTask/${dateArray[0]}/${dateArray[0]}${dateArray[1]}/${dateArray[0]}${dateArray[1]}${dateArray[2]}_skls_yhsk/flood_output/${dateArray[0]}${dateArray[1]}${dateArray[2]}${dateArray[3]}_skls_yhsk_SK/depth2png/${filename}`;
            // earthMap.removeAllLayer();

            const imageExtent = [
              Number(res.data.split(",")[0]),
              Number(res.data.split(",")[1]),
              Number(res.data.split(",")[2]),
              Number(res.data.split(",")[3])
            ];
            layerArray.push({
              layerName: "积水深度图" + index,
              url: mapImgUrl,
              imageExtent
            })
            if (index < obj.filename.length - 1) {
              that.getDljySJZZB(index + 1, obj.filename[index + 1], dateArray, obj, layerArray)
            } else {
              diitgis.addImage({
                layerName: layerArray[0].layerName,
                url: layerArray[0].url,
                imageExtent: layerArray[0].imageExtent,
                name: null,
                index: 0,
                layerArray: layerArray
              });
            }
          }
        })
      }

    },
    handleDateChange(date) {
      this.liveDate[0] = moment(date[0]._d).format("YYYY-MM-DD HH:mm:ss");
      this.liveDate[1] = moment(date[1]._d).format("YYYY-MM-DD HH:mm:ss");
    },
    onLiveRainTypeChange(data) {
      earthMap.removeAllLayer();
      this.removeMapAllMaker(); // 清除所有marker
      this.liveRainType = data.target.value
      this.getSkJsData()
    },
    csnlTabCheck(data) {
      this.csnlValue = data.target.value
      this.$refs.threeMap.clearEffect()
      this.nlthreeCreated = 1
      this.nlChange = 0
      this.nlCount = 0
      this.nlData = []
      if (this.nlColumns.length == 5) {
        this.nlColumns.pop()
      }
      if (data.target.value == 1) {
        if (this.nlColumns.length == 4) {
          this.nlColumns.push({
            title: "预警等级",
            key: "yjlevel",
            scopedSlots: { customRender: "yjlevel" },
            align: 'center'
          })
        }
        this.rankingListTitle = "城市内涝最大积水深度排行（未来三小时）";
        this.statisticsChartTitle = "城市内涝最大积水深度统计（未来三小时）";
        this.tabDisasterType(3)
      } else {
        if (this.nlColumns.length == 5) {
          this.nlColumns.pop()
        }
        // 过去3小时
        this.nlColumns.push
        this.disasterTypeIndex = 3
        this.rankingListTitle = "城市内涝最大积水深度排行（过去三小时）";
        this.statisticsChartTitle = "城市内涝最大积水深度统计（过去三小时）";
        this.isTaskListBtn = true;
        this.getTaskList(4)
      }
    },
    shTabCheck(data) {
      this.shValue = data.target.value
      this.nlChange = 0
      this.nlCount = 0
      this.nlData = []
      if (this.nlColumns.length == 5) {
        this.nlColumns.pop()
      }
      this.tabDisasterType(4)
      if (data.target.value == 1) {
        if (this.nlColumns.length == 4) {
          this.nlColumns.push({
            title: "预警等级",
            key: "yjlevel",
            scopedSlots: { customRender: "yjlevel" },
            align: 'center'
          })
        }
        this.rankingListTitle = "山洪最大积水深度排行（未来三小时）";
        this.statisticsChartTitle = "山洪最大积水深度统计（未来三小时）";
      } else {
        if (this.nlColumns.length == 5) {
          this.nlColumns.pop()
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
        this.$refs.timeAxis.initTimeLine();
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
    },
    getTaskList(type) {
      if (this.myChart) {
        this.myChart.dispose()
      }
      this.removeMapAllMaker(); // 清除所有marker
      getTaskList({
        taskType: type
      }).then(res => {
        if (res.code == 200) {
          if (res.data.length == 0) {
            this.timeData = [];
            this.initTimeLine(); // 初始化时间轴
            // 清空山洪右侧表格
            this.sHjssdRainRankList = []

          }
          this.taskList = res.data;
          this.taskStatus = res.data[0].lostdata
          this.taskSelectedTime = res.data[0].tasktime;
          this.getNowTime()
          // this.taskSelectedTime = "2025-04-17 20:00"
          if (this.disasterTypeIndex === 1) {
            if (this.tjuTabChke == '六小时累计') {
              this.getByyjcsData(); // 初始化加载暴雨预警数据
              this.getJsData(); // 初始化加载未来三日降水排行数据
            }
          } else if (this.disasterTypeIndex === 3) {
            if (this.csnlValue == 1) {
              this.getNlyjcsData();
              this.getJssdData();
            } else {
              this.getNlyjcsGqThreeData()
              this.getJsGqthreeData()
            }
          } else if (this.disasterTypeIndex === 4) {
            if (this.shValue == 1) {
              this.getshyjcsData();
              this.getshJssdData();
            } else {
              this.getshYjGqData()
              this.getShGqthreeData()
            }
          }
        }
      });
    },
    // 积水深度过去三小时时间轴
    getSKLSSJZ(id) {
      getSKLSSJZ({
        taskTime: this.taskSelectedTime,
        xzqdm: id || '',
        modelType: this.disasterTypeIndex == 3 ? '1' : this.disasterTypeIndex == 4 ? '2' : ''
      }).then(res => {
        if (res.code === 200) {
          this.timeData = [];
          this.timeData = res.data;
          this.initTimeLine(); // 初始化时间轴
        } else {
          this.timeData = [];
          this.initTimeLine(); // 初始化时间轴
        }
      })
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
      if (this.nlColumns.length == 5) {
        this.nlColumns.pop()
      }
      if (earthMap) {
        earthMap.removeAllLayer();
        earthMap.layerManager.clearHightLayer();
        earthMap.setZoom(5);
        earthMap.zoomToExtent([110.55, 29.32]);
      }
      this.removeMapAllMaker(); // 清除所有marker
      this.isInitTableChart = true;
      this.isByDetailsChart = false;
      this.isSkDetailsChart = false;
      this.isJsDetailsChart = false;
      // 1 未来三小时降水排行 2 实时累计降雨排行 3 积水深度排行
      this.disasterTypeIndex = type;
      this.timeTabActive = 2;
      if (type === 1) {
        this.isMapType = false
        this.mapTitleName = "全国未来三小时短临降雨预报图";
        this.rankingListTitle = "降水排行（未来三小时）";
        this.statisticsChartTitle = "降水统计（未来三小时）";
        this.isTaskListBtn = true;
        this.getTaskList(1);
      } else if (type === 2) {
        this.isMapType = false
        this.mapTitleName = "全国累计降雨实况图";
        this.scrollTopList = [];
        this.isTaskListBtn = false;
        this.rankingListTitle = "降水排行（实况降雨）";
        this.statisticsChartTitle = "降水统计（实况降雨）";
        this.getTaskList(3);
        this.getSkJsData();
      } else if (type === 3) {
        if (this.nlColumns.length == 4) {
          if (this.csnlValue == 1) {
            this.nlColumns.push({
              title: "预警等级",
              key: "yjlevel",
              scopedSlots: { customRender: "yjlevel" },
              align: 'center'
            })
          }

        } else {
          this.nlColumns.pop()
        }
        this.mapTitleName = "全国城市内涝积水分布图";
        this.rankingListTitle = "城市内涝最大积水深度排行（未来三小时）";
        this.statisticsChartTitle = "城市内涝最大积水深度统计（未来三小时）";
        this.scrollTopList = [];
        this.isTaskListBtn = true;
        this.isMapType = false
        // this.csnlValue = '1'
        if (this.csnlValue == 1) {
          this.getTaskList(2);
        } else {
          this.getTaskList(4);
        }
        // this.$refs.threeMap.resetApi()
        // this.$refs.threeMap.clearEffect()
      } else if (type === 4) {
        if (this.nlColumns.length == 4) {
          if (this.shValue == 1) {
            this.nlColumns.push({
              title: "预警等级",
              key: "yjlevel",
              scopedSlots: { customRender: "yjlevel" },
              align: 'center'
            })
          }

        } else {
          this.nlColumns.pop()
        }
        this.mapTitleName = "全国山洪积水分布图";
        this.rankingListTitle = "山洪最大积水深度排行（未来三小时）";
        this.statisticsChartTitle = "山洪最大积水深度统计（未来三小时）";
        this.scrollTopList = [];
        this.isTaskListBtn = true;
        this.isMapType = false
        // this.shValue = '1'
        if (this.shValue == 1) {
          this.getTaskList(5);

        } else {
          this.getTaskList(6);
        }
        // this.$refs.threeMap.resetApi()
        // this.$refs.threeMap.clearEffect()
      }
    },
    // 获取山洪时间周
    getShTimeData(modelType, type, xzqdm) {
      let params = {
        modelType: modelType,
        taskTime: this.taskSelectedTime,
        type: type == 1 ? 'DL' : 'SK',
        xzqdm: xzqdm
      }
      getShTimeData(params).then(res => {
        if (res.code == 200) {
          this.timeData = [];
          this.timeData = res.data;
          this.initTimeLine(); // 初始化时间轴
        }
      })
    },
    // 获取未来三小时的降水排行
    getByyjcsData() {
      getByyjcsData({
        taskTime: this.taskSelectedTime
      }).then(res => {
        debugger
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
              xzqdm: item.xzqdm
            };
            // 顶部轮播数组
            this.scrollTopList.push({
              index: index,
              class: "byyj-bg",
              name: item.shengname + "-" + item.shiname
            });
            diitgis.addMarker([item.x, item.y], iconUrl, obj);
          });
          // this.getByyjcsSJZ();
          this.duanlinTimeChange(1)
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
    // 获取积水深度时间轴
    getJsSd(val) {
      getjsTime({
        taskTime: this.taskSelectedTime,
        type: val,
        xzqdm: this.tableDirllObj.xzqdm || '',
        modelType: this.disasterTypeIndex == 3 ? '1' : this.disasterTypeIndex == 4 ? '2' : ''
      }).then(res => {
        if (res.code === 200) {
          this.timeData = res.data;
          this.initTimeLine(); // 初始化时间轴
        } else {
          this.timeData = [];
          this.initTimeLine(); // 初始化时间轴
        }
      })

    },
    jyPx(type) {
      if (this.tjuTabChke == '未来三小时') {
        this.getSixData(type)
      } else {
        this.getJsData(type)
      }
    },
    getJsData(type) {
      this.wlsxsjyRainRankList = [];
      getJsData({
        orderType: type || '',
        taskTime: this.taskSelectedTime
      }).then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            this.wlsxsjyRainRankList.push({
              name: item.xianname + "-" + item.shiname + "-" + item.shengname,
              max: item.maxjy,
              maxgw: item.maxgwjy,
              sum: item.sumjy,
              xzqdm: item.xzqdm,
              xiandm: item.xiandm,
              dateTime: item.pgtime
            });
          });
          this.initChart(this.wlsxsjyRainRankList);
        }
      });
    },
    // 获取实时累计降雨排行
    getSkJsData() {
      this.disasterTypeIndex = 2;
      this.skjsRainRankList = [];
      getSkJsData({
        skTime:
          this.liveRainType === "ohter"
            ? this.liveDate[0] + "至" + this.liveDate[1]
            : this.taskSelectedTime,
        skType: this.liveRainType
      }).then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            this.skjsRainRankList.push({
              name: item.shengname + "-" + item.shiname,
              maxjsl: item.maxjsl,
              sum: item.sumjsl,
              xzqdm: item.xzqdm
            });
          });
          this.initChart(this.skjsRainRankList);
          this.getSkJsPngUrl();
        }
      });
    },
    // 获取积水深度过去3小时
    getJsGqthreeData() {
      this.jssdRainRankList = []
      let params = {
        taskTime: this.taskSelectedTime
      }
      getjssdGqSix(params).then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            this.jssdRainRankList.push({
              name: item.shengname + "-" + item.shiname,
              sum: item.maxjssd,
              datatime: item.datatime,
              xzqdm: item.xzqdm
            });
          });

          // if (this.disasterTypeIndex == 3) {
          //   this.getShTimeData(this.csnlValue, this.csnlValue, '')
          // } else {
          this.getSKLSSJZ()
          // }
          this.initChart(this.jssdRainRankList);
        }
      })
    },
    // 获取山洪过去3小时积水排行
    getShGqthreeData() {
      this.sHjssdRainRankList = []
      let params = {
        taskTime: this.taskSelectedTime
      }
      getShJsPhGQ(params).then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            this.sHjssdRainRankList.push({
              name: item.shengname + "-" + item.shiname,
              sum: item.maxjssd,
              datatime: item.datatime,
              xzqdm: item.xzqdm
            });
          });
          // this.getShTimeData(this.shValue, this.shValue, '')
          this.getSKLSSJZ()
          this.initChart(this.sHjssdRainRankList);
        }
      })
    },

    // 获取实况降雨图层
    getSkJsPngUrl() {
      getSkJsPngUrl({
        skTime:
          this.liveRainType === "ohter"
            ? this.liveDate[0] + "至" + this.liveDate[1]
            : this.taskSelectedTime,
        skType: this.liveRainType
      }).then(res => {
        if (res.code === 200) {
          const url = this.baseUrl + "file/" + res.data;
          earthMap.removeAllLayer();
          const imageExtent = [
            69.995,
            -0.005,
            140.005,
            60.005
          ];
          diitgis.addImage({
            layerName: "实况降雨图层",
            url: url,
            imageExtent
          });
        }
      });
    },
    // 获取积水深度排行
    getNlyjcsData() {
      getNlyjcsData({
        taskTime: this.taskSelectedTime
      }).then(res => {
        if (res.code === 200) {
          this.nlCount = res.data.count;
          this.nlChange = res.data.change;
          this.nlData = res.data.list;
          this.scrollTopList = [];
          res.data.list.forEach((item, index) => {
            let className = ''
            className = "lanseyujing-bg";
            if (item.yjlevel === "红色预警") {
              className = "hongseyujing-bg";
              item.iconUrl = require('@/assets/images/rapidAnalysis/hongseyujing.png')
            } else if (item.yjlevel === "橙色预警") {
              className = "chengseyujing-bg";
              item.iconUrl = require('@/assets/images/rapidAnalysis/chengseyujing.png')
            } else if (item.yjlevel === "黄色预警") {
              className = "huangseyujing-bg";
              item.iconUrl = require('@/assets/images/rapidAnalysis/huangseyujing.png')
            } else if (item.yjlevel === "蓝色预警") {
              className = "lanseyujing-bg";
              item.iconUrl = require('@/assets/images/rapidAnalysis/lanseyujing.png')
            }
            let obj = {
              name: item.shengname + "-" + item.shiname,
              datatime: item.datatime,
              xzqdm: item.xzqdm
            };
            // 顶部轮播数组
            this.scrollTopList.push({
              index: index,
              class: className,
              name: item.shengname + "-" + item.shiname
            });
            diitgis.addMarker([item.x, item.y], item.iconUrl, obj);
            // this.$refs.threeMap.addMaker(res.data.list)
          });
        }
      });
    },

    // 获取山洪未来三小时预警城市
    getshyjcsData() {
      getShYJcsWL({
        taskTime: this.taskSelectedTime
      }).then(res => {
        if (res.code === 200) {
          this.nlCount = res.data.count;
          this.nlChange = res.data.change;
          this.nlData = res.data.list;
          this.scrollTopList = [];
          res.data.list.forEach((item, index) => {
            let className = ''
            let iconUrl = require("@/assets/images/rapidAnalysis/lanseyujing.png")
            className = "SHlanseyujing-bg";
            if (item.yjlevel === "红色预警") {
              className = "SHhongseyujing-bg";
              item.iconUrl = require("@/assets/images/rapidAnalysis/hongseyujing.png")
            } else if (item.yjlevel === "橙色预警") {
              className = "chengseyujing-bg";
              item.iconUrl = require("@/assets/images/rapidAnalysis/chengseyujing.png")
            } else if (item.yjlevel === "黄色预警") {
              className = "SHhuangseyujing-bg";
              item.iconUrl = require("@/assets/images/rapidAnalysis/huangseyujing.png")
            } else if (item.yjlevel === "蓝色预警") {
              className = "SHlanseyujing-bg";
              item.iconUrl = require("@/assets/images/rapidAnalysis/lanseyujing.png")
            }
            // 顶部轮播数组
            this.scrollTopList.push({
              index: index,
              class: className,
              name: item.shengname + "-" + item.shiname
            });
            let obj = {
              name: item.shengname + "-" + item.shiname,
              datatime: item.datatime,
              xzqdm: item.xzqdm
            };
            diitgis.addMarker([item.x, item.y], item.iconUrl, obj);

          });
        }
      });
    },

    // 获取积水深度过去三小时排行
    getNlyjcsGqThreeData() {
      getjssdGqSixCsyj({
        taskTime: this.taskSelectedTime
      }).then(res => {
        if (res.code === 200) {
          this.nlCount = res.data.count;
          this.nlChange = res.data.change;
          this.nlData = res.data.list;
          this.scrollTopList = [];
          res.data.list.forEach((item, index) => {
            let className = ''
            className = "SHlanseyujing-bg";
            if (item.yjlevel === "红色预警") {
              className = "SHhongseyujing-bg";
              item.iconUrl = require("@/assets/images/rapidAnalysis/hongseyujing.png")
            } else if (item.yjlevel === "橙色预警") {
              className = "chengseyujing-bg";
              item.iconUrl = require("@/assets/images/rapidAnalysis/chengseyujing.png")
            } else if (item.yjlevel === "黄色预警") {
              className = "SHhuangseyujing-bg";
              item.iconUrl = require("@/assets/images/rapidAnalysis/huangseyujing.png")
            } else if (item.yjlevel === "蓝色预警") {
              className = "SHlanseyujing-bg";
              item.iconUrl = require("@/assets/images/rapidAnalysis/lanseyujing.png")
            }
            // 顶部轮播数组
            this.scrollTopList.push({
              index: index,
              class: className,
              name: item.shengname + "-" + item.shiname
            });
            let obj = {
              name: item.shengname + "-" + item.shiname,
              datatime: item.datatime,
              xzqdm: item.xzqdm
            };
            if (this.csnlValue == 1) {
              diitgis.addMarker([item.x, item.y], item.iconUrl, obj);
            } else {
              diitgis.addMarker([item.x, item.y], '', obj);
            }

          });
        }
      });
    },
    // 获取山洪过去三小时预警城市
    getshYjGqData() {
      getShYJcsGQ({
        taskTime: this.taskSelectedTime
      }).then(res => {
        if (res.code === 200) {
          this.nlCount = res.data.count;
          this.nlChange = res.data.change;
          this.nlData = res.data.list;
          this.scrollTopList = [];
          res.data.list.forEach((item, index) => {
            let className = ''
            className = "SHlanseyujing-bg";
            if (item.yjlevel === "红色预警") {
              className = "SHhongseyujing-bg";
              item.iconUrl = require("@/assets/images/rapidAnalysis/hongseyujing.png")
            } else if (item.yjlevel === "橙色预警") {
              className = "chengseyujing-bg";
              item.iconUrl = require("@/assets/images/rapidAnalysis/chengseyujing.png")
            } else if (item.yjlevel === "黄色预警") {
              className = "SHhuangseyujing-bg";
              item.iconUrl = require("@/assets/images/rapidAnalysis/huangseyujing.png")
            } else if (item.yjlevel === "蓝色预警") {
              className = "SHlanseyujing-bg";
              item.iconUrl = require("@/assets/images/rapidAnalysis/lanseyujing.png")
            }
            // 顶部轮播数组
            this.scrollTopList.push({
              index: index,
              class: className,
              name: item.shengname + "-" + item.shiname
            });
            let obj = {
              name: item.shengname + "-" + item.shiname,
              datatime: item.datatime,
              xzqdm: item.xzqdm
            };
            if (this.shValue == 1) {
              diitgis.addMarker([item.x, item.y], item.iconUrl, obj);
            } else {
              diitgis.addMarker([item.x, item.y], '', obj);
            }
          });
        }
      });
    },

    // 积水深度排行
    getJssdData() {
      this.jssdRainRankList = [];
      getJssdData({
        // dataTime: this.dateTime, // 需要更换为时间轴时间
        taskTime: this.taskSelectedTime
      }).then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            this.jssdRainRankList.push({
              name: item.shengname + "-" + item.shiname,
              sum: item.maxjssd,
              datatime: item.datatime,
              xzqdm: item.xzqdm
            });
          });
          this.getJsSd('DL')
          this.initChart(this.jssdRainRankList);
        }
      });
    },

    // 山洪未来3小时积水深度排行
    getshJssdData() {
      this.sHjssdRainRankList = [];
      getShJsPhWL({
        taskTime: this.taskSelectedTime
      }).then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            this.sHjssdRainRankList.push({
              name: item.shengname + "-" + item.shiname,
              sum: item.maxjssd,
              datatime: item.datatime,
              xzqdm: item.xzqdm
            });
          });
          // this.getShTimeData(this.shValue, this.shValue, '')
          this.getJsSd('DL')
          this.initChart(this.sHjssdRainRankList);
        }
      });
    },


    // 右下图表
    initChart(data) {
      const chart = document.getElementById("sum-chart-dom");
      this.myChart = echarts.init(chart);
      let unitName = "降雨量/mm";
      let name = "降雨量";
      let series = [
        {
          name: "累计" + name,
          type: "bar",
          barWidth: 14,
          itemStyle: {
            normal: {
              barBorderRadius: 5,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "rgba(0,210,255,1)"
                },
                {
                  offset: 1,
                  color: "rgba(0,187,255,0)"
                }
              ])
            }
          },
          data: data.map(v => v.sum)
        },
        {
          name: "最大小时" + name,
          type: "line",
          smooth: true, //平滑曲线显示
          showAllSymbol: true, //显示所有图形。
          symbol: "none", //标记的图形为实心圆
          lineStyle: {
            color: new echarts.graphic.LinearGradient(
              0,
              0,
              1,
              1,
              [
                {
                  offset: 0,
                  color: "rgba(55,249,173,1)"
                },
                {
                  offset: 0.333,
                  color: "rgba(55,249,173,1)"
                },
                {
                  offset: 0.666,
                  color: "rgba(0,237,159,1)"
                },
                {
                  offset: 1,
                  color: "rgba(55,249,173,1)"
                }
              ],
              false
            )
          },

          data: data.map(v => v.max)
        },
        {
          name: "小时最大格网" + name,
          type: "line",
          smooth: true, //平滑曲线显示
          showAllSymbol: true, //显示所有图形。
          symbol: "none", //标记的图形为实心圆
          lineStyle: {
            color: new echarts.graphic.LinearGradient(
              0,
              0,
              1,
              1,
              [
                {
                  offset: 0,
                  color: "rgba(83,255,180,0)"
                },
                {
                  offset: 0.333,
                  color: "rgb(249,142,55)"
                },
                {
                  offset: 0.666,
                  color: "rgb(249,142,55)"
                },
                {
                  offset: 1,
                  color: "rgba(71,255,211,0)"
                }
              ],
              false
            )
          },
          data: data.map(v => v.maxgw),
          itemStyle: {
            color: '#fbc21c'
          }
        }
      ]
      if (this.disasterTypeIndex === 1) {
        unitName = "降雨量/mm";
      } else if (this.disasterTypeIndex === 2) {
        unitName = "降雨量/mm";
        series = [
          {
            name: "累计" + name,
            type: "bar",
            barWidth: 14,
            itemStyle: {
              normal: {
                barBorderRadius: 5,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "rgba(0,210,255,1)"
                  },
                  {
                    offset: 1,
                    color: "rgba(0,187,255,0)"
                  }
                ])
              }
            },
            data: data.map(v => v.sum)
          }
        ]
      } else if (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) {
        unitName = "积水深度/m";
        name = "积水深度"
        series = [
          {
            name: "最大" + name,
            type: "bar",
            barWidth: 14,
            itemStyle: {
              normal: {
                barBorderRadius: 5,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "rgba(0,210,255,1)"
                  },
                  {
                    offset: 1,
                    color: "rgba(0,187,255,0)"
                  }
                ])
              }
            },
            data: data.map(v => v.sum)
          }
        ]
      }
      // 计算 start 和 end
      // 计算初始的 start 和 end
      // 示例数据（假设有 50 个数据点）
      var totalDataCount = data.length;
      var fixedDisplayCount = 4; // 默认显示的数据条数
      var startIndex = 0;
      var endIndex = (fixedDisplayCount / totalDataCount) * 100;
      const option = {
        grid: {
          top: "12%",
          left: "10%",
          right: "5%",
          bottom: "75px" //也可设置left和right设置距离来控制图表的大小
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
            label: {
              show: false
            }
          },
          formatter: function (params) {
            console.log("params", params);

            let result = params[0].name + '<br/>';
            params.forEach(item => {
              result += item.marker + ' ' + item.seriesName + ': ' + item.value + '' + (item.seriesName == '累计降雨量' ? 'mm' : item.seriesName == '最大小时降雨量' ? 'mm' : item.seriesName == '小时最大格网降雨量' ? 'mm' : 'm') + '<br/>';
            });
            return result;
          }
        },
        legend: {
          show: false
        },
        xAxis: {
          data: data.map(v => v.name),
          axisLine: {
            show: true, //隐藏X轴轴线
            lineStyle: {
              color: "rgba(150,195,255,0.5)"
            }
          },
          axisTick: {
            show: false //隐藏X轴刻度
          },
          axisLabel: {
            show: true,
            interval: 0,
            textStyle: {
              color: "#fff", //X轴文字颜色
              fontSize: 12
            },
            width: 50,
            overflow: "break"
          }
        },
        yAxis: [
          {
            type: "value",
            name: unitName,
            nameTextStyle: {
              color: "#fff",
              padding: [0, 0, 0, 16],
              fontSize: 12
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: "rgba(72,102,142,0.74)"
              }
            },
            axisTick: {
              show: false
            },
            axisLine: {
              show: false
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: "#fff"
              }
            }
          }
        ],
        series: series,
        dataZoom: {
          type: "slider", // 缩放组件类型 inside 放置在内部 zoomslider 放置在右侧
          start: startIndex,
          end: endIndex
        }
      };
      this.myChart.setOption(option, true);
    },
    tjtTabCheck() {
      this.wlsxsjyRainRankList = [];
      if (this.tjuTabChke == '未来三小时') {
        this.tjuTabChke = '六小时累计'
        this.getJsData()
      } else {
        this.tjuTabChke = '未来三小时'
        this.getSixData()


      }
    },
    // 获取六小时累计数据
    getSixData(type) {
      this.wlsxsjyRainRankList = []
      let params = {
        orderType: type || '',
        taskTime: this.taskSelectedTime
      }
      geWlSixData(params).then(res => {
        res.data.forEach(item => {
          this.wlsxsjyRainRankList.push({
            name: item.xianname + "-" + item.shiname + "-" + item.shengname,
            max: item.maxjy,
            sum: item.sumjy,
            maxgw: item.maxgwjy,
            xzqdm: item.xzqdm,
            xiandm: item.xiandm,
            dateTime: item.pgtime
          });
        });
        this.initChart(this.wlsxsjyRainRankList);
      })
    },

    // 钻取详情
    openDetailsChart(item) {
      this.detailsTitleXzqh = item.name;
      this.tableDirllObj = item
      this.isInitTableChart = false;
      this.searchXzqfw(item.xzqdm);
      if (this.disasterTypeIndex === 1) {
        this.isByDetailsChart = true;
        this.$nextTick(() => {
          this.getJsDataXz(item);
        });
      } else if (this.disasterTypeIndex === 2) {
        this.isSkDetailsChart = true;
        this.$nextTick(() => {
          this.getSkJsDataXz(item);
        });
      } else if (this.disasterTypeIndex === 3) {
        this.isJsDetailsChart = true;
        this.searchJCQfw(item.xzqdm);
        this.$nextTick(() => {
          if (this.csnlValue == 1) {
            this.getJsSd('DL')
            this.getJssdDataXz(item);
          } else {
            this.getJSsdXzMes(item)
          }

          // getjcqAndShLk({ xzqdm: item.xzqdm, xzqType: 1 }).then(res => {
          //   this.$refs.threeMap.JCQPolyline(res.data)
          // })
          // this.setJsChartLine(item)
        });
      } else if (this.disasterTypeIndex === 4) {
        this.isJsDetailsChart = true;
        this.searchSHfw(item.xzqdm)
        this.$nextTick(() => {
          if (this.shValue == 1) {
            this.getJsSd('DL')
            this.getShJssdDataXz(item);
          } else {
            this.getShJsGQXZ(item)
          }
          // getjcqAndShLk({ xzqdm: item.xzqdm, xzqType: 2 }).then(res => {
          //   this.$refs.threeMap.shqPolyline(res.data)
          // })
        });
      }
    },
    // 积水深度排行下钻详情
    getJSsdXzMes(item) {
      this.jsDatailsLineData = null
      let params = {
        taskTime: this.taskSelectedTime,
        xzqdm: item.xzqdm
      }
      getSKLSJssdDataXz(params).then(res => {
        if (res.code === 200) {
          this.jsDatailsLineData = res.data;
          this.getSKLSSJZ(item.xzqdm)
          // this.getShTimeData(this.csnlValue, this.csnlValue, item.xzqdm)
          this.jsChartType = 'hour'
          this.setJsChartLine(this.jsDatailsLineData.hour);
        }
      })
    },
    // 详情返回
    returnToInitTableChart() {
      this.timeTabActive = 2;
      this.isInitTableChart = true;
      this.isByDetailsChart = false;
      this.isSkDetailsChart = false;
      this.isJsDetailsChart = false;
      earthMap.layerManager.clearHightLayer();
      // this.$refs.threeMap.clearLine()
      earthMap.setZoom(5);
      earthMap.zoomToExtent([110.55, 29.32]);
      this.tableDirllObj.xzqdm = ''
      this.$nextTick(() => {
        if (this.disasterTypeIndex === 1) {
          this.getByyjcsData(); // 初始化加载暴雨预警数据
          this.getJsData(); // 初始化加载未来三日降水排行数据
          this.initChart(this.wlsxsjyRainRankList);
        } else if (this.disasterTypeIndex === 2) {
          this.initChart(this.skjsRainRankList);
        } else if (this.disasterTypeIndex === 3) {
          this.tabDisasterType(3)
        } else if (this.disasterTypeIndex === 4) {
          this.tabDisasterType(4)
        }
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
        xzqdm: item.xiandm
      }).then(res => {
        if (res.code === 200) {
          this.byDatailsBarData = res.data;
          this.setByChartBar(this.byDatailsBarData[this.byChartType]);
        }
      });
    },
    setByChartBar(data) {
      let chartLine = document.getElementById("byDetailsChart");
      this.myDetailsChart = echarts.init(chartLine);
      let option = {
        tooltip: {
          trigger: "axis",
          // formatter: function (params) {
          //   let result = params[0].name + '<br/>';
          //   params.forEach(item => {
          //     result += item.marker + ' ' + item.seriesName + ': ' + item.value + '' + 'mm' + '<br/>';
          //   });
          //   return result;
          // }
        },
        grid: {
          top: "15",
          bottom: "50",
          left: "120",
          right: "30"
        },
        xAxis: {
          // 刻度值颜色
          axisLabel: {
            textStyle: {
              color: "#ffffff"
            }
          },
          // x轴对应刻度背景先颜色
          splitLine: {
            show: false,
            lineStyle: {
              type: "dashed",
              color: "#ffffff"
            }
          },
          type: "value"
        },
        yAxis: {
          // 去掉刻度
          axisTick: {
            show: false
          },
          // 修改刻度线颜色
          axisLine: {
            show: false,
            lineStyle: {
              color: "rgba(255, 255, 255, 0.65)"
            }
          },
          // 刻度值颜色
          axisLabel: {
            textStyle: {
              color: "#ffffff"
            }
          },
          type: "category",
          data: data.map(v => v.datatime)
        },
        // dataZoom: [
        //   {
        //     type: "slider",
        //     orient: "vertical",
        //     yAxisIndex: 0,
        //     start: 100,
        //     end: 40,
        //     left: 35,
        //     width: 15,
        //     textStyle: false
        //   }
        // ],
        series: [
          {
            name: "警戒线",
            type: "line",
            symbol: "circle",
            symbolSize: 8,
            itemStyle: {
              normal: {
                type: "dashed",
                color: 'red',
                lineStyle: {
                  color: 'red',
                }
              }
            },
            markLine: {
              silent: true,
              label: {
                position: "top"
              },
              data: [{
                xAxis: 20,
                label: {
                  show: true,
                  position: '',
                }
              }]
            }
          },
          {
            name: "降雨量",
            data: data.map(v => v.jyl),
            type: "bar",
            barWidth: 14,
            itemStyle: {
              color: "#4de9ff"
            }
          }
        ]
      };
      this.myDetailsChart.setOption(option);
    },
    //实况降雨
    getSkJsDataXz(item) {
      getSkJsDataXz({
        skTime: this.taskSelectedTime,
        xzqdm: item.xzqdm,
        skType: this.liveRainType
      }).then(res => {
        if (res.code === 200) {
          this.setSkChartBar(res.data);
        }
      });
    },
    setSkChartBar(data) {
      let chartLine = document.getElementById("skDetailsChart");
      this.myDetailsChart = echarts.init(chartLine);
      let option = {
        tooltip: {
          trigger: "axis",
          formatter: function (params) {
            let result = params[0].name + '<br/>';
            params.forEach(item => {
              result += item.marker + ' ' + item.seriesName + ': ' + item.value + '' + 'mm' + '<br/>';
            });
            return result;
          }
        },
        grid: {
          top: "15",
          bottom: "50",
          left: "120",
          right: "30"
        },
        xAxis: {
          // 刻度值颜色
          axisLabel: {
            textStyle: {
              color: "#ffffff"
            }
          },
          // x轴对应刻度背景先颜色
          splitLine: {
            show: false,
            lineStyle: {
              type: "dashed",
              color: "#ffffff"
            }
          },
          type: "value"
        },
        yAxis: {
          // 去掉刻度
          axisTick: {
            show: false
          },
          // 修改刻度线颜色
          axisLine: {
            lineStyle: {
              color: "rgba(255, 255, 255, 0.65)"
            }
          },
          // 刻度值颜色
          axisLabel: {
            textStyle: {
              color: "#ffffff"
            }
          },
          type: "category",
          data: data.map(v => v.datatime)
        },
        // dataZoom: [
        //   {
        //     type: "slider",
        //     orient: "vertical",
        //     yAxisIndex: 0,
        //     start: 100,
        //     end: 40,
        //     left: 35,
        //     width: 15,
        //     textStyle: false
        //   }
        // ],
        series: [
          {
            name: "警戒线",
            type: "line",
            symbol: "circle",
            symbolSize: 8,
            itemStyle: {
              normal: {
                type: "dashed",
                color: 'red',
                lineStyle: {
                  color: 'red',
                }
              }
            },
            markLine: {
              silent: true,
              label: {
                position: "top"
              },
              data: [{
                xAxis: 20,
                label: {
                  show: true,
                  position: '',
                }
              }]
            }
          },
          {
            name: "降水量",
            data: data.map(v => v.jsl),
            type: "bar",
            barWidth: 14,
            itemStyle: {
              color: "#4de9ff"
            }
          }
        ]
      };
      this.myDetailsChart.setOption(option);
    },
    // 积水深度
    jsChangeChartType(type) {
      this.jsChartType = type;
      this.setJsChartLine(this.jsDatailsLineData[this.jsChartType]);
    },
    getJssdDataXz(item) {
      this.jsDatailsLineData = null
      getJssdDataXz({
        taskTime: this.taskSelectedTime,
        xzqdm: item.xzqdm
      }).then(res => {
        if (res.code === 200) {
          this.jsDatailsLineData = res.data;
          this.setJsChartLine(this.jsDatailsLineData[this.jsChartType]);
        }
      });
    },
    // 山洪未来下钻
    getShJssdDataXz(item) {
      this.jsDatailsLineData = null
      getShJsWLXZ({
        taskTime: this.taskSelectedTime,
        xzqdm: item.xzqdm
      }).then(res => {
        if (res.code === 200) {
          this.jsDatailsLineData = res.data;
          this.setJsChartLine(this.jsDatailsLineData[this.jsChartType]);
        }
      });
    },
    // 山洪过去下钻
    getShJsGQXZ(item) {
      this.jsDatailsLineData = null
      getShJsGQXZ({
        taskTime: this.taskSelectedTime,
        xzqdm: item.xzqdm
      }).then(res => {
        if (res.code === 200) {
          this.jsDatailsLineData = res.data;
          // this.timeTabActive = 1;
          this.getShTimeData(this.shValue, this.shValue, item.xzqdm)
          this.setJsChartLine(this.jsDatailsLineData[this.jsChartType]);
        }
      });
    },
    setJsChartLine(data) {
      let chartLine = document.getElementById("jsDetailsChart");
      this.myDetailsChart = echarts.init(chartLine);
      let series = []
      if (this.jsChartType === 'hour') {
        series = [
          {
            name: "累计降雨量",
            data: data.map(v => v.ljjyl),
            type: "line",
            xAxisIndex: 0,
            symbol: "none",
            smooth: true,
            itemStyle: {
              color: "#1EF2FF"
            }
          },
          {
            name: "最大积水深度",
            data: data.map(v => v.maxjsl),
            type: "line",
            symbol: "none",
            smooth: true,
            // 坐标轴右侧添加刻度
            xAxisIndex: 1,
            itemStyle: {
              color: "#4295FF"
            }
          }
        ]
      } else if (this.jsChartType === 'minute') {
        series = [
          {
            name: "累计降雨量",
            data: data.map(v => v.ljjyl),
            type: "line",
            xAxisIndex: 0,
            symbol: "none",
            smooth: true,
            itemStyle: {
              color: "#1EF2FF"
            }
          },
          {
            name: "最大积水量",
            data: data.map(v => v.maxjsl),
            type: "line",
            symbol: "none",
            smooth: true,
            // 坐标轴右侧添加刻度
            xAxisIndex: 1,
            itemStyle: {
              color: "#FF8F21"
            }
          }
        ]
      }
      let option = {
        tooltip: {
          trigger: "axis",
          // extraCssText: 'transform:rotate(-180deg)',
          formatter: function (params) {
            let result = params[0].name + '<br/>';
            params.forEach(item => {
              result += item.marker + ' ' + item.seriesName + ': ' + item.value + '' + (item.seriesName == '累计降雨量' ? 'mm' : 'm') + '<br/>';
            });
            return result;
          }
        },
        // 添加图例，若不显示，是series要添加name属性
        legend: {
          show: true,
          textStyle: { fontSize: 14, color: "#ffffff" }
          // 将图例显示到右侧
          // orient: "horizontal", // 垂直显示 vertical horizontal
          // y: "center", // 延Y轴居中
          // x: "left", // 居右显示
          // align: "left" // 颜色在左边
        },
        // 图距离右边的边距
        grid: {
          top: "70px",
          bottom: "40",
          left: "120px",
          right: "50px"
        },
        xAxis: [
          {
            name: "  降\n  水\n  量\n(mm)",
            nameTextStyle: {
              // y轴单位的颜色
              color: "#ffffff",
              rotate: "90deg"
            },
            type: "value",
            // 刻度值颜色
            axisLabel: {
              textStyle: {
                color: "#ffffff"
              }
            },
            // y轴对应刻度背景先颜色
            splitLine: {
              show: false,
              lineStyle: {
                type: "dashed",
                color: "#ffffff"
              }
            }
          },
          {
            name: " 积\n 水\n 量\n(m)",
            nameTextStyle: {
              // y轴单位的颜色
              color: "#ffffff"
            },
            type: "value",
            // 刻度值颜色
            axisLabel: {
              textStyle: {
                color: "#ffffff"
              }
            },
            // y轴对应刻度背景先颜色
            splitLine: {
              show: false,
              lineStyle: {
                type: "dashed",
                color: "#ffffff"
              }
            }
          }
        ],
        yAxis: [
          {
            axisLine: {
              show: false
            },
            nameTextStyle: {
              // y轴单位的颜色
              color: "#ffffff"
            },
            axisTick: {
              show: false
            },
            // 刻度值颜色
            axisLabel: {
              textStyle: {
                color: "#ffffff"
              }
            },
            // y轴对应刻度背景先颜色
            splitLine: {
              show: false,
              lineStyle: {
                type: "dashed",
                color: "#ffffff"
              }
            },
            type: "category",
            data: data.map(v => v.datatime)
          }
        ],
        series: series
      };
      this.myDetailsChart.setOption(option, true);
    },
    // 任务列表点击
    taskItemClick(item) {
      this.taskSelectedTime = item == 'new' ? this.taskList[0].tasktime : item.tasktime;
      this.$refs.threeMap.clearEffect()
      this.nlthreeCreated = 1
      this.removeMapAllMaker()
      this.taskStatus = item.lostdata
      //this.newTime = this.taskSelectedTime
      this.getNowTime();
      if (this.disasterTypeIndex === 1) {
        this.getByyjcsData()
        this.getJsData()
      } else if (this.disasterTypeIndex === 3) {

        if (this.csnlValue == 1) {
          this.getNlyjcsData();
          this.getJssdData();
        } else {
          this.getJsGqthreeData()
          this.getNlyjcsGqThreeData()
        }
      } else if (this.disasterTypeIndex === 4) {

        if (this.shValue == 1) {
          this.getshyjcsData();
          this.getshJssdData();
        } else {
          this.getshYjGqData()
          this.getShGqthreeData()
        }
      }

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
      if (this.timeTabActive === 1) {
        this.getJsSd('SK')
      } else {
        this.getJsSd('DL')
      }
      // if (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) {
      //   if (this.timeTabActive === 1) {
      //     this.getShTimeData(1, 2, '')
      //   } else {
      //     this.getShTimeData(1, 1, '')
      //   }
      // }
      // console.log(this.timeTabActive,'点击的切换')
      // getJssdData()
    },
    duanlinTimeChange(index) {
      this.dltimeTabActive = index;
      if (index == 1) {
        dljySixMinSjz({ taskTime: this.taskSelectedTime, }).then(res => {
          if (res.code === 200) {
            this.timeData = res.data;
            this.initTimeLine(); // 初始化时间轴
          } else {
            this.timeData = [];
            this.initTimeLine(); // 初始化时间轴
          }
        })
      } else if (index == 2) {
        dljyOnehoursSjz({ taskTime: this.taskSelectedTime, }).then(res => {
          if (res.code === 200) {
            this.timeData = res.data;
            this.initTimeLine(); // 初始化时间轴
          } else {
            this.timeData = [];
            this.initTimeLine(); // 初始化时间轴
          }
        })
      } else if (index == 3) {
        dljyThreeHoursSjz({ taskTime: this.taskSelectedTime }).then(res => {
          if (res.code === 200) {
            this.timeData = res.data;
            this.initTimeLine(); // 初始化时间轴
          } else {
            this.timeData = [];
            this.initTimeLine(); // 初始化时间轴
          }
        })
      }
    }
  },
  mounted() {
    // 获取 # 后面的所有内容
    // const hash = window.location.hash;
    // // 分割路径和查询参数
    // const [path, queryString] = hash.split('?');
    // const params = new URLSearchParams(queryString);
    // if (params.get('token')) {
    //   getToken({
    //     token: this.$route.query.token,
    //   }).then(res => {
    //     if (!res) {
    //       window.open(webConfig.jcWebAddress, '_self');
    //     }
    //   }).catch((err) => { 
    //     console.log(err);
    //     window.open(webConfig.jcWebAddress, '_self');
    //   });

    // } else {
    //   window.open(webConfig.jcWebAddress, '_self');
    // }

    // 根据窗口大小变化
    const _this = this;
    window.addEventListener("resize", function () {
      if (_this.myChart) {
        _this.myChart.resize();
      }
      if (_this.myDetailsChart) {
        _this.myDetailsChart.resize();
      }
    });
    this.getTaskList(1); // 初始化加载任务列表
    //js监听地图点位的class点击事件
    document.addEventListener(
      "click",
      function (event) {
        // 检查目标元素是否具有特定的类名
        if (event.target.classList.contains("marker_img")) {
          event.stopPropagation();
          const itemData = JSON.parse(event.target.getAttribute("item"));
          _this.openDetailsChart(itemData);
        }
      },
      false
    );
    // 定时刷新接口
    this.setIntervalTime = setInterval(() => {
      let params = {
        taskTime: this.taskSelectedTime,
        taskType: this.disasterTypeIndex == 3 && this.csnlValue == 1 ? '2' : this.disasterTypeIndex == 3 && this.csnlValue == 2 ? '4' : this.disasterTypeIndex == 2 ? '3' : 1
      }
      resetList(params).then(res => {
        if (res.code == 200) {
          if (res.data == 'true') {
            // case中第一个if是判断是否是详情页面
            switch (this.disasterTypeIndex) {
              case 1:
                if (this.isByDetailsChart) {
                  this.$nextTick(() => {
                    this.getJsDataXz(this.tableDirllObj);
                  });
                } else {
                  this.getTaskList(1);
                  if (this.tjuTabChke == '六小时累计') {
                    this.getSixData()
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
                    })
                  } else {
                    this.getTaskList(2);
                  }
                } else {
                  if (this.isJsDetailsChart) {
                    this.$nextTick(() => {
                      this.getJSsdXzMes(this.tableDirllObj);
                    })
                  } else {
                    this.getTaskList(4)
                  }
                }
                break;
              case 4:
                break;
            }
          }
        }
      })



    }, 50000)

  },
  beforeDestroy() {
    if (this.setIntervalTime) {
      clearInterval(this.setIntervalTime)
      this.setIntervalTime = null
    }
  },
};
</script>

<style scoped lang="less">
@import "./index.less";
</style>
<style lang="less">
.tooltipStyle {
  .ant-tooltip-inner {
    border: 1px solid #FFAD00 !important;
    background-color: rgba(8, 34, 60, 1);
  }
}
</style>
