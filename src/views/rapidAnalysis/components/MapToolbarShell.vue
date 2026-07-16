<template>
  <div class="task-list-box">
    <div class="toolbar-row">
      <div class="toolbar-region">
        <slot name="region" />
      </div>
      <div class="button" @click="$emit('identify')">
        <img
          src="../../../assets/images/rapidAnalysis/dwcxIcon.png"
          alt=""
          class="toolbar-icon"
        />点位查询
      </div>
      <div class="button" @click="$emit('open-layers')">
        <img
          src="../../../assets/images/rapidAnalysis/jctcIcon.png"
          alt=""
          class="toolbar-icon"
        />基础图层
      </div>
      <div class="button" @click="$emit('open-favorites')">
        <a-icon
          type="star"
          style="font-size: 0.2rem;height: 0.2rem;margin-right: 0.05rem;color: #98CCFF;"
        />
        收藏夹
      </div>
      <div
        class="button"
        @click="$emit('toggle-task-list')"
        v-if="showTaskListBtn"
      >
        <a-icon
          type="profile"
          style="font-size: 18px;color: #1890ff;padding-right: 5px;"
        />
        任务列表
        <a-icon
          :type="taskListOpen ? 'up' : 'down'"
          style="font-size: 14px;padding-left: 5px;"
        />
      </div>
    </div>
    <slot name="task-list" />
  </div>
</template>

<script>
export default {
  name: "MapToolbarShell",
  props: {
    showTaskListBtn: { type: Boolean, default: true },
    taskListOpen: { type: Boolean, default: false }
  }
};
</script>

<style scoped lang="less">
.task-list-box {
  position: absolute;
  right: 4.6rem;
  top: 0.2rem;
  z-index: 1;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
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
  border-image: linear-gradient(
      180deg,
      #269bff,
      rgba(62, 173, 242, 0) 37%,
      rgba(41, 170, 232, 0) 65%,
      #3e99ff
    )
    1 1;
  border-radius: 4px;

  .toolbar-row {
    display: flex;
  }

  .button {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-left: 0;
    padding: 0 0.05rem;
    height: 0.4rem;
    line-height: 0.4rem;
    text-align: center;
    font-size: 0.14rem;
    font-weight: 500;
  }

  .toolbar-icon {
    font-size: 0.2rem;
    height: 0.2rem;
    margin-right: 0.05rem;
  }
}
</style>
