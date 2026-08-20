import diitgis from "@/components/Layer/LayerManagerForDiitGIS";
import {
  planOpenLayerListPanel,
  planShowIdentifyPanel,
  planPosttionButton,
  planYjcsTlToggle,
  planJyfwTlToggle,
  planJydjTlToggle,
  planJssdTlToggle,
  planJylzdgwToggle,
  planQxyjToggle
} from "./modules/mapLayers/legendToggle";
import {
  planSearchBackwardIdentify,
  planGeocodeIdentifyApply
} from "./modules/warnings/tiandituGeocode";

// mixin.js
export const myMixin = {
  data() {
    return {
      yjcsTlCheckData: true,
      jyfwTlCheckData: true,
      jydjTlCheckData: true,
      jssdTlCheckData: true,
      qxyjCheckkData: false,
      hlTlData: []
    };
  },
  mounted() {},
  created() {},
  methods: {
    closeIdentify() {
      this.popupShow = false;
    },
    // 地图点位经纬度查询数据
    searchBackward(type, item) {
      const plan = planSearchBackwardIdentify(type, item);
      if (plan.action === "direct") {
        this.identifyModel = plan.identifyModel;
        this.$nextTick(() => {
          this.identifyOverlay.setPosition(plan.position);
          this.popupShow = true;
        });
        return;
      }
      const that = this;
      fetch(plan.geocodeUrl)
        .then(function(res) {
          return res.json();
        })
        .then(function(res) {
          const applied = planGeocodeIdentifyApply(res, plan.jyl);
          if (!applied.ok) {
            that.$message.error("查询失败");
            return;
          }
          that.popupShow = true;
          that.identifyModel = applied.identifyModel;
          that.identifyModellat = applied.identifyModellat;
          that.identifyModellon = applied.identifyModellon;
          that.$nextTick(function() {
            that.identifyOverlay.setPosition(applied.position);
          });
        })
        .catch(function(err) {
          console.error(err);
          that.$message.error("查询失败");
        });
    },
    // 基础图层添加图列
    ischeck(data) {
      this.hlTlData = data;
    },
    posttionButton() {
      Object.assign(this, planPosttionButton());
    },
    openLayerList() {
      const plan = planOpenLayerListPanel();
      if (plan.clearButtonModel && this.$refs.buttonPostion) {
        this.$refs.buttonPostion.isModel = false;
      }
      Object.assign(this, plan.statePatch);
    },
    removeLocatlayer() {},
    //点位查询按钮
    showIdentify() {
      const plan = planShowIdentifyPanel();
      if (plan.clearButtonModel && this.$refs.buttonPostion) {
        this.$refs.buttonPostion.isModel = false;
      }
      Object.assign(this, plan.statePatch);
    },
    closeClick() {
      this.IdentifyShow = false;
      const marker_class = document.getElementsByClassName("markerToobar_class");
      Array.from(marker_class).forEach(marker => marker.remove());
    },
    addMaker(data) {
      const marker_class = document.getElementsByClassName("markerToobar_class");
      Array.from(marker_class).forEach(marker => marker.remove());
      const imgUrl = require("../../assets/images/rapidAnalysis/locat.png");
      diitgis.addToobarrMarker(
        [data.result.location.lon, data.result.location.lat],
        imgUrl,
        {}
      );
    },
    /** 执行图例勾选计划 */
    applyLegendTogglePlan(plan) {
      if (!plan) return;
      if (plan.statePatch) {
        Object.assign(this, plan.statePatch);
      }
      const action = plan.action;
      if (action === "showMaker") {
        this.showMaker(true, plan.markerClass);
      } else if (action === "hideMaker") {
        this.showMaker(false, plan.markerClass);
      } else if (action === "getByyjcsColorImg") {
        this.getByyjcsData("colorImg");
      } else if (action === "removeAllLayer") {
        if (this.earthMap && this.earthMap.removeAllLayer) {
          this.earthMap.removeAllLayer();
        }
      } else if (action === "clearThreeMaker") {
        if (this.$refs.threeMap) {
          this.$refs.threeMap.clearMaker();
        }
      } else if (action === "clearThreeEffect") {
        if (this.$refs.threeMap) {
          this.$refs.threeMap.clearEffect();
        }
      } else if (action === "getJssdData") {
        this.getJssdData();
      } else if (action === "getJsGqthreeData") {
        this.getJsGqthreeData();
      } else if (action === "getshJssdData") {
        this.getshJssdData();
      } else if (action === "getShGqthreeData") {
        this.getShGqthreeData();
      } else if (action === "searchQxtYj") {
        this.searchQxtYj();
      }
    },
    yjcsTlCheck(e) {
      this.applyLegendTogglePlan(planYjcsTlToggle(e.target.checked));
    },
    jyfwTlCheck(e) {
      this.applyLegendTogglePlan(planJyfwTlToggle(e.target.checked));
    },
    jydjTlCheck(e) {
      this.applyLegendTogglePlan(
        planJydjTlToggle(e.target.checked, { isMapType: this.isMapType })
      );
    },
    jssdTlCheck(e) {
      this.applyLegendTogglePlan(
        planJssdTlToggle(e.target.checked, {
          isMapType: this.isMapType,
          disasterTypeIndex: this.disasterTypeIndex,
          csnlValue: this.csnlValue,
          shValue: this.shValue
        })
      );
    },
    jylzdgwCheck(e) {
      this.applyLegendTogglePlan(planJylzdgwToggle(e.target.checked));
    },
    qxyjCheck(e) {
      this.applyLegendTogglePlan(planQxyjToggle(e.target.checked));
    },
    showMaker(type, className) {
      const marker_class = document.getElementsByClassName(className);
      const markersArray = Array.from(marker_class);
      console.log("markersArray", markersArray);
      markersArray.forEach(item => {
        if (type) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    },
    openLayer() {
      this.isOpenLayerList = false;
    }
  }
};
