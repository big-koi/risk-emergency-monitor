<template>
  <div class="case-collection-panels">
    <!-- 查看案例列表 -->
    <div
      class="case-collection-wrapper"
      v-if="seeShow"
      style="width: 400px;height: 500px;top: 70px;left: 1060px;"
    >
      <div class="case-collection-header">
        <div class="case-collection-title">
          <img
            src="../../../assets/images/rapidAnalysis/mark.png"
            alt=""
            class="title-icon"
          />
          <span>收藏夹</span>
        </div>
        <div>
          <a-icon
            type="fullscreen"
            class="case-collection-fullscreen"
            @click="$emit('open-list-details')"
          />
          <a-icon
            type="close-circle"
            class="case-collection-close"
            @click="$emit('update:seeShow', false)"
          />
        </div>
      </div>
      <div class="case-collection-content">
        <div class="case-list-search-box">
          <a-input-search
            :value="searchValue"
            allowClear
            placeholder="请输入关键词"
            class="case-search-input"
            @change="onSearchChange"
            @search="$emit('search')"
          />
          <a-button
            type="primary"
            icon="audit"
            class="case-search-btn"
            @click="$emit('create')"
          >
            创建案例
          </a-button>
        </div>
        <ul class="case-list-box">
          <li v-for="(item, index) in caseList" :key="index">
            <span class="case-name" :title="item.case_name">{{
              item.case_name
            }}</span>
            <span class="see-case-btn" @click="$emit('view', item)">查看</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 选择案例加入收藏 -->
    <div
      class="case-collection-wrapper"
      style="width: 492px;height: 324px;"
      v-if="selectShow"
    >
      <div class="case-collection-header">
        <div class="case-collection-title">
          <a-icon type="file-search" class="title-icon" />
          <span>加入收藏</span>
        </div>
        <div>
          <a-icon
            type="close-circle"
            class="case-collection-close"
            @click="$emit('update:selectShow', false)"
          />
        </div>
      </div>
      <div class="case-collection-content">
        <div class="case-collection-item">
          <div class="label-name">选择案例：</div>
          <a-select
            :value="selectValue"
            style="width: 100%;"
            placeholder="请选择案例"
            @change="$emit('select-change', $event)"
          >
            <a-select-option
              :value="item.case_id"
              v-for="(item, index) in caseList"
              :key="index"
            >
              {{ item.case_name }}
            </a-select-option>
          </a-select>
        </div>
        <div class="case-collection-tips">
          没有找到案例？<span
            class="case-collection-tips-link"
            @click="$emit('create')"
            >创建新的案例</span
          >
        </div>
        <div class="case-collection-btn-box" style="margin-top: 50px;">
          <button
            class="case-collection-btn case-collection-btn-cancel"
            @click="$emit('update:selectShow', false)"
          >
            取消
          </button>
          <button
            class="case-collection-btn case-collection-btn-confirm"
            @click="$emit('confirm-add')"
          >
            确定
          </button>
        </div>
      </div>
    </div>

    <!-- 案例列表放大 -->
    <div class="case-collection-wrapper-shadow" v-if="listShow">
      <div
        class="case-collection-wrapper case-collection-wrapper-center"
        style="width: 800px;height: 500px;"
      >
        <div class="case-collection-header">
          <div class="case-collection-title">
            <a-icon type="file-search" class="title-icon" />
            <span>收藏夹</span>
          </div>
          <div>
            <a-icon
              type="close-circle"
              class="case-collection-close"
              @click="$emit('update:listShow', false)"
            />
          </div>
        </div>
        <div class="case-collection-content">
          <div class="case-list-search-box" style="margin-bottom: 20px;">
            <a-input-search
              :value="searchValue"
              allowClear
              placeholder="请输入关键词"
              class="case-search-input"
              @change="onSearchChange"
              @search="$emit('search')"
            />
            <a-button
              type="primary"
              icon="audit"
              class="case-search-btn"
              @click="$emit('create')"
            >
              创建案例
            </a-button>
          </div>
          <a-table
            :columns="columns"
            :data-source="caseList"
            :pagination="false"
            :scroll="{ y: 300 }"
            size="small"
          >
            <span slot="num" slot-scope="text, record, index">
              <span>{{ index + 1 }}</span>
            </span>
            <span slot="action" slot-scope="text, record">
              <a-space>
                <a
                  class="case-table-action case-table-action-view"
                  @click="$emit('view', record)"
                  >查看</a
                >
                <a
                  class="case-table-action case-table-action-delete"
                  @click="$emit('delete', record, '1')"
                  >删除</a
                >
              </a-space>
            </span>
          </a-table>
        </div>
      </div>
    </div>

    <!-- 查看案例详情收起 -->
    <div
      class="case-collection-wrapper"
      style="width: 270px;height: 40px;"
      v-if="detailsShow && fullscreen"
    >
      <div
        class="case-collection-header"
        style="height: 40px;padding-right: 10px;"
      >
        <div class="case-collection-title">
          <a-icon type="file-search" class="title-icon" />
          <span>查看案例</span>
        </div>
        <div>
          <a-icon
            type="fullscreen"
            class="case-collection-fullscreen"
            @click="$emit('expand-details')"
          />
          <a-icon
            type="close-circle"
            class="case-collection-close"
            @click="$emit('close-details')"
          />
        </div>
      </div>
    </div>

    <!-- 查看案例详情 -->
    <div
      class="case-collection-wrapper"
      v-drag-resizable
      style="width: 530px;height: calc(100vh - 340px);"
      v-if="detailsShow && !fullscreen"
    >
      <div class="case-collection-header">
        <div class="case-collection-title">
          <a-icon type="file-search" class="title-icon" />
          <span>{{ isNewCaseMode ? "创建案例" : "案例查看" }}</span>
        </div>
        <div>
          <a-icon
            type="fullscreen-exit"
            class="case-collection-fullscreen"
            @click="$emit('collapse-details')"
          />
          <a-icon
            type="close-circle"
            class="case-collection-close"
            @click="$emit('close-details')"
          />
        </div>
      </div>
      <caseMain
        :caseId="caseDetailsId"
        ref="caseMain"
        @handleSaveCase="$emit('save', $event)"
        @caseHistoryTaskClick="$emit('history-task', $event)"
        @seePrint="$emit('see-print', $event)"
      />
      <div class="case-collection-btn-box">
        <button
          class="case-collection-btn case-collection-btn-cancel"
          @click="$emit('close-details')"
        >
          取消
        </button>
        <button
          class="case-collection-btn case-collection-btn-confirm"
          @click="$emit('save')"
        >
          保存
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import caseMain from "../../../components/rapidAnalysis/caseMain.vue";

