/**
 * 案例收藏 API 编排（统一成功/失败结果）
 */
import {
  gerCaseAll,
  singleCollect,
  saveCase,
  deleteCase,
  saveCase_other
} from "@/api/rapidAnalysis/case.js";

function asResult(res, okMessage, failMessage, mapData) {
  if (res && res.code === 200) {
    return {
      ok: true,
      message: okMessage,
      data: typeof mapData === "function" ? mapData(res) : res.data
    };
  }
  return {
    ok: false,
    message: failMessage,
    data: null
  };
}

/** 案例列表 */
export function fetchCaseList(name) {
  return gerCaseAll({ name: name }).then(function(res) {
    return asResult(res, "", "", function(r) {
      return r.data || [];
    });
  });
}

/** 点位/任务 singleCollect */
export function requestSingleCollect(params) {
  return singleCollect(params).then(function(res) {
    return asResult(res, "收藏成功", "收藏失败");
  });
}

/** 保存案例 */
export function requestSaveCase(payload) {
  return saveCase(payload).then(function(res) {
    return asResult(res, "保存成功", "保存失败", function(r) {
      return r.data;
    });
  });
}

/** 删除案例参数 */
export function buildDeleteCaseParams(item, type) {
  return {
    caseid: item && item.case_id,
    id: type != "1" && item ? item.id : "",
    type: type
  };
}

/** 删除案例 */
export function requestDeleteCase(item, type) {
  return deleteCase(buildDeleteCaseParams(item, type)).then(function(res) {
    return asResult(res, "删除成功", "删除失败");
  });
}

/** 创建案例草稿（预占 alId） */
export function requestCreateCaseDraft() {
  return saveCase_other({}).then(function(res) {
    return asResult(res, "", "", function(r) {
      return r.data && r.data.alId;
    });
  });
}

export default {
  fetchCaseList,
  requestSingleCollect,
  requestSaveCase,
  buildDeleteCaseParams,
  requestDeleteCase,
  requestCreateCaseDraft
};
