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
                selected.city.code && activeTab !== "province"
                  ? "/" + selected.city.name
                  : ""
              }}{{
                selected.county.code && activeTab === "county"
                  ? "/" + selected.county.name
                  : ""
              }}</span
            >
          </div>
          <div @click="ruturnMap">返回</div>
        </div>
        <div class="conten">
          <a-radio-group v-model="activeTab" @change="onChange">
            <a-radio-button value="province">
              全国
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
              :disabled="selected.city.code == null"
            >
              {{
                selected.city.name === ""
                  ? "(区县)"
                  : selected.city["name-short"]
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
                  v-for="item in regions.regions[selected.province.code] || []"
                  :key="item.code"
                  :title="item.name"
                  :ad-code="item.code"
                  @click="_onCitySelect(item)"
                  :class="selected.city.code === item.code ? 'active' : ''"
                  >{{ item["name-short"] }}</a
                >
              </dd>
            </dl>
          </div>
          <div class="list-county" v-show="activeTab === 'county'">
            <dl class="region-select clearfix">
              <dd>
                <a
                  class="city-a"
                  v-for="item in regions.regions[selected.city.code] || []"
                  :key="item.code"
                  :title="item.name"
                  :ad-code="item.code"
                  @click="_onCountySelect(item)"
                  :class="selected.county.code === item.code ? 'active' : ''"
                  >{{ item["name-short"] }}</a
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
        province: { code: null, name: "", "name-short": "" },
        city: { code: null, name: "", "name-short": "" },
        county: { code: null, name: "", "name-short": "" }
      }
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
      vm.selected.city = { code: null, name: "", "name-short": "" };
      vm.selected.county = { code: null, name: "", "name-short": "" };
      vm.activeTab = "city";
      this.getArderData();
    },
    _onCitySelect(item) {
      const vm = this;
      vm.locationCode = item["code"];
      vm.locationName = item["name"];

      vm.selected.city = item;
      vm.selected.county = { code: null, name: "", "name-short": "" };
      vm.activeTab = "county";
      this.getArderData();
    },
    _onCountySelect(item) {
      const vm = this;
      vm.locationCode = item["code"];
      vm.locationName = item["name"];
      vm.selected.county = item;
      this.getArderData();
    },
    getArderData() {
      const vm = this;
      getFwByXzqCode().then(res => {
        if (res.code === 200) {
          vm.$emit("upladeLine", res.data);
        }
      });
      let url = `${window.servicesConfig.WebServer}static/adArea/${vm.locationCode}.json`;
      $.get(url).then(function(res) {
        if (res) {
          vm.$emit("upladeLine", res);
        }
      });
    },
    ruturnMap() {
      const vm = this;

      let item = { code: "100000", name: "全国", "name-short": "全国" };
      vm.locationCode = item["code"];
      vm.locationName = item["name"];

      vm.selected = {
        province: { code: null, name: "", "name-short": "" },
        city: { code: null, name: "", "name-short": "" },
        county: { code: null, name: "", "name-short": "" }
      };

      vm.activeTab = "province";
      vm.$emit("upladeLine", false);
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
  background: linear-gradient(
      137deg,
      rgba(0, 84, 156, 0.35) 5%,
      rgba(0, 88, 166, 0.8) 99%
    ),
    linear-gradient(
      180deg,
      rgba(0, 76, 239, 0.39),
      rgba(74, 175, 248, 0.14) 30%,
      rgba(48, 117, 246, 0.36) 78%,
      rgba(38, 135, 255, 0.82)
    );
  border: 1px solid;
  -o-border-image: linear-gradient(
      180deg,
      #269bff,
      rgba(62, 173, 242, 0) 37%,
      rgba(41, 170, 232, 0) 65%,
      #3e99ff
    )
    1 1;
  border-image: -webkit-gradient(
      linear,
      left top,
      left bottom,
      from(#269bff),
      color-stop(37%, rgba(62, 173, 242, 0)),
      color-stop(65%, rgba(41, 170, 232, 0)),
      to(#3e99ff)
    )
    1 1;
  border-image: linear-gradient(
      180deg,
      #269bff,
      rgba(62, 173, 242, 0) 37%,
      rgba(41, 170, 232, 0) 65%,
      #3e99ff
    )
    1 1;
  border-radius: 4px;
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
