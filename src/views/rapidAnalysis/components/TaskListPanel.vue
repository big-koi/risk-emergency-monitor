<template>
  <div class="task-list" v-if="visible">
    <div class="task-list-btn-box">
      <span
        class="task-list-return-btn"
        v-if="timeList.length > 0"
        @click="$emit('back')"
      >
        <a-icon type="left" />返回
      </span>
      <div
        class="switch-to-latest"
        @click="$emit('select-latest')"
        v-if="timeList.length === 0"
      >
        <a-icon type="sync" />
        切换至最新时间
      </div>
      <a-icon
        type="close-circle"
        style="cursor: pointer;"
        @click="$emit('close')"
        v-if="timeList.length === 0"
      />
    </div>
    <a-calendar
      :fullscreen="false"
      style="width: 100%;"
      @select="$emit('calendar-select', $event)"
      v-show="timeList.length === 0"
    />
    <ul class="tiem-list-box" v-if="timeList.length > 0">
      <li
        class="time-item"
        v-for="(item, index) in timeList"
        :key="index"
        :class="item.id != undefined ? 'time-item-active' : 'time-item-no-drop'"
      >
        <span class="time-item-name" @click="$emit('select-item', item)">{{
          formatTime ? formatTime(item.tasktime) : item.tasktime
        }}</span>
        <a-icon
          type="star"
          class="star-box"
          @click="$emit('star', item)"
          v-if="showStar"
        />
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "TaskListPanel",
  props: {
    visible: { type: Boolean, default: false },
    timeList: { type: Array, default: () => [] },
    showStar: { type: Boolean, default: false },
    formatTime: { type: Function, default: null }
  }
};
</script>

<style scoped lang="less">
.task-list {
  margin-top: 0.12rem;
  width: 3rem;
  background: linear-gradient(
    318deg,
    rgba(0, 60, 114, 0.92) 2%,
    rgba(0, 62, 132, 0.88) 100%
  );
  border: 0.01rem solid #269bff;
  border-radius: 0.06rem;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  position: absolute;
  top: 35px;
  right: 0;
  z-index: 2;
  color: #fff;

  .task-list-btn-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 40px;
    border-bottom: 1px solid rgba(100, 157, 255, 0.45);

    .task-list-return-btn {
      cursor: pointer;
    }
  }

  .switch-to-latest {
    cursor: pointer;
    width: 1.6rem;
    height: 0.32rem;
    line-height: 0.32rem;
    text-align: center;
    background: linear-gradient(314deg, #115da3 9%, #125fb5 93%);
    border: 0.01rem solid #269bff;
    border-radius: 4px;
  }

  .tiem-list-box {
    width: 100%;
    max-height: 3.2rem;
    overflow-y: auto;
    margin: 8px 0 0;
    padding: 0;
    list-style: none;

    .time-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 4px;
      cursor: pointer;

      &.time-item-no-drop {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .time-item-name {
        flex: 1;
      }

      .star-box {
        color: #98ccff;
        margin-left: 8px;
      }
    }
  }
}
</style>