const CASE_COLUMNS = [
  {
    title: "序号",
    width: 80,
    align: "center",
    scopedSlots: { customRender: "num" }
  },
  {
    title: "案例名称",
    key: "case_name",
    dataIndex: "case_name"
  },
  {
    title: "灾害过程日期",
    dataIndex: "zhgcrq",
    key: "zhgcrq"
  },
  {
    title: "受灾区域",
    dataIndex: "xzqmc",
    key: "xzqmc",
    ellipsis: true,
    width: 250
  },
  {
    title: "操作",
    key: "action",
    width: 120,
    scopedSlots: { customRender: "action" }
  }
];

export default {
  name: "CaseCollectionPanels",
  components: { caseMain },
  props: {
    seeShow: { type: Boolean, default: false },
    selectShow: { type: Boolean, default: false },
    listShow: { type: Boolean, default: false },
    detailsShow: { type: Boolean, default: false },
    fullscreen: { type: Boolean, default: false },
    caseList: { type: Array, default: () => [] },
    searchValue: { type: [String, Number], default: "" },
    selectValue: { default: undefined },
    caseDetailsId: { type: [String, Number], default: "" },
    isNewCaseMode: { type: Boolean, default: false }
  },
  data() {
    return {
      columns: CASE_COLUMNS
    };
  },
  methods: {
    onSearchChange(e) {
      const val = e && e.target !== undefined ? e.target.value : e;
      this.$emit("update:searchValue", val);
    },
    /** 供父组件访问 caseMain 实例 */
    getCaseMain() {
      return this.$refs.caseMain || null;
    }
  }
};
</script>

