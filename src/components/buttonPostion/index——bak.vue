<template>
  <div class="buttonPostion">
    <div class="titleBox" @click="posttionButton">
      <img
        style="font-size: 0.2rem;height: 0.2rem;margin-right: 0.1rem;"
        src="../../assets/images/rapidAnalysis/dwIcon.png"
        alt=""
      />{{ locationName }}
      <a-icon style="color: #2b97ff;margin-left: 0.05rem;" type="down" />
    </div>
    <div class="modelBox" v-if="isModel">
      <div class="header">
        <a-icon type="close" @click="isModel = false" />
      </div>
      <div class="bodyBox">
        <div class="title">
          <div style="width: 80%;text-align: left;">
            地区：<span
              >{{ selected.province.code ? selected.province.name : "全国"
              }}{{
                selected.city.xzqdm && activeTab !== "province"
                  ? "/" + selected.city.xzqmc
                  : ""
              }}{{
                selected.county.xzqdm && activeTab === "county"
                  ? "/" + selected.county.xzqmc
                  : ""
              }}</span
            >
          </div>
          <div @click="ruturnMap" v-if="locationCode!== '100000'">返回</div>
        </div>
        <div class="conten">
          <a-radio-group v-model="activeTab" @change="onChange">
            <a-radio-button value="province">
              {{ locationName }}
            </a-radio-button>
            <a-radio-button
              value="city"
              :disabled="selected.province.code == null"
            >
              {{
                selected.province.name === ""
                  ? "(城市)"
                  : selected.province["name-short"]
              }}
            </a-radio-button>
            <a-radio-button
              value="county"
              :disabled="selected.city.xzqdm == null"
            >
              {{
                selected.city.xzqmc === ""
                  ? "(区县)"
                  : selected.city["xzqmc"]
              }}
            </a-radio-button>
          </a-radio-group>
          <div class="list-province" v-show="activeTab === 'province'">
            <dl
              class="region-select clearfix"
              v-for="alphabet in Object.keys(regions.province)"
              :key="alphabet"
            >
              <dt>{{ alphabet }}</dt>
              <dd>
                <a
                  class="city-a"
                  v-for="item in regions.province[alphabet] || []"
                  :key="item.code"
                  :title="item.name"
                  :ad-code="item.code"
                  @click="_onProvinceSelect(item)"
                  :class="selected.province.code === item.code ? 'active' : ''"
                  >{{ item["name-short"] }}</a
                >
              </dd>
            </dl>
          </div>
          <div class="list-city" v-show="activeTab === 'city'">
            <dl class="region-select clearfix">
              <dd>
                <a
                  class="city-a"
                  v-for="item in cityList || []"
                  :key="item.xzqdm"
                  :title="item.xzqmc"
                  :ad-code="item.xzqdm"
                  @click="_onCitySelect(item)"
                  :class="selected.city.code === item.xzqdm ? 'active' : ''"
                  >{{ item.xzqmc }}</a
                >
              </dd>
            </dl>
          </div>
          <div class="list-county" v-show="activeTab === 'county'">
            <dl class="region-select clearfix">
              <dd>
                <a
                  class="city-a"
                  v-for="item in countyList || []"
                  :key="item.xzqdm"
                  :title="item.xzqmc"
                  :ad-code="item.xzqdm"
                  @click="_onCountySelect(item)"
                  :class="selected.county.xzqdm === item.xzqdm ? 'active' : ''"
                  >{{ item.xzqmc }}</a
                >
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
const regionsJosn = require("../../../static/regions.json");
import { getListByXzqCode, getFwByXzqCode } from "@/api/rapidAnalysis/index.js";
export default {
  data() {
    return {
      locationCode: "100000",
      locationName: "全国",
      isModel: false,
      areasValue: "",
      regions: {
        province: {},
        regions: {}
      },
      activeTab: "province",
      selected: {
        province: { xzqdm: null, xzqmc: "",name: "" },
        city: { xzqdm: null, xzqmc: "" },
        county: { xzqdm: null, xzqmc: "" }
      },
      cityList: [], // 市列表
      countyList: [], // 县列表
    };
  },
  mounted() {
    this.regions = regionsJosn;
  },
  methods: {
    posttionButton() {
      this.isModel = true;
      this.$emit("posttionButton");
    },
    onChange() {},
    _onProvinceSelect(item) {
      const vm = this;
      vm.locationCode = item["code"];
      vm.locationName = item["name"];
      vm.selected.province = item;
      vm.selected.city = { xzqdm: null, xzqmc: "" };
      vm.selected.county = { xzqdm: null, xzqmc: "" };
      vm.activeTab = "city";
      vm.getListByXzqCodeList(item["code"],'省');
      this.getArderData('省');
    },
    _onCitySelect(item) {
      const vm = this;
      vm.locationCode = item["xzqdm"];
      vm.locationName = item["xzqmc"];

      vm.selected.city = item;
      vm.selected.county = { xzqdm: null, xzqmc: "" };
      vm.activeTab = "county";
      vm.getListByXzqCodeList(item["xzqdm"],'市');
      this.getArderData('市');
    },
    _onCountySelect(item) {
      const vm = this;
      vm.locationCode = item["xzqdm"];
      vm.locationName = item["xzqmc"];
      vm.selected.county = item;
      this.getArderData('县');
    },
    getListByXzqCodeList(xzqdm,type){
      getListByXzqCode({
        xzqdm: xzqdm,
        xzqlevel: type
      }).then(res => {
        if (res.code === 200) {
          if(type === '省'){
            this.cityList = res.data;
          }else if(type === '市'){
            this.countyList = res.data;
          }
        }
      });
    },
    getArderData(type) {
      const vm = this;
      if(type === '省'){
        let url = `${window.servicesConfig.WebServer}static/adArea/${vm.locationCode}.json`;
        $.get(url).then(function(res) {
          if (res) {
            vm.$emit("upladeLine", res);
          }
        });
      }else{
        getFwByXzqCode({
          xzqdm: vm.locationCode,
          xzqlevel: type
        }).then(res => {
          if (res.code === 200) {
            vm.$emit("upladeLine",JSON.parse(res.data.feature));
          }
        });
      }
      vm.$emit("positionXzqCode", vm.locationCode);
    },
    ruturnMap() {
      const vm = this;

      let item = { code: "100000", name: "全国" };
      vm.locationCode = item["code"];
      vm.locationName = item["name"];

      vm.selected = {
        province: { xzqdm: null, xzqmc: "",name: "" },
        city: { xzqdm: null, xzqmc: "" },
        county: { xzqdm: null, xzqmc: "" }
      };

      vm.activeTab = "province";
      vm.$emit("upladeLine", false);
      vm.$emit("positionXzqCode", "");
    }
  }
};
</script>
<style scoped lang="less">
.buttonPostion {
  cursor: pointer;
  width: 1rem;
  height: 0.4rem;
  line-height: 0.4rem;
  text-align: center;
  font-size: 0.14rem;
  font-weight: 500;
  position: relative;

  .modelBox {
    width: 2.5rem;
    top: 0rem;
    position: absolute;
    top: 0.5rem;
    border-radius: 0.06rem;

    .header {
      width: 100%;
      height: 0.3rem;
      background: #0072cb;
      text-align: right;
      line-height: 0.3rem;
      padding-right: 0.05rem;
    }

    .bodyBox {
      // height: 150px;
      background: linear-gradient(
        318deg,
        rgba(0, 60, 114, 0.92) 2%,
        rgba(0, 62, 132, 0.88) 100%
      );
      border: 0.01rem solid #269bff;
      padding: 0 0.09rem;

      .title {
        display: flex;
        justify-content: space-between;
      }

      /deep/.ant-radio-group {
        width: 100%;
      }

      /deep/ .ant-radio-button-wrapper {
        width: 33% !important;
        height: 0.3rem !important;
        padding: 0 0.05rem !important;
        text-align: center;
        line-height: 0.3rem;
      }

      dt {
        line-height: 20px;
        text-align: left;
      }

      dd {
        display: flex;
        flex-wrap: wrap;
        line-height: 20px;
      }

      dd > a {
        margin-left: 10px;
        padding: 1px 5px;
        border-radius: 5px;
        color: #ffff;
      }

      a:hover,
      a:focus {
        text-decoration: underline;
      }
    }
  }
}
</style>
