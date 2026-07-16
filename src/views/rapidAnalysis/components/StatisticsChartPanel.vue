<template>
  <div class="statistics-chart-panel">
    <div class="chart-box-title">
      <span class="title-text" :title="displayTitle">{{ displayTitle }}</span>
    </div>
    <div class="sum-chart-box">
      <div v-if="noData" class="no-data-tip chart-no-data">无数据</div>
      <div
        ref="chartEl"
        class="sum-chart-dom"
        v-show="!noData"
      ></div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { buildSumChartOption } from "../modules/charts";

export default {
  name: "StatisticsChartPanel",
  props: {
    title: { type: String, default: "" },
    tjuTabChke: { type: String, default: "六小时累计" },
    disasterTypeIndex: { type: Number, default: 1 },
    noData: { type: Boolean, default: false }
  },
  data() {
    return {
      chart: null
    };
  },
  computed: {
    displayTitle() {
      if (this.tjuTabChke !== "六小时累计") {
        return this.title.replace("未来三小时", "未来3h+过去3h");
      }
      return this.title;
    }
  },
  beforeDestroy() {
    this.dispose();
  },
  methods: {
    /** 对外：渲染排行统计图，返回 echarts 实例供父组件兼容 */
    render(data) {
      if (!this.$refs.chartEl) {
        return null;
      }
      const list = data || [];
      if (!this.chart) {
        this.chart = echarts.init(this.$refs.chartEl);
      }
      this.chart.setOption(
        buildSumChartOption(list, this.disasterTypeIndex),
        true
      );
      return this.chart;
    },
    resize() {
      if (this.chart) {
        this.chart.resize();
      }
    },
    dispose() {
      if (this.chart) {
        try {
          this.chart.dispose();
        } catch (e) {
          /* ignore */
        }
        this.chart = null;
      }
      if (this.$refs.chartEl) {
        this.$refs.chartEl.innerHTML = "";
      }
    }
  }
};
</script>

<style scoped lang="less">
.chart-box-title {
  height: 0.4rem;
  padding-left: 0.4rem;
  background: url(../../../assets/images/rapidAnalysis/title_bg.png) no-repeat
    -0.25rem center;
  background-size: 100% 100%;

  .title-text {
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
  }
}

.sum-chart-box {
  width: 100%;
  background: linear-gradient(
    180deg,
    rgba(50, 116, 192, 0.31) 6%,
    rgba(0, 7, 27, 0.34) 93%
  );
  height: 40vh;
  overflow: hidden;

  .sum-chart-dom {
    width: 100%;
    height: 100%;
  }
}

.no-data-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ffffff;
  font-size: 0.16rem;
  font-weight: 600;
}
</style>
