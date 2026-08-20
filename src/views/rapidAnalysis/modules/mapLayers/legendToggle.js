/**
 * 图例勾选 / 图层面板开关编排（纯函数）
 */

/** 打开基础图层列表面板 */
export function planOpenLayerListPanel() {
  return {
    clearButtonModel: true,
    statePatch: {
      showTaskList: false,
      IdentifyShow: false,
      isOpenLayerList: true
    }
  };
}

/** 打开点查面板 */
export function planShowIdentifyPanel() {
  return {
    clearButtonModel: true,
    statePatch: {
      isOpenLayerList: false,
      showTaskList: false,
      IdentifyShow: true
    }
  };
}

/** 工具栏定位按钮：关闭其它浮层 */
export function planPosttionButton() {
  return {
    showTaskList: false,
    isOpenLayerList: false,
    IdentifyShow: false
  };
}

/** 预警城市图例 */
export function planYjcsTlToggle(checked) {
  const on = !!checked;
  return {
    statePatch: { yjcsTlCheckData: on },
    action: on ? "showMaker" : "hideMaker",
    markerClass: "byyj"
  };
}

/** 降雨范围图例（色斑） */
export function planJyfwTlToggle(checked) {
  const on = !!checked;
  return {
    statePatch: { jyfwTlCheckData: on },
    action: on ? "getByyjcsColorImg" : "removeAllLayer"
  };
}

/** 预警点/等级图例 */
export function planJydjTlToggle(checked, options) {
  const on = !!checked;
  const opts = options || {};
  let action = "hideMaker";
  if (on) {
    action = "showMaker";
  } else if (opts.isMapType) {
    action = "clearThreeMaker";
  }
  return {
    statePatch: { jydjTlCheckData: on },
    action: action,
    markerClass: "yjdj"
  };
}

/** 积水深度图例（内涝/山洪） */
export function planJssdTlToggle(checked, options) {
  const on = !!checked;
  const opts = options || {};
  const statePatch = { jssdTlCheckData: on };
  if (!on) {
    return {
      statePatch: statePatch,
      action: opts.isMapType ? "clearThreeEffect" : "removeAllLayer"
    };
  }
  if (opts.disasterTypeIndex === 3) {
    return {
      statePatch: statePatch,
      action: opts.csnlValue == 1 ? "getJssdData" : "getJsGqthreeData"
    };
  }
  if (opts.disasterTypeIndex === 4) {
    return {
      statePatch: statePatch,
      action: opts.shValue == 1 ? "getshJssdData" : "getShGqthreeData"
    };
  }
  return { statePatch: statePatch, action: "noop" };
}

/** 实况降雨站点图例 */
export function planJylzdgwToggle(checked) {
  const on = !!checked;
  return {
    statePatch: { jylzdgwCheckData: on },
    action: on ? "showMaker" : "hideMaker",
    markerClass: "skjyXz"
  };
}

/** 气象台预警图例 */
export function planQxyjToggle(checked) {
  const on = !!checked;
  return {
    statePatch: { qxyjCheckkData: on },
    action: on ? "searchQxtYj" : "hideMaker",
    markerClass: "qxyj"
  };
}

export default {
  planOpenLayerListPanel,
  planShowIdentifyPanel,
  planPosttionButton,
  planYjcsTlToggle,
  planJyfwTlToggle,
  planJydjTlToggle,
  planJssdTlToggle,
  planJylzdgwToggle,
  planQxyjToggle
};
