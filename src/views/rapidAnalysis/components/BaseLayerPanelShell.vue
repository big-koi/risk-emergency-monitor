<template>
  <openLayerList
    v-show="visible && earthMap"
    ref="openLayerList"
    :earthMap="earthMap"
    @openLayer="$emit('openLayer', $event)"
    @ischeck="$emit('ischeck', $event)"
    @setJcsbLegendShow="$emit('setJcsbLegendShow', $event)"
  />
</template>

<script>
import openLayerList from "../../../components/openLayerList.vue";

export default {
  name: "BaseLayerPanelShell",
  components: { openLayerList },
  props: {
    visible: { type: Boolean, default: false },
    earthMap: { default: null }
  },
  methods: {
    /** 供父组件访问 openLayerList 实例（plainOptions 等） */
    getOpenLayerList() {
      return this.$refs.openLayerList || null;
    }
  }
};
</script>
