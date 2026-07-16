<template>
  <div
    class="warning-info-panel"
    v-if="visible && (warningInfo || loading)"
  >
    <div class="warning-info-header">
      <div class="warning-info-header-left">
        <a-icon type="bell" class="warning-info-bell" />
        <span class="warning-info-title">预警信息</span>
        <span class="warning-info-region">（{{ displayRegion }}）</span>
      </div>
      <div class="warning-info-header-right">
        <span class="warning-info-time">
          {{ (warningInfo && warningInfo.timeLabel) || "预警时间" }}：{{
            loading ? "--" : ((warningInfo && warningInfo.warningTime) || "--")
          }}
        </span>
        <a-icon
          type="close"
          class="warning-info-close"
          @click="$emit('close')"
        />
      </div>
    </div>
    <div class="warning-info-body" :class="{ 'is-loading': loading }">
      <div v-if="loading" class="warning-info-loading">
        <a-spin tip="预警信息加载中..." />
      </div>
      <template v-else-if="warningInfo">
        <div
          v-for="(item, idx) in warningInfo.sections"
          :key="item.title"
          :class="[
            'warning-info-section',
            { 'warning-info-section-last': idx === warningInfo.sections.length - 1 }
          ]"
        >
          <div class="warning-info-section-title">
            <a-icon :type="item.icon" />
            <span>{{ item.title }}</span>
          </div>
          <p
            v-if="item.centerInline"
            class="warning-info-section-text warning-info-range-with-center"
          >
            <span class="warning-info-range-desc" v-html="item.desc"></span>
            <span
              v-if="item.centerLineHtml"
              class="warning-info-center-block"
            >
              <span
                class="warning-info-center-text"
                v-html="item.centerLineHtml"
              ></span>
              <a-icon
                v-if="item.centerPoint"
                type="environment"
                class="warning-info-locate warning-info-locate-inline"
                title="点击后可将地图定位至该点"
                @click.stop="$emit('locate', item)"
              />
            </span>
            <span
              v-else-if="item.centerPoint"
              class="warning-info-center-block"
            >
              <span class="warning-info-center-text">
                <template v-if="!item.centerInDesc">降雨中心位于</template>
                <span class="warning-info-address">
                  <template v-if="item.address">{{ item.address }}</template>
                  <template v-else-if="item.addressLoading">地址查询中...</template>
                </span>
                <span
                  v-if="!item.centerInDesc && item.coordText"
                  class="warning-info-coord"
                >{{ item.coordText }}</span>
              </span>
              <a-icon
                type="environment"
                class="warning-info-locate warning-info-locate-inline"
                title="点击后可将地图定位至该点"
                @click.stop="$emit('locate', item)"
              />
            </span>
          </p>
          <p
            v-else-if="item.floodPoint"
            class="warning-info-section-text warning-info-flood-point"
          >
            <span class="warning-info-flood-point-row">
              <span class="warning-info-address">
                <template v-if="item.address">{{ item.address }}</template>
                <template v-else-if="item.addressLoading">地址查询中...</template>
              </span>
              <span v-if="item.coordText" class="warning-info-coord">{{ item.coordText }}</span>
              <a-icon
                v-if="item.centerPoint"
                type="environment"
                class="warning-info-locate warning-info-locate-inline"
                title="点击后可将地图定位至该点"
                @click.stop="$emit('locate', item)"
              />
            </span>
            <span
              v-if="item.floodPointLine2"
              class="warning-info-flood-point-line2"
              v-html="item.floodPointLine2"
            ></span>
          </p>
          <p
            v-else-if="item.centerPoint && !item.centerInline"
            class="warning-info-section-text warning-info-center-row"
          >
            <span class="warning-info-address">
              <template v-if="item.address">{{ item.address }}</template>
              <template v-else-if="item.addressLoading">地址查询中...</template>
            </span>
            <span class="warning-info-coord">{{ item.coordText }}</span>
            <a-icon
              type="environment"
              class="warning-info-locate"
              title="点击后可将地图定位至该点"
              @click.stop="$emit('locate', item)"
            />
          </p>
          <p v-else class="warning-info-section-text" v-html="item.desc"></p>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "WarningInfoPanel",
  props: {
    visible: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    displayRegion: { type: String, default: "" },
    warningInfo: { type: Object, default: null }
  }
};
</script>

