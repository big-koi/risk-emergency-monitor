<template>
  <Identify
    v-if="earthMap"
    ref="identify"
    :earthMap="earthMap"
    :IdentifyShow="identifyShow"
    @addMaker="$emit('addMaker', $event)"
    @closeClick="$emit('closeClick')"
    @printStar="$emit('printStar', $event)"
  />
</template>

<script>
import Identify from "../../../components/identify.vue";

export default {
  name: "IdentifyPanelShell",
  components: { Identify },
  props: {
    earthMap: { default: null },
    identifyShow: { type: Boolean, default: false }
  },
  methods: {
    /** 供父组件访问 identify 实例 */
    getIdentify() {
      return this.$refs.identify || null;
    }
  }
};
</script>
