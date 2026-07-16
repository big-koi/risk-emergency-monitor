import {
  DISASTER_MODULE,
  NATIONAL_CODE,
  REGION_LEVEL
} from "../../domain/region/constants";
import { getXzqLevel, XZQ_LEVEL } from "../../views/rapidAnalysis/warningInfoHelper";
import {
  selectDisplayRegion,
  selectQueryCode,
  selectMapRegion,
  selectWarningCode,
  selectIsDrilling,
  resolveTableDrillRegion
} from "../../domain/region/selectors";

function createEmptyRegion() {
  return {
    code: "",
    name: "全国",
    level: REGION_LEVEL.NATIONAL,
    path: []
  };
}

const state = {
  browseRegion: createEmptyRegion(),
  drillStack: [],
  currentModule: DISASTER_MODULE.SHORT_TERM_FORECAST,
  requestVersion: 0
};

const getters = {
  displayRegion: state => selectDisplayRegion(state),
  queryCode: state => selectQueryCode(state),
  mapRegion: state => selectMapRegion(state),
  warningCode: state => selectWarningCode(state),
  isDrilling: state => selectIsDrilling(state),
  browseRegion: state => state.browseRegion,
  drillStack: state => state.drillStack,
  currentModule: state => state.currentModule
};

const mutations = {
  SET_BROWSE_REGION(state, region) {
    state.browseRegion = region || createEmptyRegion();
  },
  PUSH_DRILL(state, drillRegion) {
    if (drillRegion) {
      state.drillStack.push(drillRegion);
    }
  },
  POP_DRILL(state) {
    state.drillStack.pop();
  },
  CLEAR_DRILL(state) {
    state.drillStack = [];
  },
  SET_CURRENT_MODULE(state, module) {
    state.currentModule = module || DISASTER_MODULE.SHORT_TERM_FORECAST;
  },
  BUMP_REQUEST_VERSION(state) {
    state.requestVersion += 1;
  },
  RESET_REGION(state) {
    state.browseRegion = createEmptyRegion();
    state.drillStack = [];
  }
};

const actions = {
  /** 用户主动选择行政区 */
  selectRegion({ commit, dispatch }, { code, name, level, path }) {
    commit("BUMP_REQUEST_VERSION");
    const normalized = code && String(code).trim() !== NATIONAL_CODE ? String(code).trim() : "";
    commit("SET_BROWSE_REGION", {
      code: normalized,
      name: name || (normalized ? normalized : "全国"),
      level: level || (normalized ? getXzqLevel(normalized) : REGION_LEVEL.NATIONAL),
      path: path || []
    });
    commit("CLEAR_DRILL");
    return dispatch("syncDerivedState");
  },

  /** 右侧表格点击进入钻取 */
  enterTableDrill({ commit, state, dispatch }, { item, module }) {
    commit("BUMP_REQUEST_VERSION");
    const mod = module || state.currentModule;
    const drillRegion = resolveTableDrillRegion(item, mod);
    if (!drillRegion) return;
    commit("PUSH_DRILL", drillRegion);
    return dispatch("syncDerivedState");
  },

  /** 返回上一层钻取 */
  backDrill({ commit, dispatch }) {
    commit("BUMP_REQUEST_VERSION");
    commit("POP_DRILL");
    return dispatch("syncDerivedState");
  },

  /** 退出全部钻取，恢复浏览态 */
  exitDrill({ commit, dispatch }) {
    commit("BUMP_REQUEST_VERSION");
    commit("CLEAR_DRILL");
    return dispatch("syncDerivedState");
  },

  /** 切换灾种模块 */
  switchDisaster({ commit, dispatch }, module) {
    commit("SET_CURRENT_MODULE", module);
    commit("CLEAR_DRILL");
    return dispatch("syncDerivedState");
  },

  /** 重置为全国 */
  resetRegion({ commit, dispatch }) {
    commit("BUMP_REQUEST_VERSION");
    commit("RESET_REGION");
    return dispatch("syncDerivedState");
  },

  /** 派生状态同步钩子，后续接入地图与接口刷新 */
  syncDerivedState({ getters: g }) {
    return {
      queryCode: g.queryCode,
      mapRegion: g.mapRegion,
      warningCode: g.warningCode,
      displayRegion: g.displayRegion
    };
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
