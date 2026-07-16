<template>
  <div
    :id="id"
    :ref="id"
    :class="['echarts-hzs', className]"
    :style="{width: width, height: height}"
  >
  </div>
</template>

<script>
import * as echarts from "echarts";
import {mapReplace} from "./index";

const TITLECOLOR = '#333';
const CHARTCOLORLIST = ["#E6AA7B", "#F67FB0", "#65D2AA", "#E786E5", "#74D4D3", "#D297F2", "#70C6D5", "#AC7CED", "#7FAFE0", "#8493F3"];

export default {
  name: "PieChart",
  props: {
    id: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      default: 'pie-chart-hzs'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '100%'
    },
    option: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      myChart: null
    }
  },
  watch: {
    option() {
      setTimeout(_ => {
        this.initChart();
      }, 220)
    }
  },
  mounted() {
    setTimeout(_ => {
      this.initChart();
    }, 220)
    window.addEventListener('resize', () => {
      if (this.myChart) {
        setTimeout(() => {
          this.myChart.resize();
        }, 520);
      }
    });
  },
  methods: {
    // 初始化
    initChart() {
      // 实例化
      if (this.myChart == null) this.myChart = echarts.init(document.getElementById(this.id));
      // 配置项
      let option = {
        // 图例
        legend: {
          show: true,
          textStyle: {
            color: TITLECOLOR
          }
        },
        // 提示框
        tooltip: {},
        // 颜色组
        color: CHARTCOLORLIST,
        // 存放所有的主要数据
        series: [
          {
            name: '',
            type: 'pie',
            radius: '55%', // 环形图可以改成 ['30%', '70%']
            center: ['50%', '50%'],
            roseType: false, // 需要玫瑰图？把这个改成 area
            data: [],
          }
        ]
      };
      // 白名单
      let whiteList = ['color', 'data', 'center', 'radius'];
      // 接收的配置项
      let propsOption = this.option;
      // 递归循环替换
      mapReplace(propsOption, option, whiteList);
      // 数据项过多时会导致图例遮挡图表 把图例改为scroll形式
      if (option.series[0].data.length > 4) {
        option.legend.type = 'scroll';
      }
      // 可视化
      this.myChart.setOption(option);
    },
  },
}
</script>

<style scoped>

</style>