<style scoped lang="less">
.warning-info-panel {
  position: absolute;
  left: 1.05rem;
  top: 0.24rem;
  z-index: 10;
  width: 4.6rem;
  background: linear-gradient(
    318deg,
    rgba(0, 60, 114, 0.92) 2%,
    rgba(0, 62, 132, 0.88) 100%
  );
  border: 1px solid;
  border-image: linear-gradient(
      179deg,
      #59b2ff 1%,
      rgba(62, 173, 242, 0) 37%,
      rgba(41, 170, 232, 0) 65%,
      #2bc7ff 100%
    )
    1 1;
  border-radius: 6px;
  color: #fff;
  font-size: 0.14rem;
  overflow: hidden;

  .warning-info-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.1rem 0.14rem;
    background: linear-gradient(
      129deg,
      rgba(33, 111, 182, 0.54) 1%,
      rgba(0, 62, 132, 0) 90%
    );
    border-radius: 0px 0px 6px 6px;
  }

  .warning-info-header-left {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .warning-info-bell {
    font-size: 0.16rem;
    margin-right: 0.06rem;
    color: #fff;
  }

  .warning-info-title {
    font-size: 0.16rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .warning-info-region {
    font-size: 0.13rem;
    color: #8eb8d9;
    margin-left: 0.04rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .warning-info-header-right {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-left: 0.08rem;
  }

  .warning-info-time {
    font-size: 0.12rem;
    color: #8eb8d9;
    white-space: nowrap;
    margin-right: 0.1rem;
  }

  .warning-info-close {
    font-size: 0.14rem;
    color: #fff;
    cursor: pointer;

    &:hover {
      color: #64b1ff;
    }
  }

  .warning-info-body {
    padding: 0.04rem 0.16rem 0.12rem;

    &.is-loading {
      min-height: 0.72rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .warning-info-loading {
    width: 100%;
    padding: 0.16rem 0;
    text-align: center;

    /deep/ .ant-spin-text {
      color: #8eb8d9;
      font-size: 0.12rem;
    }
  }

  .warning-info-section {
    padding: 0.1rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);

    &.warning-info-section-last {
      border-bottom: none;
      padding-bottom: 0.04rem;
    }
  }

  .warning-info-section-title {
    display: flex;
    align-items: center;
    margin-bottom: 0.06rem;
    font-size: 0.14rem;
    font-weight: 500;

    .anticon {
      font-size: 0.15rem;
      margin-right: 0.06rem;
    }
  }

  .warning-info-section-text {
    margin: 0;
    padding-left: 0.21rem;
    font-size: 0.13rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.92);

    /deep/ .highlight-yellow,
    /deep/ .highlight-orange {
      color: #ffcc00;
    }

    /deep/ .highlight-red,
    /deep/ .highlight-coral {
      color: #ff4d4f;
    }

    /deep/ .highlight-blue {
      color: #64b1ff;
    }

    /deep/ .highlight-orange {
      color: #ff9900;
    }
  }

  .warning-info-flood-point {
    padding-left: 0.21rem;
  }

  .warning-info-flood-point-row {
    display: block;
    line-height: 1.6;
  }

  .warning-info-flood-point-line2 {
    display: block;
    margin-top: 0.04rem;
    line-height: 1.6;
  }

  .warning-info-center-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.04rem 0.06rem;
    padding-left: 0.21rem;
  }

  .warning-info-address {
    flex: 1 1 auto;
    min-width: 0;
  }

  .warning-info-coord {
    white-space: nowrap;
    color: rgba(255, 255, 255, 0.85);
  }

  .warning-info-locate {
    flex-shrink: 0;
    font-size: 0.16rem;
    color: #5cdb95;
    cursor: pointer;

    &:hover {
      color: #7ef0b0;
    }
  }

  .warning-info-range-with-center {
    line-height: 1.6;
  }

  .warning-info-range-desc {
    display: block;
    margin-bottom: 0.06rem;
  }

  .warning-info-center-block {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.08rem;
    padding-left: 0;
  }

  .warning-info-center-text {
    flex: 1;
    min-width: 0;
    color: rgba(255, 255, 255, 0.92);
  }

  .warning-info-locate-inline {
    flex-shrink: 0;
    font-size: 0.18rem;
    margin-top: 0.02rem;
    color: #ff9900;

    &:hover {
      color: #ffcc00;
    }
  }
}
</style>
