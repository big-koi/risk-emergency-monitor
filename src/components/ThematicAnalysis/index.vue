<template>
  <thematic-panel>
    <!-- 条件筛选 -->
    <thematic-filter :option="option.filter" @freshList="freshList"></thematic-filter>
    <!-- 列表 -->
    <thematic-list  v-if="listShow" ref="thematicList" :option="option.list" @locate="locate"></thematic-list>
    <!-- 新增弹框 -->
    <add-modal :option="option.addModal" @freshList="freshList"></add-modal>
  </thematic-panel>
</template>

<script>
import ThematicPanel from "../ThematicPanel";
import ThematicFilter from "../ThematicFilter";
import ThematicList from "../ThematicList";
import AddModal from "../ThematicModal/addModal";
import { mapState } from "vuex";

export default {
  name: "ThematicAnalysis",
  components: {
    AddModal,
    ThematicList,
    ThematicFilter,
    ThematicPanel
  },
  props: {
    // 总的配置项
    option: {
      type: Object,
      default() {
        return {
          list: {},
        }
      }
    }
  },
  data() {
    return {
      xzqdm: window.sessionStorage.getItem("xzqdm"),
    }
  },
  computed: {
    ...mapState({
      listShow: state => state.thematicAnalysis.listShow,
    })
  },
  created() {
    console.log(this.$store.state);
  },
  methods: {
    locate(item) {
      if (this.xzqdm != '000000') {
        me.earth.layerManager.clearSelectLayer();
        // 绘制
        let features = JSON.parse(sessionStorage.getItem('features'))
        me.earth.zoomToFeatures([features], {
          zoom: true,
          style: {
                lineColor: "red",
                fillColor: 'transparent'
          }
        });
        // 设置级别
        me.earth.map.getView().animate({ zoom: mapConfig.zoom * 1.5 || 9 });
        let range = window.sessionStorage.getItem('xzqRange').split(',').map(Number)
        this.$emit("locate2", {center:range})
      } else {
        this.$emit("locate2", item)
      }
    },
    // 刷新列表
    freshList(time,xzq){
      this.$refs.thematicList.getListData(time,xzq)
    }
  }
}
</script>

<style scoped></style>
