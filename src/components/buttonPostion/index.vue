<template>
  <div class="buttonPostion">
    <div class="titleBox" @click="posttionButton">
      <img
        class="region-icon"
        src="../../assets/images/rapidAnalysis/dwIcon.png"
        alt=""
      /><span class="region-label">{{ displayRegionName }}</span>
      <a-icon class="region-arrow" type="down" />
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
          <div @click="ruturnMap" v-if="canShowReturn">返回</div>
        </div>
        <div class="conten">
          <a-radio-group v-model="activeTab" @change="onChange">
            <a-radio-button value="province" :disabled="isProvinceTabDisabled">
              {{ provinceTabLabel }}
            </a-radio-button>
            <a-radio-button
              value="city"
              :disabled="selected.province.code == null || isCityTabDisabled"
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
          <div
            class="list-province"
            v-show="activeTab === 'province' && !isRegionLocked"
          >
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
          <div class="list-city" v-show="activeTab === 'city' && !isCityTabDisabled">
            <dl class="region-select clearfix">
              <dd>
                <a
                  class="city-a"
                  v-for="item in cityList || []"
                  :key="item.xzqdm"
                  :title="item.xzqmc"
                  :ad-code="item.xzqdm"
                  @click="_onCitySelect(item)"
                  :class="selected.city.xzqdm === item.xzqdm ? 'active' : ''"
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
  props: {
    /** 父组件 regionContext 提供的展示名，避免异步同步失败时与业务态不一致 */
    regionDisplayLabel: {
      type: String,
      default: ""
    }
  },
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
        province: { xzqdm: null, xzqmc: "", name: "", code: null },
        city: { xzqdm: null, xzqmc: "" },
        county: { xzqdm: null, xzqmc: "" }
      },
      cityList: [],
      countyList: [],
      regionLock: null,
      _silentApply: false,
      _regionApplySeq: 0
    };
  },
  computed: {
    displayRegionName() {
      if (
        this.regionDisplayLabel &&
        this.regionDisplayLabel !== "全国"
      ) {
        return this.regionDisplayLabel;
      }
      if (this.locationName && this.locationName !== "全国") {
        return this.locationName;
      }
      if (this.locationCode && String(this.locationCode) !== "100000") {
        const resolved = this._resolveDisplayLabelFromSelection(
          String(this.locationCode)
        );
        if (resolved && resolved !== "全国") {
          return resolved;
        }
      }
      return "全国";
    },
    isRegionLocked() {
      return !!(this.regionLock && this.regionLock.minCode);
    },
    isProvinceTabDisabled() {
      return this.isRegionLocked;
    },
    isCityTabDisabled() {
      return (
        this.isRegionLocked &&
        this.regionLock.minLevel === "city"
      );
    },
    provinceTabLabel() {
      if (
        this.isRegionLocked &&
        this.regionLock.minLevel === "city" &&
        this.selected.city.xzqmc
      ) {
        return this.selected.city.xzqmc;
      }
      return this.displayRegionName;
    },
    canShowReturn() {
      if (!this.isRegionLocked) {
        return this.locationCode !== "100000";
      }
      if (this.regionLock.minLevel === "city") {
        return true;
      }
      if (this.regionLock.minLevel === "province") {
        return true;
      }
      return false;
    }
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
    /** 从已选省/市/县层级解析展示名称 */
    _resolveDisplayLabelFromSelection(code) {
      const codeStr = String(code || this.locationCode || "").trim();
      if (!codeStr || codeStr === "100000") {
        return "全国";
      }
      const province = this.selected.province || {};
      const city = this.selected.city || {};
      const county = this.selected.county || {};
      const provinceName = province.name || province["name-short"] || "";

      if (county.xzqdm && String(county.xzqdm) === codeStr) {
        if (provinceName && city.xzqmc && county.xzqmc) {
          return `${provinceName}${city.xzqmc}${county.xzqmc}`;
        }
        return county.xzqmc || "";
      }
      if (city.xzqdm && String(city.xzqdm) === codeStr) {
        return provinceName && city.xzqmc
          ? `${provinceName}${city.xzqmc}`
          : city.xzqmc || "";
      }
      if (province.code && String(province.code) === codeStr) {
        return provinceName;
      }
      if (city.xzqmc && codeStr.endsWith("00") && !codeStr.endsWith("0000")) {
        return provinceName && city.xzqmc
          ? `${provinceName}${city.xzqmc}`
          : city.xzqmc;
      }
      return "";
    },
    /** 同步更新按钮展示（不拉接口、不 emit） */
    syncDisplayImmediate({ code, label }) {
      this.regionLock = null;
      if (!code || code === "100000") {
        this.locationCode = "100000";
        this.locationName = "全国";
        return;
      }
      this.locationCode = String(code);
      if (label && label !== "全国") {
        this.locationName = label;
        return;
      }
      const resolved = this._resolveDisplayLabelFromSelection(String(code));
      if (resolved && resolved !== "全国") {
        this.locationName = resolved;
      }
    },
    /**
     * 父组件统一同步入口
     */
    applyRegionContext({ code, label, lock, silent = false, skipBoundary = false }) {
      this.regionLock = lock || null;
      this._silentApply = !!silent;
      if (!code || code === "100000") {
        this.resetToNational({ silent });
        return;
      }
      const displayLabel =
        label && label !== "全国" ? label : this.displayRegionName;
      this.syncDisplayImmediate({ code, label: displayLabel });
      this.setDefaultRegionByCode(code, {
        silent,
        targetLabel: displayLabel,
        skipBoundary
      });
    },
    resetToNational({ silent = false } = {}) {
      this._silentApply = !!silent;
      this.regionLock = null;
      this.locationCode = "100000";
      this.locationName = "全国";
      this.selected = {
        province: { xzqdm: null, xzqmc: "", name: "", code: null },
        city: { xzqdm: null, xzqmc: "" },
        county: { xzqdm: null, xzqmc: "" }
      };
      this.activeTab = "province";
      if (!silent) {
        this.$emit("upladeLine", false);
        this.$emit("positionXzqCode", "");
      }
    },
    setDefaultRegionByCode(xzqdm, options = {}) {
      const { silent = false, targetLabel = "", skipBoundary = false } = options;
      this._silentApply = !!silent;
      const code = String(xzqdm);
      if (!code || code === "100000") {
        this.resetToNational({ silent });
        return Promise.resolve();
      }

      const applySeq = ++this._regionApplySeq;
      const isStale = () => applySeq !== this._regionApplySeq;
      const displayCode = code;
      const displayName =
        targetLabel && targetLabel !== "全国"
          ? targetLabel
          : this.locationName && this.locationName !== "全国"
            ? this.locationName
            : "";

      let level = "省";
      if (!code.endsWith("0000")) {
        level = code.endsWith("00") ? "市" : "县";
      }

      const provinceCode = level === "省" ? code : code.slice(0, 2) + "0000";
      const provinces = (this.regions && this.regions.province) || {};
      let targetProvince = null;

      Object.keys(provinces).some(key => {
        const list = provinces[key] || [];
        for (let i = 0; i < list.length; i++) {
          if (String(list[i].code) === provinceCode) {
            targetProvince = list[i];
            return true;
          }
        }
        return false;
      });

      if (!targetProvince) {
        return Promise.resolve();
      }

      this._applyProvinceSelection(targetProvince, {
        silent: true,
        skipBoundary: true,
        skipListLoad: true
      });
      this.locationCode = displayCode;
      if (displayName) {
        this.locationName = displayName;
      }

      if (level === "省") {
        if (displayName) {
          this.locationName = displayName;
        } else if (targetProvince) {
          this.locationName =
            targetProvince.name || targetProvince["name-short"] || "";
        }
        return this._finishRegionApply("省", { silent, skipBoundary });
      }

      return this.getListByXzqCodeList(provinceCode, "省")
        .then(res => {
          if (isStale()) {
            return Promise.resolve();
          }
          const cityData = (res && res.data) || this.cityList || [];
          if (level === "市") {
            const targetCity =
              cityData.find(item => String(item.xzqdm) === code) || null;
            if (targetCity) {
              this._applyCitySelection(targetCity, {
                silent: true,
                skipBoundary: true,
                skipListLoad: true
              });
              this.locationCode = displayCode;
              const resolvedLabel =
                displayName ||
                this._resolveDisplayLabelFromSelection(code) ||
                targetCity.xzqmc;
              if (resolvedLabel) {
                this.locationName = resolvedLabel;
              }
              if (this.isRegionLocked && this.regionLock.minLevel === "city") {
                this.activeTab = "county";
              }
              return this._finishRegionApply("市", { silent, skipBoundary });
            }
          } else if (level === "县") {
            const cityCode = code.slice(0, 4) + "00";
            const targetCity =
              cityData.find(item => String(item.xzqdm) === cityCode) || null;
            if (!targetCity) {
              return Promise.resolve();
            }
            this._applyCitySelection(targetCity, {
              silent: true,
              skipBoundary: true,
              skipListLoad: true
            });
            this.locationCode = displayCode;
            if (displayName) {
              this.locationName = displayName;
            }
            return this.getListByXzqCodeList(cityCode, "市").then(res2 => {
              if (isStale()) {
                return Promise.resolve();
              }
              const countyData = (res2 && res2.data) || this.countyList || [];
              const targetCounty =
                countyData.find(item => String(item.xzqdm) === code) || null;
              if (targetCounty) {
                this._applyCountySelection(targetCounty, {
                  silent: true,
                  skipBoundary: true
                });
                this.locationCode = displayCode;
                this.locationName = targetCounty.xzqmc || displayName;
                return this._finishRegionApply("县", { silent, skipBoundary });
              }
              return Promise.resolve();
            });
          }
          return Promise.resolve();
        })
        .catch(() => Promise.resolve())
        .finally(() => {
          if (!isStale()) {
            this._silentApply = false;
          }
        });
    },
    _applyProvinceSelection(
      item,
      { silent = false, skipBoundary = false, skipListLoad = false } = {}
    ) {
      if (!item || item.code == null) {
        return;
      }
      this.locationCode = item.code;
      if (!this._silentApply && !silent) {
        this.locationName = item.name;
      } else if (
        item.name &&
        (this.locationName === "全国" ||
          String(this.locationCode) === String(item.code))
      ) {
        this.locationName = item.name;
      }
      this.selected.province = item;
      this.selected.city = { xzqdm: null, xzqmc: "" };
      this.selected.county = { xzqdm: null, xzqmc: "" };
      this.activeTab = "city";
      if (!skipListLoad) {
        this.getListByXzqCodeList(item.code, "省");
      }
      if (!skipBoundary) {
        this.getArderData("省");
      }
    },
    _applyCitySelection(
      item,
      { silent = false, skipBoundary = false, skipListLoad = false } = {}
    ) {
      if (!item || !item.xzqdm) {
        return;
      }
      this.locationCode = item.xzqdm;
      const provinceName =
        (this.selected.province && this.selected.province.name) || "";
      const cityLabel =
        provinceName && item.xzqmc
          ? `${provinceName}${item.xzqmc}`
          : item.xzqmc;
      if (!this._silentApply && !silent) {
        this.locationName = cityLabel || item.xzqmc;
      } else if (
        cityLabel &&
        (this.locationName === "全国" ||
          String(this.locationCode) === String(item.xzqdm))
      ) {
        this.locationName = cityLabel;
      }
      this.selected.city = item;
      this.selected.county = { xzqdm: null, xzqmc: "" };
      this.activeTab = "county";
      if (!skipListLoad) {
        this.getListByXzqCodeList(item.xzqdm, "市");
      }
      if (!skipBoundary) {
        this.getArderData("市");
      }
    },
    _applyCountySelection(item, { skipBoundary = false, silent = false } = {}) {
      if (!item || !item.xzqdm) {
        return;
      }
      this.locationCode = item.xzqdm;
      this.locationName = item.xzqmc;
      this.selected.county = item;
      if (!skipBoundary) {
        this.getArderData("县");
      }
    },
    _finishRegionApply(type, { silent = false, skipBoundary = false }) {
      const vm = this;
      if (skipBoundary) {
        if (!silent && !vm._silentApply) {
          vm.$emit("positionXzqCode", vm.locationCode);
        }
        vm._silentApply = false;
        return Promise.resolve();
      }
      const emitBoundary = function(geo) {
        if (geo) {
          vm.$emit("upladeLine", geo);
        }
      };
      return getFwByXzqCode({
        xzqdm: vm.locationCode,
        xzqlevel: type
      })
        .then(function(res) {
          if (res && res.code === 200 && res.data && res.data.feature) {
            emitBoundary(JSON.parse(res.data.feature));
            return;
          }
          if (type === "省") {
            vm.loadProvinceBoundaryFallback(emitBoundary);
          }
        })
        .catch(function() {
          if (type === "省") {
            vm.loadProvinceBoundaryFallback(emitBoundary);
          }
        })
        .finally(function() {
          if (!silent && !vm._silentApply) {
            vm.$emit("positionXzqCode", vm.locationCode);
          }
          vm._silentApply = false;
        });
    },
    _onProvinceSelect(item) {
      if (this.isRegionLocked) {
        return;
      }
      this._applyProvinceSelection(item);
    },
    _onCitySelect(item) {
      if (this.isCityTabDisabled) {
        return;
      }
      this._applyCitySelection(item);
      if (!this._silentApply) {
        this.$emit("positionXzqCode", this.locationCode);
      }
    },
    _onCountySelect(item) {
      this._applyCountySelection(item);
      if (!this._silentApply) {
        this.$emit("positionXzqCode", this.locationCode);
      }
    },
    getListByXzqCodeList(xzqdm, type) {
      return getListByXzqCode({
        xzqdm: xzqdm,
        xzqlevel: type
      })
        .then(res => {
          if (res && res.code === 200) {
            if (type === "省") {
              this.cityList = res.data || [];
            } else if (type === "市") {
              this.countyList = res.data || [];
            }
          }
          return res || { code: -1, data: [] };
        })
        .catch(() => ({ code: -1, data: [] }));
    },
    getArderData(type) {
      const vm = this;
      const emitBoundary = function(geo) {
        if (geo) {
          vm.$emit("upladeLine", geo);
        }
      };
      getFwByXzqCode({
        xzqdm: vm.locationCode,
        xzqlevel: type
      })
        .then(function(res) {
          if (res && res.code === 200 && res.data && res.data.feature) {
            emitBoundary(JSON.parse(res.data.feature));
            return;
          }
          if (type === "省") {
            vm.loadProvinceBoundaryFallback(emitBoundary);
          }
        })
        .catch(function() {
          if (type === "省") {
            vm.loadProvinceBoundaryFallback(emitBoundary);
          }
        });
      if (!vm._silentApply) {
        vm.$emit("positionXzqCode", vm.locationCode);
      }
    },
    loadProvinceBoundaryFallback(callback) {
      const code = this.locationCode;
      const localUrl = `${window.servicesConfig.WebServer}static/adArea/${code}.json`;
      $.get(localUrl)
        .then(function(res) {
          if (res) {
            callback(res);
          }
        })
        .fail(function() {
          const remoteUrl = `${window.servicesConfig.WebServer}static/adArea/${code}.json`;
          $.get(remoteUrl).then(function(res) {
            if (res) {
              callback(res);
            }
          });
        });
    },
    ruturnMap() {
      if (
        this.isRegionLocked &&
        this.regionLock.minLevel === "city" &&
        this.selected.county &&
        this.selected.county.xzqdm
      ) {
        const city = this.selected.city;
        this.selected.county = { xzqdm: null, xzqmc: "" };
        this.locationCode = city.xzqdm;
        this.locationName = city.xzqmc;
        this.activeTab = "county";
        this.getArderData("市");
        this.$emit("regionBack", {
          step: "countyToCity",
          code: city.xzqdm,
          label: city.xzqmc
        });
        return;
      }
      if (this.isRegionLocked) {
        this.$emit("regionBack", { step: "exitLock" });
        return;
      }
      this.$emit("regionBack", { step: "toNational" });
    }
  }
};
</script>
<style scoped lang="less">
.buttonPostion {
  cursor: pointer;
  /* 长区名（如「广东省-江门市」）不能写死 1rem，否则会换行溢出工具条蓝底外，看起来像背景没了 */
  width: auto;
  min-width: 1rem;
  max-width: 2.6rem;
  height: 0.4rem;
  line-height: 0.4rem;
  padding: 0 0.08rem;
  text-align: center;
  font-size: 0.14rem;
  font-weight: 500;
  position: relative;
  box-sizing: border-box;

  .titleBox {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    white-space: nowrap;
    min-width: 0;
  }

  .region-icon {
    flex-shrink: 0;
    height: 0.2rem;
    margin-right: 0.06rem;
  }

  .region-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  .region-arrow {
    flex-shrink: 0;
    color: #2b97ff;
    margin-left: 0.05rem;
  }

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
