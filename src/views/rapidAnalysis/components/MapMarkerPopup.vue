<template>
  <div class="identify-popup-wrapper" id="mapMarkerModel" v-show="visible">
    <div class="identify-popup-header">
      <span>详情</span>
      <a-icon
        @click="$emit('close')"
        class="identify-popup-close"
        style="cursor: pointer"
        type="close"
      />
    </div>
    <div class="identify-popup-content" v-if="model.type == 'qxyj'">
      {{ model.conten }}
    </div>
    <div class="identify-popup-content" v-else-if="model.type == 'byyj'">
      <div class="con identify-con">
        <p class="identify-con-label">省名：</p>
        <p class="identify-con-value">
          {{ model.shengname || "--" }}
        </p>
      </div>
      <div class="con identify-con">
        <p class="identify-con-label">市名：</p>
        <p class="identify-con-value">{{ model.shiname || "--" }}</p>
      </div>
      <div class="con identify-con">
        <p class="identify-con-label">预警指标：</p>
        <p class="identify-con-value">{{ model.maxprcp || "--" }}</p>
      </div>
      <div class="con identify-con">
        <p class="identify-con-label">预警时间：</p>
        <p class="identify-con-value">{{ model.yjtime || "--" }}</p>
      </div>
    </div>
    <div v-else class="identify-popup-content">
      <div class="con identify-con">
        <p class="identify-con-label">详细地址：</p>
        <p class="identify-con-value">{{ model.address || "--" }}</p>
      </div>
      <div class="con identify-con">
        <p class="identify-con-label">地点名称：</p>
        <p class="identify-con-value">{{ model.poi || "--" }}</p>
      </div>
      <div class="con identify-con">
        <p class="identify-con-label">省级名称：</p>
        <p class="identify-con-value">{{ model.province || "--" }}</p>
      </div>
      <div class="con identify-con">
        <p class="identify-con-label">市级名称：</p>
        <p class="identify-con-value">{{ model.city || "--" }}</p>
      </div>
      <div class="con identify-con">
        <p class="identify-con-label">县级名称：</p>
        <p class="identify-con-value">{{ model.county || "--" }}</p>
      </div>
      <div class="con identify-con">
        <p class="identify-con-label">乡镇名称：</p>
        <p class="identify-con-value">{{ model.town || "--" }}</p>
      </div>
      <div class="con identify-con">
        <p class="identify-con-label">经度：</p>
        <p class="identify-con-value">{{ lon || "--" }}</p>
      </div>
      <div class="con identify-con">
        <p class="identify-con-label">纬度：</p>
        <p class="identify-con-value">{{ lat || "--" }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MapMarkerPopup",
  props: {
    visible: { type: Boolean, default: false },
    model: {
      type: Object,
      default: function() {
        return { jyl: "", name: "" };
      }
    },
    lon: { type: [String, Number], default: "" },
    lat: { type: [String, Number], default: "" }
  }
};
</script>

<style scoped lang="less">
.identify-popup-wrapper {
  width: auto;
  height: auto;
  color: #fff;
  background: rgba(0, 58, 133, 0.7);
  border-radius: 4px;
  position: fixed;

  .identify-popup-header {
    border-bottom: 1px solid #69a2e8;
    margin: 0 8px;
    padding: 5px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .identify-popup-content {
    padding: 5px;
  }

  .identify-popup-content > .identify-con {
    font-weight: normal;
    color: #ffff;
    line-height: normal;
    padding: 3px 3px;
    display: flex;
    align-items: center;
    font-size: 14px;
  }

  .identify-con-label {
    margin: 0;
    white-space: nowrap;
  }

  .identify-con-value {
    margin: 0;
  }
}
</style>
