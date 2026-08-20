/**
 * 子面板 ref 桥接（案例 / 点查 / 基础图层）
 */
export const panelRefsMixin = {
  methods: {
    /** 案例详情子组件 caseMain 引用 */
    getCaseMainRef() {
      const panel = this.$refs.caseCollectionPanels;
      if (panel && typeof panel.getCaseMain === "function") {
        return panel.getCaseMain();
      }
      return (panel && panel.$refs && panel.$refs.caseMain) || null;
    },
    onCaseDelete(item, type) {
      this.deleteCase(item, type);
    },
    /** 点位查询 Identify 实例 */
    getIdentifyRef() {
      const panel = this.$refs.identifyPanelShell;
      if (panel && typeof panel.getIdentify === "function") {
        return panel.getIdentify();
      }
      return (panel && panel.$refs && panel.$refs.identify) || null;
    },
    /** 基础图层 openLayerList 实例 */
    getOpenLayerListRef() {
      const panel = this.$refs.baseLayerPanelShell;
      if (panel && typeof panel.getOpenLayerList === "function") {
        return panel.getOpenLayerList();
      }
      return (panel && panel.$refs && panel.$refs.openLayerList) || null;
    }
  }
};

export default panelRefsMixin;
