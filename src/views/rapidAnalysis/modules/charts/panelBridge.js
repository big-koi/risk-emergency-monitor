/**
 * 统计图 / 详情图 panel 桥接（与 Vue 实例解耦的步骤）
 */

/** 渲染右侧排行统计图，返回 chart 实例（写入由调用方赋值 myChart） */
export function renderSumChartOnPanel(panel, data) {
  if (!panel || typeof panel.render !== "function") {
    return null;
  }
  return panel.render(data || []);
}

/** 销毁统计图 panel / 实例 */
export function disposeSumChartOnPanel(panel, chartInstance) {
  if (panel && typeof panel.dispose === "function") {
    panel.dispose();
  } else if (chartInstance) {
    try {
      chartInstance.dispose();
    } catch (e) {
      /* ignore */
    }
  }
  return null;
}

/** 统计图 resize */
export function resizeSumChartOnPanel(panel, chartInstance) {
  if (panel && typeof panel.resize === "function") {
    panel.resize();
    return;
  }
  if (chartInstance && typeof chartInstance.resize === "function") {
    chartInstance.resize();
  }
}

/**
 * 详情钻取图：取 DOM 并 echarts.init
 * @returns {object|null} chart instance
 */
export function initDetailsChartOnPanel(panel, echartsLib, kind, prevChart) {
  const el =
    panel && typeof panel.getChartEl === "function"
      ? panel.getChartEl(kind)
      : null;
  if (!el || !echartsLib || typeof echartsLib.init !== "function") {
    return null;
  }
  if (prevChart) {
    try {
      prevChart.dispose();
    } catch (e) {
      /* ignore */
    }
  }
  return echartsLib.init(el);
}

export default {
  renderSumChartOnPanel,
  disposeSumChartOnPanel,
  resizeSumChartOnPanel,
  initDetailsChartOnPanel
};
