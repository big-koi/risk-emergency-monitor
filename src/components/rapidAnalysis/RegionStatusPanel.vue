<template>
  <div class="region-status-panel" :class="{ collapsed: collapsed }">
    <div class="region-status-header" @click="collapsed = !collapsed">
      <span class="region-status-title">重构状态 · 行政区</span>
      <span class="region-status-badge" :class="mapReady ? 'ok' : 'warn'">
        {{ mapReady ? facadeLabel : "地图未挂载" }}
      </span>
      <a-icon :type="collapsed ? 'up' : 'down'" class="region-status-toggle" />
    </div>
    <div v-show="!collapsed" class="region-status-body">
      <div class="region-status-row">
        <span class="label">灾种</span>
        <span class="value">{{ moduleLabel }}</span>
      </div>
      <div class="region-status-row">
        <span class="label">浏览</span>
        <span class="value">{{ browseText }}</span>
      </div>
      <div class="region-status-row">
        <span class="label">钻取</span>
        <span class="value" :class="{ highlight: isDrilling }">
          {{ drillText }}
        </span>
      </div>
      <div class="region-status-row">
        <span class="label">查询码</span>
        <span class="value mono">{{ queryCode || "全国" }}</span>
      </div>
      <div class="region-status-row">
        <span class="label">地图码</span>
        <span class="value mono">{{ mapCode || "全国" }}</span>
      </div>
      <div class="region-status-row">
        <span class="label">预警码</span>
        <span class="value mono">{{ warningCode || "全国" }}</span>
      </div>
      <div class="region-status-row">
        <span class="label">查询源</span>
        <span class="value highlight">Store · Facade图例</span>
      </div>
      <div class="region-status-actions">
        <button
          type="button"
          class="region-status-btn"
          :class="{ active: olPreviewVisible }"
          @click.stop="$emit('toggle-ol-preview')"
        >
          {{ olPreviewVisible ? "关闭 OL 预览" : "打开 OL 预览" }}
        </button>
      </div>
      <div class="region-status-tip">
        图例已拆；addImage/定位经 Facade；统计 option 模块化
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { DISASTER_MODULE } from "@/domain/region/constants";
import { tryGetMapFacade } from "@/map";

const MODULE_LABELS = {
  [DISASTER_MODULE.SHORT_TERM_FORECAST]: "短临预报",
  [DISASTER_MODULE.LIVE_RAINFALL]: "实况降雨",
  [DISASTER_MODULE.URBAN_FLOOD]: "城市内涝",
  [DISASTER_MODULE.MOUNTAIN_FLOOD]: "山洪"
};

export default {
  name: "RegionStatusPanel",
  props: {
    olPreviewVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      collapsed: false,
      mapReady: false,
      engineName: "",
      timer: null
    };
  },
  computed: {
    ...mapGetters("region", [
      "browseRegion",
      "drillStack",
      "displayRegion",
      "queryCode",
      "mapRegion",
      "warningCode",
      "isDrilling",
      "currentModule"
    ]),
    moduleLabel() {
      return MODULE_LABELS[this.currentModule] || this.currentModule || "-";
    },
    browseText() {
      const r = this.browseRegion || {};
      if (!r.code) return "全国";
      return `${r.name || "-"} (${r.code})`;
    },
    drillText() {
      if (!this.isDrilling) return "无";
      const r = this.displayRegion || {};
      const depth = (this.drillStack && this.drillStack.length) || 0;
      return `${r.name || "-"} (${r.code}) · 层${depth}`;
    },
    mapCode() {
      const r = this.mapRegion || {};
      return r.code || "";
    },
    facadeLabel() {
      return this.engineName === "legacy"
        ? "Facade·Legacy"
        : this.engineName
          ? `Facade·${this.engineName}`
          : "MapFacade就绪";
    }
  },
  mounted() {
    this.refreshMapReady();
    this.timer = setInterval(this.refreshMapReady, 2000);
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
    refreshMapReady() {
      const facade = tryGetMapFacade();
      this.mapReady = !!(facade && facade.adapter);
      this.engineName = facade && facade.getEngineName
        ? facade.getEngineName()
        : "";
    }
  }
};
</script>

<style scoped lang="less">
.region-status-panel {
  position: fixed;
  left: 0.72rem;
  bottom: 0.16rem;
  z-index: 1200;
  width: 2.8rem;
  background: rgba(8, 32, 64, 0.88);
  border: 1px solid rgba(100, 177, 255, 0.45);
  border-radius: 4px;
  color: #e8f4ff;
  font-size: 0.12rem;
  backdrop-filter: blur(4px);
  user-select: none;
}

.region-status-header {
  display: flex;
  align-items: center;
  gap: 0.08rem;
  padding: 0.08rem 0.1rem;
  cursor: pointer;
  border-bottom: 1px solid rgba(100, 177, 255, 0.2);
}

.region-status-title {
  flex: 1;
  font-weight: 600;
  color: #98ccff;
}

.region-status-badge {
  font-size: 0.1rem;
  padding: 0.02rem 0.06rem;
  border-radius: 2px;
  &.ok {
    background: rgba(64, 196, 120, 0.25);
    color: #7dffb2;
  }
  &.warn {
    background: rgba(255, 173, 0, 0.2);
    color: #ffad00;
  }
}

.region-status-toggle {
  color: #64b1ff;
  font-size: 0.12rem;
}

.region-status-body {
  padding: 0.08rem 0.1rem 0.1rem;
}

.region-status-row {
  display: flex;
  margin-bottom: 0.04rem;
  line-height: 1.4;
  .label {
    width: 0.48rem;
    flex-shrink: 0;
    color: #7aa6d2;
  }
  .value {
    flex: 1;
    word-break: break-all;
    &.mono {
      font-family: Consolas, Monaco, monospace;
      color: #b8e0ff;
    }
    &.highlight {
      color: #ffd666;
    }
  }
}

.region-status-actions {
  margin-top: 0.06rem;
}

.region-status-btn {
  width: 100%;
  padding: 0.04rem 0.08rem;
  background: rgba(100, 177, 255, 0.15);
  border: 1px solid rgba(100, 177, 255, 0.4);
  color: #98ccff;
  border-radius: 2px;
  cursor: pointer;
  font-size: 0.11rem;
  &.active {
    background: rgba(255, 214, 102, 0.2);
    border-color: rgba(255, 214, 102, 0.5);
    color: #ffd666;
  }
}

.region-status-tip {
  margin-top: 0.06rem;
  padding-top: 0.06rem;
  border-top: 1px dashed rgba(100, 177, 255, 0.25);
  color: #6a90b0;
  font-size: 0.1rem;
}

.collapsed .region-status-header {
  border-bottom: none;
}
</style>
