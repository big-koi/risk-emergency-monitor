<template>
  <div class="warning-city-side-panel">
    <!-- 暴雨 -->
    <div
      v-if="disasterTypeIndex === 1"
      class="side-card"
      @click="$emit('update:byVisible', true)"
    >
      <span>暴雨预警城市</span>
      >
      <div class="banner">+{{ byChange }}</div>
      <p class="change-count">
        <b>{{ byCount }}</b>个
      </p>
    </div>
    <a-modal
      :visible="byVisible"
      title="暴雨预警城市"
      centered
      :width="800"
      :bodyStyle="{ padding: '0px 20px' }"
      wrapClassName="byyj-model"
      @ok="$emit('update:byVisible', false)"
      @cancel="$emit('update:byVisible', false)"
    >
      <a-table
        :columns="byColumns"
        :data-source="byData"
        :pagination="false"
        :scroll="{ y: 320 }"
        bordered
      >
        <span slot="num" slot-scope="text, record, index">
          <div style="position: relative;">
            <img
              :src="newIcon"
              alt=""
              style="position: absolute;top: -10px;left: -10px;"
              v-if="record.isnew === 'true'"
            />
            <span style="padding-left: 10px;">{{ index + 1 }}</span>
          </div>
        </span>
        <span slot="star" slot-scope="text, record" v-if="showStar">
          <a-icon
            type="star"
            style="cursor: pointer;"
            @click="$emit('star-case', record, '1', '1')"
          />
        </span>
      </a-table>
    </a-modal>

    <!-- 内涝 -->
    <div
      v-if="disasterTypeIndex === 3"
      class="side-card"
      @click="$emit('update:nlVisible', true)"
    >
      <span>{{ csnlValue == 1 ? "内涝预警城市" : "内涝城市" }}</span>
      >
      <div class="banner">+{{ nlChange }}</div>
      <p class="change-count">
        <b>{{ nlCount }}</b>个
      </p>
    </div>
    <a-modal
      :visible="nlVisible"
      :title="csnlValue == 1 ? '内涝预警城市' : '内涝城市'"
      centered
      :width="800"
      :bodyStyle="{ padding: '0px 20px' }"
      wrapClassName="nlyj-model"
      @ok="$emit('update:nlVisible', false)"
      @cancel="$emit('update:nlVisible', false)"
    >
      <a-table
        :columns="nlColumns"
        :data-source="nlData"
        :pagination="false"
        :scroll="{ y: 210 }"
        bordered
      >
        <span slot="num" slot-scope="text, record, index">
          <div style="position: relative;">
            <img
              :src="newIcon"
              alt=""
              style="position: absolute;top: -10px;left: -10px;"
              v-if="record.isnew === 'true'"
            />
            <span style="padding-left: 10px;">{{ index + 1 }}</span>
          </div>
        </span>
        <span slot="yjlevel" slot-scope="text, record">
          <a-button
            type="primary"
            v-if="record.yjlevel === '红色预警'"
            style="background: #FC5558;border: none;"
          >
            {{ record.yjlevel }}
          </a-button>
          <a-button
            type="primary"
            v-if="record.yjlevel === '橙色预警'"
            style="background: #FD7823;border: none;"
          >
            {{ record.yjlevel }}
          </a-button>
          <a-button
            type="primary"
            v-if="record.yjlevel === '黄色预警'"
            style="background: #F5AB18;border: none;"
          >
            {{ record.yjlevel }}
          </a-button>
          <a-button
            type="primary"
            v-if="record.yjlevel === '蓝色预警'"
            style="background: #5B86FC;border: none;"
          >
            {{ record.yjlevel }}
          </a-button>
          <a-button
            type="primary"
            v-if="record.yjlevel === '无预警'"
            style="background: #5B86FC;border: none;"
          >
            {{ record.yjlevel }}
          </a-button>
        </span>
        <span slot="star" slot-scope="text, record" v-if="showStar">
          <a-icon
            type="star"
            style="cursor: pointer;"
            @click="$emit('star-case', record, '1', '2')"
          />
        </span>
      </a-table>
    </a-modal>

    <!-- 山洪（计数沿用原逻辑：nlChange / nlCount） -->
    <div
      v-if="disasterTypeIndex === 4"
      class="side-card"
      @click="$emit('update:shVisible', true)"
    >
      <span>{{ shValue == 1 ? "山洪预警城市" : "山洪城市" }}</span>
      >
      <div class="banner">+{{ nlChange }}</div>
      <p class="change-count">
        <b>{{ nlCount }}</b>个
      </p>
    </div>
    <a-modal
      :visible="shVisible"
      :title="shValue == 1 ? '山洪预警城市' : '山洪城市'"
      centered
      wrapClassName="shyj-model"
      :width="800"
      :bodyStyle="{ padding: '0px 20px' }"
      @ok="$emit('update:shVisible', false)"
      @cancel="$emit('update:shVisible', false)"
    >
      <a-table
        :columns="nlColumns"
        :data-source="nlData"
        :pagination="false"
        :scroll="{ y: 210 }"
        bordered
      >
        <span slot="num" slot-scope="text, record, index">
          <div style="position: relative;">
            <img
              :src="newIcon"
              alt=""
              style="position: absolute;top: -10px;left: -10px;"
              v-if="record.isnew === 'true'"
            />
            <span style="padding-left: 10px;">{{ index + 1 }}</span>
          </div>
        </span>
        <span slot="yjlevel" slot-scope="text, record">
          <a-button
            type="primary"
            v-if="record.yjlevel === '红色预警'"
            style="background: #FC5558;border: none;"
          >
            {{ record.yjlevel }}
          </a-button>
          <a-button
            type="primary"
            v-if="record.yjlevel === '橙色预警'"
            style="background: #FD7823;border: none;"
          >
            {{ record.yjlevel }}
          </a-button>
          <a-button
            type="primary"
            v-if="record.yjlevel === '黄色预警'"
            style="background: #F5AB18;border: none;"
          >
            {{ record.yjlevel }}
          </a-button>
          <a-button
            type="primary"
            v-if="record.yjlevel === '蓝色预警'"
            style="background: #5B86FC;border: none;"
          >
            {{ record.yjlevel }}
          </a-button>
          <a-button
            type="primary"
            v-if="record.yjlevel === '无预警'"
            style="background: #5B86FC;border: none;"
          >
            {{ record.yjlevel }}
          </a-button>
        </span>
        <span slot="star" slot-scope="text, record" v-if="showStar">
          <a-icon
            type="star"
            style="cursor: pointer;"
            @click="$emit('star-case', record, '1', '5')"
          />
        </span>
      </a-table>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: "WarningCitySidePanel",
  props: {
    disasterTypeIndex: { type: Number, required: true },
    byVisible: { type: Boolean, default: false },
    nlVisible: { type: Boolean, default: false },
    shVisible: { type: Boolean, default: false },
    byCount: { type: [Number, String], default: 0 },
    byChange: { type: [Number, String], default: 0 },
    byData: { type: Array, default: () => [] },
    byColumns: { type: Array, default: () => [] },
    nlCount: { type: [Number, String], default: 0 },
    nlChange: { type: [Number, String], default: 0 },
    nlData: { type: Array, default: () => [] },
    nlColumns: { type: Array, default: () => [] },
    csnlValue: { type: [String, Number], default: "1" },
    shValue: { type: [String, Number], default: "1" },
    showStar: { type: Boolean, default: false }
  },
  data() {
    return {
      newIcon: require("../../../assets/images/rapidAnalysis/new_icon.png")
    };
  }
};
</script>

<style scoped lang="less">
.side-card {
  position: absolute;
  left: 0.18rem;
  top: 4rem;
  z-index: 1;
  width: 1.42rem;
  height: 1.02rem;
  background: linear-gradient(0deg, #16446e 0%, #030c16);
  border: 0.01rem solid #1b94ff;
  border-radius: 0.06rem;
  color: #00fff1;
  text-align: center;
  font-size: 0.16rem;
  padding-top: 0.16rem;

  .banner {
    position: absolute;
    left: 60%;
    top: 40%;
    width: 0.26rem;
    height: 0.16rem;
    border-radius: 0.08rem;
    color: #fff;
    background-color: #f00;
    font-size: 0.12rem;
    line-height: 0.13rem;
  }

  span {
    text-decoration: underline;
    cursor: pointer;
  }

  .change-count {
    color: #4eb3ff;
    margin-top: 0.08rem;

    b {
      font-size: 0.24rem;
    }
  }
}
</style>
