
const state = {
  userName: '',
  userId: '',
  taskStatus: ''
};

const mutations = {
  SET_USER_DATA(state, obj) {
    state.userName = obj.realname;
    state.userId = obj.id;
  },
  SET_TASK_STATUS(state, val) {
   alert(val)
    state.taskStatus = val
  }
};

const actions = {
  // 处理用户参数
  handlerUserParams({ commit }, param) {
    commit('SET_USER_DATA', param);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
