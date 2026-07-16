const state = {
  isShow: false,
  src: '',
};

const mutations = {
  SET_IS_SHOW(state, boo) {
    state.isShow = boo;
  },
  SET_SRC(state, url) {
    state.src = url;
  }
};

const actions = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
