/**
 * 右侧排行统计图（sum-chart）option
 */
import * as echarts from "echarts";

function barGradient() {
  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: "rgba(0,210,255,1)" },
    { offset: 1, color: "rgba(0,187,255,0)" }
  ]);
}

function lineGreenGradient() {
  return new echarts.graphic.LinearGradient(
    0,
    0,
    1,
    1,
    [
      { offset: 0, color: "rgba(55,249,173,1)" },
      { offset: 0.333, color: "rgba(55,249,173,1)" },
      { offset: 0.666, color: "rgba(0,237,159,1)" },
      { offset: 1, color: "rgba(55,249,173,1)" }
    ],
    false
  );
}

function lineOrangeGradient() {
  return new echarts.graphic.LinearGradient(
    0,
    0,
    1,
    1,
    [
      { offset: 0, color: "rgba(83,255,180,0)" },
      { offset: 0.333, color: "rgb(249,142,55)" },
      { offset: 0.666, color: "rgb(249,142,55)" },
      { offset: 1, color: "rgba(71,255,211,0)" }
    ],
    false
  );
}

export function buildSumChartOption(data, disasterTypeIndex) {
  const list = data || [];
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
          color: barGradient()
        }
      },
      data: list.map(v => v.sum)
    },
    {
      name: "最大小时" + name,
      type: "line",
      smooth: true,
      showAllSymbol: true,
      symbol: "none",
      lineStyle: { color: lineGreenGradient() },
      data: list.map(v => v.max)
    },
    {
      name: "小时最大格网" + name,
      type: "line",
      smooth: true,
      showAllSymbol: true,
      symbol: "none",
      lineStyle: { color: lineOrangeGradient() },
      data: list.map(v => v.maxgw),
      itemStyle: { color: "#fbc21c" }
    }
  ];

  if (disasterTypeIndex === 2) {
    series = [
      {
        name: "累计" + name,
        type: "bar",
        barWidth: 14,
        itemStyle: {
          normal: {
            barBorderRadius: 5,
            color: barGradient()
          }
        },
        data: list.map(v => v.sum)
      },
      {
        name: "最大格网" + name,
        type: "line",
        smooth: true,
        showAllSymbol: true,
        symbol: "none",
        lineStyle: { color: lineGreenGradient() },
        data: list.map(v => v.maxjsl)
      }
    ];
  } else if (disasterTypeIndex === 3 || disasterTypeIndex === 4) {
    unitName = "积水深度/m";
    name = "积水深度";
    series = [
      {
        name: "最大" + name,
        type: "bar",
        barWidth: 14,
        itemStyle: {
          normal: {
            barBorderRadius: 5,
            color: barGradient()
          }
        },
        data: list.map(v => v.sum)
      }
    ];
  }

  const totalDataCount = list.length || 1;
  const fixedDisplayCount = 4;
  const endIndex = (fixedDisplayCount / totalDataCount) * 100;

  return {
    grid: {
      top: "12%",
      left: "10%",
      right: "5%",
      bottom: "75px"
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
        label: { show: false }
      },
      formatter(params) {
        let result = params[0].name + "<br/>";
        params.forEach(item => {
          result +=
            item.marker +
            " " +
            item.seriesName +
            ": " +
            item.value +
            "" +
            (item.seriesName == "累计降雨量"
              ? "mm"
              : item.seriesName == "最大小时降雨量"
                ? "mm"
                : item.seriesName == "小时最大格网降雨量"
                  ? "mm"
                  : "m") +
            "<br/>";
        });
        return result;
      }
    },
    legend: { show: false },
    xAxis: {
      data: list.map(v => v.name),
      axisLine: {
        show: true,
        lineStyle: { color: "rgba(150,195,255,0.5)" }
      },
      axisTick: { show: false },
      axisLabel: {
        show: true,
        interval: 0,
        textStyle: { color: "#fff", fontSize: 12 },
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
          lineStyle: { color: "rgba(72,102,142,0.74)" }
        },
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          show: true,
          textStyle: { color: "#fff" }
        }
      }
    ],
    series,
    dataZoom: {
      type: "slider",
      start: 0,
      end: endIndex
    }
  };
}

export default { buildSumChartOption };