<style lang="less">
/* 非 scoped：沿用原 index.less 案例样式类名，保证布局一致 */
.case-collection-panels {
  .case-collection-wrapper {
    position: absolute;
    top: 0.5rem;
    left: 1rem;
    width: 4rem;
    height: 5rem;
    background: linear-gradient(
      318deg,
      rgba(0, 60, 114, 0.92) 2%,
      rgba(0, 62, 132, 0.88) 100%
    );
    border: 0.01rem solid;
    border-image: linear-gradient(
        179deg,
        #59b2ff 1%,
        rgba(62, 173, 242, 0) 37%,
        rgba(41, 170, 232, 0) 65%,
        #2bc7ff 100%
      )
      1 1;
    border-radius: 0.06rem;
    z-index: 999;
    color: #c2e1ff;
    font-size: 0.14rem;
    line-height: 1.4;

    .case-collection-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 0.44rem;
      min-height: 0.44rem;
      background: linear-gradient(
        280deg,
        rgba(0, 134, 255, 0.22) 11%,
        rgba(21, 145, 219, 0.59) 92%
      );
      border-radius: 0.06rem 0.06rem 0 0;
      padding: 0 0.16rem;
      cursor: grab;

      .case-collection-title {
        display: flex;
        align-items: center;
        font-size: 0.16rem;
        font-weight: 600;
        color: #ffffff;

        .title-icon {
          font-size: 0.16rem;
          padding-right: 0.08rem;
        }
      }

      .case-collection-fullscreen,
      .case-collection-close {
        font-size: 0.16rem;
        color: #c2e1ff;
        cursor: pointer;
      }

      .case-collection-fullscreen {
        padding-right: 0.08rem;
      }
    }

    .case-collection-content {
      padding: 0.12rem 0.14rem 0.14rem;
      overflow-y: auto;
      height: calc(100% - 0.44rem);

      .case-collection-item .label-name {
        font-size: 0.14rem;
        color: #ffffff;
        margin-bottom: 0.08rem;
      }

      .case-collection-tips {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 0.48rem;
        font-size: 0.13rem;
        color: rgba(255, 255, 255, 0.85);

        .case-collection-tips-link {
          text-decoration: underline;
          color: #ff9300;
          cursor: pointer;
        }
      }

      .case-list-search-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.08rem;
        margin-bottom: 0.1rem;

        .case-search-input {
          flex: 1;
          min-width: 0;
        }

        .case-search-btn {
          flex-shrink: 0;
          height: 0.32rem;
          padding: 0 0.1rem;
          font-size: 0.13rem;
        }
      }

      .case-list-box {
        margin: 0;
        padding: 0;
        list-style: none;
        height: calc(100% - 0.42rem);
        max-height: 3.8rem;
        overflow-y: auto;

        li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.1rem;
          min-height: 0.36rem;
          padding: 0.06rem 0.1rem;
          margin-bottom: 0.06rem;
          font-size: 0.13rem;
          color: rgba(255, 255, 255, 0.88);
          background: linear-gradient(
            90deg,
            rgba(15, 85, 166, 0.22) 2%,
            rgba(15, 86, 145, 0.4)
          );
          border: 0.01rem solid rgba(84, 144, 208, 0.45);
          border-left: 0.02rem solid #8dd4ff;
          border-radius: 0.02rem;

          .case-name {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .see-case-btn {
            flex-shrink: 0;
            color: #70b8ff;
            cursor: pointer;
          }
        }
      }
    }

    .case-collection-btn-box {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.1rem 0.14rem 0.14rem;

      .case-collection-btn {
        width: 0.96rem;
        height: 0.32rem;
        background: linear-gradient(
          304deg,
          rgba(0, 98, 186, 0.58) 6%,
          rgba(0, 92, 147, 0.62) 93%
        );
        border: 0.01rem solid #59b2ff;
        border-radius: 0.04rem;
        color: #53deff;
        font-size: 0.13rem;
        cursor: pointer;
        outline: none;
      }

      .case-collection-btn-confirm {
        background: linear-gradient(
            134deg,
            rgba(0, 88, 163, 0.35),
            #00506d 99%
          ),
          linear-gradient(
            180deg,
            rgba(0, 183, 239, 0.39),
            rgba(74, 175, 248, 0.14) 30%,
            rgba(48, 190, 246, 0.36) 78%,
            rgba(38, 172, 255, 0.82)
          );
        color: #ffffff;
        margin-left: 0.12rem;
      }
    }

    .case-table-action-view {
      color: #70b8ff;
      cursor: pointer;
    }

    .case-table-action-delete {
      color: #ff7a00;
      cursor: pointer;
    }
  }

  .case-collection-wrapper-shadow {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    position: absolute;
    left: 0;
    top: 0;
    z-index: 999;
  }

  .case-collection-wrapper-center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
