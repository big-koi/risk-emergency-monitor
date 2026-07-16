const state = {
  data: []
};

const mutations = {
  SET_DATA(state, arr) {
    state.data = arr;
  }
};

const actions = {
  handlerSetData({commit}, data) {
    let keyMap = {
      oneMap: '一张图'
    };
    let arr = data.map(t => {
      return {
        name: keyMap[t.split(':').reverse()[0]] || t.split(':').reverse()[0]
      };
    });
    commit('SET_DATA', arr.reverse());
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
}