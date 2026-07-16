/**
 * 详情钻取图 ECharts option 构建
 */

function axisMmTooltipFormatter(params) {
  let result = params[0].name + "<br/>";
  params.forEach(item => {
    result +=
      item.marker +
      " " +
      item.seriesName +
      ": " +
      item.value +
      "mm<br/>";
  });
  return result;
}

function buildHorizontalBarAxes(data) {
  return {
    xAxis: {
      axisLabel: { textStyle: { color: "#ffffff" } },
      splitLine: {
        show: false,
        lineStyle: { type: "dashed", color: "#ffffff" }
      },
      type: "value"
    },
    yAxis: {
      axisTick: { show: false },
      axisLine: {
        show: true,
        lineStyle: { color: "rgba(255, 255, 255, 0.65)" }
      },
      axisLabel: { textStyle: { color: "#ffffff" } },
      type: "category",
      data: (data || []).map(v => v.datatime)
    }
  };
}

function buildWarningLineSeries() {
  return {
    name: "警戒线",
    type: "line",
    symbol: "circle",
    symbolSize: 8,
    itemStyle: {
      normal: {
        type: "dashed",
        color: "red",
        lineStyle: { color: "red" }
      }
    },
    markLine: {
      silent: true,
      label: { position: "top" },
      data: [
        {
          xAxis: 20,
          label: { show: true, position: "" }
        }
      ]
    }
  };
}

/** 短临详情：逐小时 / 6 分钟降雨条形图 */
export function buildByDetailChartOption(data) {
  const list = data || [];
  const axes = buildHorizontalBarAxes(list);
  return {
    tooltip: {
      trigger: "axis",
      formatter: axisMmTooltipFormatter
    },
    grid: { top: "15", bottom: "50", left: "120", right: "30" },
    xAxis: axes.xAxis,
    yAxis: axes.yAxis,
    series: [
      buildWarningLineSeries(),
      {
        name: "降雨量",
        data: list.map(v => v.jyl),
        type: "bar",
        barWidth: 14,
        itemStyle: { color: "#4de9ff" }
      }
    ]
  };
}

/** 实况详情：每小时降雨条形图 */
export function buildSkDetailChartOption(data) {
  const list = data || [];
  const axes = buildHorizontalBarAxes(list);
  // 实况 y 轴 axisLine 无 show:true（保持旧行为）
  axes.yAxis.axisLine = {
    lineStyle: { color: "rgba(255, 255, 255, 0.65)" }
  };
  return {
    tooltip: {
      trigger: "axis",
      formatter: axisMmTooltipFormatter
    },
    grid: { top: "15", bottom: "50", left: "120", right: "30" },
    xAxis: axes.xAxis,
    yAxis: axes.yAxis,
    series: [
      buildWarningLineSeries(),
      {
        name: "降水量",
        data: list.map(v => v.jsl),
        type: "bar",
        barWidth: 14,
        itemStyle: { color: "#4de9ff" }
      }
    ]
  };
}

/** 内涝/山洪详情：双轴折线 */
export function buildJsDetailChartOption(data, jsChartType) {
  const list = data || [];
  const isMinute = jsChartType === "minute";
  const series = [
    {
      name: "累计降雨量",
      data: list.map(v => v.ljjyl),
      type: "line",
      xAxisIndex: 0,
      symbol: "none",
      smooth: true,
      itemStyle: { color: "#1EF2FF" }
    },
    {
      name: isMinute ? "最大积水量" : "最大积水深度",
      data: list.map(v => v.maxjsl),
      type: "line",
      symbol: "none",
      smooth: true,
      xAxisIndex: 1,
      itemStyle: { color: isMinute ? "#FF8F21" : "#4295FF" }
    }
  ];

  return {
    tooltip: {
      trigger: "axis",
      formatter(params) {
        let result = params[0].name + "<br/>";
        params.forEach(item => {
          result +=
            item.marker +
            " " +
            item.seriesName +
            ": " +
            item.value +
            (item.seriesName == "累计降雨量" ? "mm" : "m") +
            "<br/>";
        });
        return result;
      }
    },
    legend: {
      show: true,
      textStyle: { fontSize: 14, color: "#ffffff" }
    },
    grid: {
      top: "70px",
      bottom: "40",
      left: "120px",
      right: "50px"
    },
    xAxis: [
      {
        name: "  降\n  水\n  量\n(mm)",
        nameTextStyle: { color: "#ffffff", rotate: "90deg" },
        type: "value",
        axisLabel: { textStyle: { color: "#ffffff" } },
        splitLine: {
          show: false,
          lineStyle: { type: "dashed", color: "#ffffff" }
        }
      },
      {
        name: " 积\n 水\n 量\n(m)",
        nameTextStyle: { color: "#ffffff" },
        type: "value",
        axisLabel: { textStyle: { color: "#ffffff" } },
        splitLine: {
          show: false,
          lineStyle: { type: "dashed", color: "#ffffff" }
        }
      }
    ],
    yAxis: [
      {
        axisLine: {
          lineStyle: { color: "rgba(255, 255, 255, 0.65)" }
        },
        nameTextStyle: { color: "#ffffff" },
        axisTick: { show: false },
        axisLabel: { textStyle: { color: "#ffffff" } },
        splitLine: {
          show: false,
          lineStyle: { type: "dashed", color: "#ffffff" }
        },
        type: "category",
        data: list.map(v => v.datatime)
      }
    ],
    series
  };
}

export default {
  buildByDetailChartOption,
  buildSkDetailChartOption,
  buildJsDetailChartOption
};
