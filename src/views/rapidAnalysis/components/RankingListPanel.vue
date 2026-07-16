<template>
  <div class="ranking-list-panel">
    <div class="chart-box-title" style="display: flex;justify-content: space-between;">
      <span class="title-text" :title="displayTitle">{{ displayTitle }}</span>
      <div
        class="tjtTabStyle"
        @click="$emit('toggle-tjt-tab')"
        v-if="disasterTypeIndex === 1"
      >
        <span>{{ tjuTabChke }}</span>
      </div>
    </div>

    <!-- 短临降水排行 -->
    <div class="list-box" v-if="disasterTypeIndex === 1">
      <div
        class="list-item list-item-header"
        style="background: linear-gradient(139deg,rgba(41,141,255,0.48) 8%, rgba(13,102,176,0.62) 89%);margin: 0;"
      >
        <span class="name" style="display: inline-block; width: 27%;text-align: center">行政区</span>
        <span class="sum" style="display: inline-block; width: 25%;text-align: center;display: flex;">累计降雨量
          <div class="sort-col">
            <img
              src="../../../assets/images/rapidAnalysis/pxup.png"
              class="sort-arrow"
              :class="{ 'sort-arrow-active': jyOrderType === 'sumjyAsc' }"
              alt=""
              @click="$emit('sort-forecast', 'sumjyAsc')"
            />
            <img
              src="../../../assets/images/rapidAnalysis/pxdown.png"
              class="sort-arrow"
              :class="{ 'sort-arrow-active': jyOrderType === 'sumjyDesc' }"
              alt=""
              @click="$emit('sort-forecast', 'sumjyDesc')"
            />
          </div>
        </span>
        <span
          class="max"
          style="display: inline-block; width: 20%;line-height: 20px;text-align: center;display: flex;"
        >最大小时<br />降雨量
          <div class="sort-col">
            <img
              src="../../../assets/images/rapidAnalysis/pxup.png"
              class="sort-arrow"
              :class="{ 'sort-arrow-active': jyOrderType === 'maxjyAsc' }"
              alt=""
              @click="$emit('sort-forecast', 'maxjyAsc')"
            />
            <img
              src="../../../assets/images/rapidAnalysis/pxdown.png"
              class="sort-arrow"
              :class="{ 'sort-arrow-active': jyOrderType === 'maxjyDesc' }"
              alt=""
              @click="$emit('sort-forecast', 'maxjyDesc')"
            />
          </div>
        </span>
        <span
          class="maxgw"
          style="display: inline-block; width: 30%;line-height: 20px;text-align: center;display: flex;"
        >小时最大格网<br />降雨量
          <div class="sort-col">
            <img
              src="../../../assets/images/rapidAnalysis/pxup.png"
              class="sort-arrow"
              :class="{ 'sort-arrow-active': jyOrderType === 'maxgwjyAsc' }"
              alt=""
              @click="$emit('sort-forecast', 'maxgwjyAsc')"
            />
            <img
              src="../../../assets/images/rapidAnalysis/pxdown.png"
              class="sort-arrow"
              :class="{ 'sort-arrow-active': jyOrderType === 'maxgwjyDesc' }"
              alt=""
              @click="$emit('sort-forecast', 'maxgwjyDesc')"
            />
          </div>
        </span>
      </div>
      <div class="list-scroll">
        <div class="list-item" v-for="item in forecastList" :key="item.id || item.name">
          <span
            class="name"
            style="display: inline-block; width: 32%;text-align: center"
            @click="$emit('open-detail', item)"
          >{{ item.name }}</span>
          <span
            class="sum"
            style="display: inline-block; width: 20%;text-align: center"
            @click="$emit('open-detail', item)"
          >{{ item.sum }}mm</span>
          <span
            class="max"
            style="display: inline-block; width: 20%;text-align: center"
            @click="$emit('open-detail', item)"
          >{{ item.max }}mm</span>
          <span
            class="max"
            style="display: inline-block; width: 30%;text-align: center"
            @click="$emit('open-detail', item)"
          >{{ item.maxgw }}mm</span>
          <a-icon
            type="star"
            class="star-box"
            @click="$emit('star-case', item, '2', '1')"
            v-if="showStar"
          />
        </div>
      </div>
    </div>

    <!-- 实况降水排行 -->
    <div class="list-box" v-if="disasterTypeIndex === 2">
      <div
        class="list-item list-item-header"
        style="background: linear-gradient(139deg,rgba(41,141,255,0.48) 8%, rgba(13,102,176,0.62) 89%);margin: 0;"
      >
        <span class="name" style="display: inline-block; width: 40%;text-align: center">行政区</span>
        <span class="sum" style="display: inline-block; width: 30%;text-align: center;display: flex;">过去累计降雨量
          <div class="sort-col">
            <img
              src="../../../assets/images/rapidAnalysis/pxup.png"
              class="sort-arrow"
              :class="{ 'sort-arrow-active': skOrderType === 'sumjslAsc' }"
              alt=""
              @click="$emit('sort-live', 'sumjslAsc')"
            />
            <img
              src="../../../assets/images/rapidAnalysis/pxdown.png"
              class="sort-arrow"
              :class="{ 'sort-arrow-active': skOrderType === 'sumjslDesc' }"
              alt=""
              @click="$emit('sort-live', 'sumjslDesc')"
            />
          </div>
        </span>
        <span class="sum" style="display: inline-block; width: 30%;text-align: center;display: flex;">最大格网降雨量
          <div class="sort-col">
            <img
              src="../../../assets/images/rapidAnalysis/pxup.png"
              class="sort-arrow"
              :class="{ 'sort-arrow-active': skOrderType === 'maxjslAsc' }"
              alt=""
              @click="$emit('sort-live', 'maxjslAsc')"
            />
            <img
              src="../../../assets/images/rapidAnalysis/pxdown.png"
              class="sort-arrow"
              :class="{ 'sort-arrow-active': skOrderType === 'maxjslDesc' }"
              alt=""
              @click="$emit('sort-live', 'maxjslDesc')"
            />
          </div>
        </span>
      </div>
      <div class="list-scroll">
        <div
          class="list-item"
          v-for="item in liveList"
          :key="item.id || item.name"
          @click="$emit('open-detail', item)"
        >
          <span class="name" style="display: inline-block; width: 40%;text-align: center">{{ item.name }}</span>
          <span class="sum" style="display: inline-block; width: 30%;text-align: center">{{ item.sum }}mm</span>
          <span class="sum" style="display: inline-block; width: 30%;text-align: center">{{ item.maxjsl }}mm</span>
        </div>
      </div>
    </div>

    <!-- 城市内涝排行 -->
    <div class="list-box" v-if="disasterTypeIndex === 3">
      <div
        class="list-item list-item-header"
        style="background: linear-gradient(139deg,rgba(41,141,255,0.48) 8%, rgba(13,102,176,0.62) 89%);margin: 0;"
      >
        <span class="name" style="width: 30%;">行政区</span>
        <span class="sum" style="width: 30%;">最大积水时间</span>
        <span class="max" style="width: 30%;">最大积水深度</span>
        <span style="width: 10%;" v-if="showStar && csnlValue === '1'"></span>
      </div>
      <div class="list-scroll">
        <div class="list-item" v-for="item in floodList" :key="item.id || item.name">
          <span class="name" style="width: 30%;" @click="$emit('open-detail', item)">{{ item.name }}</span>
          <span class="sum" style="width: 30%;" @click="$emit('open-detail', item)">{{ item.datatime }}</span>
          <span class="max" style="width: 30%;" @click="$emit('open-detail', item)">{{ item.sum }}m</span>
          <a-icon
            type="star"
            style="width: 10%;"
            class="star-box"
            @click="$emit('star-case', item, '2', '2')"
            v-if="showStar && csnlValue === '1'"
          />
        </div>
        <div v-if="noData" class="no-data-tip">无数据</div>
      </div>
    </div>

    <!-- 山洪排行 -->
    <div class="list-box" v-if="disasterTypeIndex === 4">
      <div
        class="list-item list-item-header"
        style="background: linear-gradient(139deg,rgba(41,141,255,0.48) 8%, rgba(13,102,176,0.62) 89%);margin: 0;"
      >
        <span class="name" style="width: 30%;">行政区</span>
        <span class="sum" style="width: 30%;">最大积水时间</span>
        <span class="max" style="width: 30%;">最大积水深度</span>
        <span style="width: 10%;" v-if="showStar && shValue === '1'"></span>
      </div>
      <div class="list-scroll">
        <div class="list-item" v-for="item in mountainList" :key="item.id || item.name">
          <span class="name" style="width: 30%;" @click="$emit('open-detail', item)">{{ item.name }}</span>
          <span class="sum" style="width: 30%;" @click="$emit('open-detail', item)">{{ item.datatime }}</span>
          <span class="max" style="width: 30%;" @click="$emit('open-detail', item)">{{ item.sum }}m</span>
          <a-icon
            type="star"
            class="star-box"
            @click="$emit('star-case', item, '2', '5')"
            v-if="showStar && shValue === '1'"
          />
        </div>
        <div v-if="noData" class="no-data-tip">无数据</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RankingListPanel",
  props: {
    disasterTypeIndex: { type: Number, required: true },
    rankingListTitle: { type: String, default: "" },
    tjuTabChke: { type: String, default: "六小时累计" },
    jyOrderType: { type: String, default: "sumjyDesc" },
    skOrderType: { type: String, default: "sumjslDesc" },
    forecastList: { type: Array, default: () => [] },
    liveList: { type: Array, default: () => [] },
    floodList: { type: Array, default: () => [] },
    mountainList: { type: Array, default: () => [] },
    showStar: { type: Boolean, default: false },
    csnlValue: { type: [String, Number], default: "1" },
    shValue: { type: [String, Number], default: "1" },
    noData: { type: Boolean, default: false }
  },
  computed: {
    displayTitle() {
      if (this.tjuTabChke !== "六小时累计") {
        return this.rankingListTitle.replace("未来三小时", "未来3h+过去3h");
      }
      return this.rankingListTitle;
    }
  }
};
</script>

