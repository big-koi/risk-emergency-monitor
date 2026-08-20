/**
 * 案例收藏：面板显隐状态机 + 保存/收藏载荷（纯函数）
 */

/** 详情区处于「展开编辑」态（可直接加入收藏） */
export function isCaseDetailsEditing(detailsShow, fullscreen) {
  return !!(detailsShow && !fullscreen);
}

/**
 * 打开收藏夹列表
 * @param {{ detailsShow: boolean, fullscreen: boolean }} flags
 */
export function buildOpenCaseCollectionPatch(flags) {
  const f = flags || {};
  const patch = {
    isCaseCollectionDetailsShow: false,
    isCaseCollectionFullscreen: true,
    isCaseCollectionSeeShow: true
  };
  if (!f.detailsShow && !f.fullscreen) {
    patch.caseDetailsId = "";
  }
  return patch;
}

/** 创建新案例：切到详情展开 */
export function buildCreateCasePanelPatch() {
  return {
    isNewCaseMode: true,
    caseDetailsId: "",
    isCaseCollectionSeeShow: false,
    isCaseCollectionSelectShow: false,
    isCaseCollectionDetailsShow: true,
    isCaseCollectionFullscreen: false,
    isCaseListShow: false
  };
}

/** 查看已有案例详情 */
export function buildShowCaseDetailsPatch(caseId) {
  return {
    isNewCaseMode: false,
    caseDetailsId: caseId,
    isCaseCollectionSeeShow: false,
    isCaseCollectionDetailsShow: true,
    isCaseCollectionFullscreen: false,
    isCaseListShow: false
  };
}

export function buildCloseCaseDetailsPatch() {
  return {
    isCaseCollectionSelectShow: false,
    isCaseCollectionDetailsShow: false,
    isCaseCollectionFullscreen: false
  };
}

export function buildExpandCaseDetailsPatch() {
  return {
    isCaseCollectionDetailsShow: true,
    isCaseCollectionFullscreen: false
  };
}

export function buildCollapseCaseDetailsPatch() {
  return {
    isCaseCollectionDetailsShow: true,
    isCaseCollectionFullscreen: true
  };
}

export function buildOpenCaseListDetailsPatch() {
  return {
    isCaseListShow: true,
    isCaseCollectionSeeShow: false
  };
}

/** 点位收藏入口预处理 */
export function buildPrintStarPrep(print) {
  return {
    caseSearchValue: undefined,
    singleCollectType: "3",
    coordinatePoint: print
  };
}

/** 任务时间收藏入口预处理 */
export function buildStarCasePrep(item) {
  return {
    caseTaskId: item && item.id,
    singleCollectType: "4"
  };
}

/** 打开「加入收藏」选择面板 */
export function buildOpenSelectCasePatch() {
  return {
    caseSelectValue: undefined,
    isCaseCollectionSelectShow: true
  };
}

/**
 * 收藏入口预处理后的后续动作
 * @param {{ detailsShow, fullscreen, selectMode?: 'full'|'light' }} flags
 *   selectMode full=重置选择并打开；light=仅打开选择面板（点位收藏）
 * @returns {{ action: 'addToCollection'|'openSelect', selectPatch?: object }}
 */
export function planStarCollectFollowUp(flags) {
  const f = flags || {};
  if (isCaseDetailsEditing(f.detailsShow, f.fullscreen)) {
    return { action: "addToCollection" };
  }
  if (f.selectMode === "light") {
    return {
      action: "openSelect",
      selectPatch: { isCaseCollectionSelectShow: true }
    };
  }
  return {
    action: "openSelect",
    selectPatch: buildOpenSelectCasePatch()
  };
}

/**
 * 灾种 index → 收藏接口 yjlx
 * 1 短临→1，3 内涝→2，4 山洪→5
 */
export function resolveCollectYjlx(disasterTypeIndex) {
  if (disasterTypeIndex == 3) return "2";
  if (disasterTypeIndex == 4) return "5";
  return "1";
}

/**
 * 组装 singleCollect 点位收藏参数
 */
export function buildSingleCollectPointParams(opts) {
  const o = opts || {};
  const point = o.coordinatePoint || {};
  return {
    caseid: o.caseSelectValue || o.caseDetailsId,
    lat: point.lat,
    lon: point.lon,
    taskid: o.caseTaskId,
    type: o.singleCollectType,
    yjlx: resolveCollectYjlx(o.disasterTypeIndex)
  };
}

/**
 * 组装数据列表收藏参数
 */
export function buildSingleCollectDataParams(opts) {
  const o = opts || {};
  const item = o.item || {};
  return {
    caseid: o.caseDetailsId,
    taskid: item.id,
    type: o.type,
    yjlx: o.yjlx
  };
}

/**
 * 从 caseMain 表单组装 saveCase 请求
 * @param {object} opts
 * @param {function} formatHourStart - (date) => 'YYYY-MM-DD HH:mm:ss'
 * @returns {{ valid: boolean, payload?: object, error?: string }}
 */
export function buildSaveCaseRequest(opts, formatHourStart) {
  const o = opts || {};
  const form = o.form || {};
  if (!form.name) {
    return { valid: false, error: "请填写案例名称" };
  }
  let kssj = "";
  let jssj = "";
  const date = form.date || [];
  if (date[0] && date[1] && typeof formatHourStart === "function") {
    kssj = formatHourStart(date[0]);
    jssj = formatHourStart(date[1]);
  }
  return {
    valid: true,
    payload: {
      almc: form.name,
      bz: form.desc,
      city: o.cityData,
      data: o.dataList,
      history: o.history,
      kssj: kssj,
      jssj: jssj,
      point: o.print,
      xzqdm: (form.region || []).join(","),
      caseid: o.caseDetailsId
    }
  };
}

/** 保存成功后的面板字段 */
export function buildAfterSaveCasePatch(opts) {
  const o = opts || {};
  const patch = {
    isNewCaseMode: false,
    caseDetailsId: o.caseId
  };
  if (o.keepDetailsOpen) {
    patch.isCaseCollectionDetailsShow = o.keepDetailsOpen;
  } else {
    patch.isCaseCollectionDetailsShow = false;
  }
  return patch;
}

/** 历史任务时间文案 → tasktime */
export function formatCaseHistoryTaskTime(taskName) {
  return String(taskName || "")
    .replace(/年|月/g, "-")
    .replace("日", " ")
    .replace("时", ":00");
}

export default {
  isCaseDetailsEditing,
  buildOpenCaseCollectionPatch,
  buildCreateCasePanelPatch,
  buildShowCaseDetailsPatch,
  buildCloseCaseDetailsPatch,
  buildExpandCaseDetailsPatch,
  buildCollapseCaseDetailsPatch,
  buildOpenCaseListDetailsPatch,
  buildPrintStarPrep,
  buildStarCasePrep,
  buildOpenSelectCasePatch,
  planStarCollectFollowUp,
  resolveCollectYjlx,
  buildSingleCollectPointParams,
  buildSingleCollectDataParams,
  buildSaveCaseRequest,
  buildAfterSaveCasePatch,
  formatCaseHistoryTaskTime
};
