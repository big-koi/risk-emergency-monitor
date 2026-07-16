const state = {
  // 是否显示新增弹框
  isShowAddModal: false,
  // 列表筛选
  listFilter: {
    time: ['', ''],
    xzq: '',
  },
  listShow:true,
  // 致灾因子数据导入
  isDataExport: false,
  // 预警范围提取
  isWarnScopeExtract: false,
  // 预警指标统计
  isWarnStatistics: false,
  // 预警范围分析结果
  isWarnResult: false,
  // 是否熵权计算成功
  isSqjsOk: false,
  // 是否层次分析法权重计算成功
  isCcfxfqzjsOk: false,
  // 是否综合权重计算成功
  isZhqzjsOk: false,
  // 是否显示熵权计算结果
  isSqjsResult: false,
  // 是否显示层次分析法权重计算
  isCcfxResult: false,
  // 综合权重计算
  isZhqzjsResult: false,
  // 风险等级分析结果面板
  isRiskResult: false,
  // 是否风险等级评估
  isRiskLevelPg: false,
};

const mutations = {
  SET_IS_SHOW_ADD_MODAL(state, boo) {
    state.isShowAddModal = boo;
  },
  SET_IS_DATA_EXPORT(state, boo) {
    state.isDataExport = boo;
  },
  SET_IS_WARN_SCOPE_EXTRACT(state, boo) {
    state.isWarnScopeExtract = boo;
  },
  SET_IS_WARN_STATISTICS(state, boo) {
    state.isWarnStatistics = boo;
  },
  SET_IS_WARN_RESULT(state, boo) {
    state.isWarnResult = boo;
  },
  SET_IS_SQJS_OK(state, boo) {
    state.isSqjsOk = boo;
  },
  SET_IS_CCFXQZJS_OK(state, boo) {
    state.isCcfxfqzjsOk = boo;
  },
  SET_IS_ZHQZJS_OK(state, boo) {
    state.isZhqzjsOk = boo;
  },
  SET_IS_SQJS_RESULT(state, boo) {
    state.isSqjsResult = boo;
  },
  SET_IS_CCFX_RESULT(state, boo) {
    state.isCcfxResult = boo;
  },
  SET_IS_ZHQZJS_RESULT(state, boo) {
    state.isZhqzjsResult = boo;
  },
  SET_IS_RISK_LEVEL_PG(state, boo) {
    state.isRiskLevelPg = boo;
  },
  SET_IS_RISK_RESULT(state, boo) {
    state.isRiskResult = boo;
  },
  SET_LIST_FILTER(state, param) {
    state.listFilter = param;
  },
  SET_LIST_SHOW(state, param) {
    state.listShow = param;
  },
};

const actions = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