<style scoped lang="less">
/* 原在 index.less .statisticalChart 下；拆组件后 scoped 无法穿透，样式自包含于此 */
.ranking-list-panel {
  color: #fff;
}

.chart-box-title {
  height: 0.4rem;
  padding-left: 0.4rem;
  background: url(../../../assets/images/rapidAnalysis/title_bg.png) no-repeat -0.25rem center;
  background-size: 100% 100%;

  .title-text {
    font-size: 0.2rem;
    font-weight: bold;
    background-image: linear-gradient(
      to bottom,
      rgba(49, 190, 255, 1),
      rgba(255, 255, 255, 1)
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .tjtTabStyle {
    cursor: pointer;
    width: 103px;
    height: 32px;
    background: linear-gradient(
      137deg,
      rgba(0, 84, 156, 0.35) 5%,
      rgba(0, 88, 166, 0.8) 99%
    );
    border: 1px solid;
    border-image: linear-gradient(
        180deg,
        rgba(38, 142, 255, 0.32),
        rgba(62, 153, 255, 0.61)
      )
      1 1;
    border-radius: 4px;
    color: #b2d9ff;
    line-height: 32px;
    font-size: 14px;
    text-align: center;
  }
}

.list-box {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  height: 39vh;
  max-height: 36vh;
  overflow: hidden;

  .list-item {
    cursor: pointer;
    height: 0.42rem;
    padding: 0 0.2rem 0 0.1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(
      90deg,
      rgba(15, 85, 166, 0.22) 2%,
      rgba(15, 86, 145, 0.4)
    );
    border: 0.01rem solid rgba(84, 144, 208, 0.59);
    border-left: 0.02rem solid #8dd4ff;
    margin-bottom: 0.1rem;
    flex-shrink: 0;

    .name,
    .sum,
    .max,
    .maxgw {
      text-align: center;
    }

    .sort-arrow {
      margin: 0 0 5px 5px;
      cursor: pointer;
      opacity: 0.35;
      transition: opacity 0.2s, filter 0.2s;

      &.sort-arrow-active {
        opacity: 1;
        filter: drop-shadow(0 0 2px rgba(178, 217, 255, 0.95)) brightness(1.35);
      }
    }
  }

  .list-item-header {
    height: auto;
    min-height: 0.5rem;
    padding-top: 0.04rem;
    padding-bottom: 0.04rem;
    margin-bottom: 0;
    flex-shrink: 0;
  }
}

.sort-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.list-scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

.no-data-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 1.2rem;
  margin: 0.12rem 0.08rem;
  color: #ffffff;
  font-size: 0.16rem;
  font-weight: 600;
}

.star-box {
  color: #ffd666;
  cursor: pointer;
}
</style>
