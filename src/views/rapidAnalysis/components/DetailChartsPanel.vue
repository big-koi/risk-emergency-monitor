<template>
  <div class="detail-charts-panel">
    <!-- 详情图表-暴雨 -->
    <div class="statisticalDetailsChart" v-show="mode === 'by'">
      <div class="chart-box-title">
        <span
          class="title-text"
          :title="`${title}逐 ${byChartType === 'hour' ? '小时' : '6分钟'}最大降雨量`"
        >{{ title }}逐{{ byChartType === "hour" ? "小时" : "6分钟" }}最大降雨量</span>
        <span class="return-btn" @click="$emit('back')">
          <a-icon type="left" class="return-icon" />返回
        </span>
      </div>
      <div class="chart-box">
        <div class="tool-box">
          <ul class="chart-tab-box">
            <li
              :class="{ active: byChartType === 'hour' }"
              @click="$emit('by-chart-type', 'hour')"
            >
              逐小时
            </li>
            <li
              :class="{ active: byChartType === 'minute' }"
              @click="$emit('by-chart-type', 'minute')"
            >
              逐6分钟
            </li>
          </ul>
        </div>
        <div class="chart-box-content">
          <div class="chart-item" ref="byChartEl"></div>
        </div>
      </div>
    </div>

    <!-- 详情图表-实况 -->
    <div class="statisticalDetailsChart" v-show="mode === 'sk'">
      <div class="chart-box-title">
        <span class="title-text" :title="title">{{ title }}每小时最大降雨量</span>
        <span class="return-btn" @click="$emit('back')">
          <a-icon type="left" class="return-icon" />返回
        </span>
      </div>
      <div class="chart-box">
        <div class="chart-box-content" style="height: calc(100% - 0.08rem);">
          <div class="chart-item" ref="skChartEl"></div>
        </div>
      </div>
    </div>

    <!-- 详情图表-积水/山洪 -->
    <div class="statisticalDetailsChart" v-show="mode === 'js'">
      <div class="chart-box-title">
        <span
          class="title-text"
          :title="`${title}逐${byChartType === 'hour' ? '小时' : '6分钟'}最大积水深度`"
        >{{ title }}逐{{ byChartType === "hour" ? "小时" : "6分钟" }}最大积水深度</span>
        <span class="return-btn" @click="$emit('back')">
          <a-icon type="left" class="return-icon" />返回
        </span>
      </div>
      <div class="chart-box">
        <div class="tool-box" v-if="csnlValue == 1">
          <ul class="chart-tab-box">
            <li
              :class="{ active: jsChartType === 'hour' }"
              @click="$emit('js-chart-type', 'hour')"
            >
              逐小时
            </li>
            <li
              :class="{ active: jsChartType === 'minute' }"
              @click="$emit('js-chart-type', 'minute')"
            >
              逐6分钟
            </li>
          </ul>
        </div>
        <div class="chart-box-content">
          <div class="chart-item" ref="jsChartEl"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DetailChartsPanel",
  props: {
    /** by | sk | js | '' */
    mode: { type: String, default: "" },
    title: { type: String, default: "" },
    byChartType: { type: String, default: "hour" },
    jsChartType: { type: String, default: "hour" },
    csnlValue: { type: [String, Number], default: "1" }
  },
  methods: {
    getChartEl(kind) {
      if (kind === "by") return this.$refs.byChartEl;
      if (kind === "sk") return this.$refs.skChartEl;
      if (kind === "js") return this.$refs.jsChartEl;
      return null;
    }
  }
};
</script>

<style scoped lang="less">
.statisticalDetailsChart {
  position: fixed;
  top: 0.88rem;
  right: 0rem;
  z-index: 99;
  width: 4.4rem;
  background: linear-gradient(
    180deg,
    rgba(50, 116, 192, 0.31) 6%,
    rgba(0, 7, 27, 0.34) 93%
  );
  box-shadow: 0rem 0.02rem 0.08rem 0rem rgba(0, 0, 0, 0.12);
  border: none;
  padding: 0;
  padding-top: 0.1rem;
  height: calc(100vh - 1rem);
  overflow-y: auto;
  color: #fff;

  .chart-box-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 0.4rem;
    padding-right: 0.04rem;
    height: 0.4rem;
    background: url(../../../assets/images/rapidAnalysis/title_bg.png) no-repeat
      -0.25rem center;
    background-size: 100% 100%;

    .title-text {
      width: 85%;
      font-size: 0.2rem;
      font-weight: bold;
      background-image: linear-gradient(
        to bottom,
        rgba(49, 190, 255, 1),
        rgba(255, 255, 255, 1)
      );
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      padding-bottom: 0.1rem;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .return-btn {
      display: flex;
      align-items: center;
      font-size: 0.14rem;
      font-weight: bold;
      cursor: pointer;
      padding-bottom: 0.1rem;

      .return-icon {
        font-size: 10px;
        padding-right: 0.04rem;
      }
    }
  }

  .chart-box {
    height: calc(100% - 0.5rem);
    background: linear-gradient(
      180deg,
      rgba(50, 116, 192, 0.31) 6%,
      rgba(0, 7, 27, 0.34) 93%
    );
    margin-top: 0.07rem;
    padding-top: 0.12rem;

    .tool-box {
      display: flex;
      justify-content: right;
      padding: 0 0.2rem;

      .chart-tab-box {
        margin-left: 0;
      }
    }

    .chart-tab-box {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.48rem;
      background: linear-gradient(0deg, #16446e 0%, #030c16);
      border: 0.5px solid;
      border-image: linear-gradient(
          270deg,
          #1b94ff 100%,
          #81c7ff 51%,
          #219aff 0%
        )
        0.5 0.5;
      border-radius: 6px;
      box-shadow: 0px 0px 20px 0px #013f74 inset;
      margin-left: 2.8rem;
      margin-bottom: 0.12rem;

      li {
        width: 50%;
        height: 0.3rem;
        line-height: 0.3rem;
        text-align: center;
        cursor: pointer;

        &.active {
          background: linear-gradient(341deg, #0e7ce1 13%, #005ec7 96%);
        }
      }
    }

    .chart-box-content {
      height: calc(100% - 0.48rem);

      .chart-item {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
