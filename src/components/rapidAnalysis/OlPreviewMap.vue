<template>

  <div class="ol-preview-panel" v-show="visible">

    <div class="ol-preview-header">

      <span class="ol-preview-title">OpenLayers 预览（对照）</span>

      <span class="ol-preview-meta">{{ regionHint }}</span>

      <a-icon type="close" class="ol-preview-close" @click="$emit('close')" />

    </div>

    <div ref="mapEl" class="ol-preview-map"></div>

    <div class="ol-preview-footer">

      {{ footerText }}

    </div>

  </div>

</template>



<script>

import { createOpenLayersPreview } from "@/map";



const IMAGE_LAYER_ID = "ol-preview-image";



export default {

  name: "OlPreviewMap",

  props: {

    visible: {

      type: Boolean,

      default: false

    },

    regionCode: {

      type: String,

      default: ""

    },

    regionName: {

      type: String,

      default: ""

    },

    /** { url, imageExtent, opacity } 实况/短临栅格对照 */

    imageLayer: {

      type: Object,

      default: null

    }

  },

  data() {

    return {

      adapter: null,

      inited: false,

      boundaryStatus: "idle",

      hasImage: false

    };

  },

  computed: {

    regionHint() {

      if (!this.regionCode) return "全国";

      return `${this.regionName || "-"} (${this.regionCode})`;

    },

    footerText() {

      if (!this.inited) return "OpenLayers 初始化中…";

      const imgTip = this.hasImage ? " · 已叠降雨栅格" : "";

      if (!this.regionCode) {

        return `全国范围 · 选择行政区后加载边界对照${imgTip}`;

      }

      if (this.boundaryStatus === "loading") {

        return `加载边界 ${this.regionCode}…${imgTip}`;

      }

      if (this.boundaryStatus === "ok") {

        return `已叠加行政区边界 · ${this.regionCode}${imgTip}`;

      }

      if (this.boundaryStatus === "fallback") {

        return `无市级边界文件，已回退省界/全国 · ${this.regionCode}${imgTip}`;

      }

      return `自研 OL 预览 · 不影响主业务地图${imgTip}`;

    }

  },

  watch: {

    visible(val) {

      if (val) {

        this.$nextTick(() => this.ensureMap());

      }

    },

    regionCode() {

      this.syncView();

    },

    imageLayer: {

      deep: true,

      handler() {

        this.syncImageLayer();

      }

    }

  },

  mounted() {

    if (this.visible) {

      this.$nextTick(() => this.ensureMap());

    }

    window.addEventListener("resize", this.handleResize);

  },

  beforeDestroy() {

    window.removeEventListener("resize", this.handleResize);

    if (this.adapter) {

      this.adapter.destroy();

      this.adapter = null;

    }

  },

  methods: {

    ensureMap() {

      if (!this.visible || !this.$refs.mapEl) return;

      if (!this.adapter) {

        this.adapter = createOpenLayersPreview();

      }

      if (!this.inited) {

        this.adapter

          .init(this.$refs.mapEl, { zoom: 4 })

          .then(() => {

            this.inited = true;

            this.syncView();

            this.syncImageLayer();

          })

          .catch(err => {

            console.warn("[OlPreviewMap]", err && err.message);

          });

      } else {

        this.adapter.resize();

        this.syncView();

        this.syncImageLayer();

      }

    },

    syncView() {

      if (!this.adapter || !this.inited) return;

      if (!this.regionCode) {

        this.boundaryStatus = "idle";

        this.adapter.goNationalView();

        this.syncImageLayer();

        return;

      }

      this.boundaryStatus = "loading";

      const requested = String(this.regionCode);

      this.adapter.fitRegion(requested).then(ok => {

        if (String(this.regionCode) !== requested) return;

        this.boundaryStatus = ok ? "ok" : "fallback";

        this.syncImageLayer();

      });

    },

    syncImageLayer() {

      if (!this.adapter || !this.inited) return;

      const layer = this.imageLayer;

      if (!layer || !layer.url || !layer.imageExtent) {

        this.adapter.removeLayer(IMAGE_LAYER_ID);

        this.hasImage = false;

        return;

      }

      this.adapter.addLayer({

        id: IMAGE_LAYER_ID,

        type: "image",

        url: layer.url,

        imageExtent: layer.imageExtent,

        opacity: layer.opacity != null ? layer.opacity : 0.55,

        zIndex: 8,

        projection: layer.projection || "EPSG:4326"

      });

      this.hasImage = true;

    },

    handleResize() {

      if (this.visible && this.adapter) {

        this.adapter.resize();

      }

    }

  }

};

</script>



<style scoped lang="less">

.ol-preview-panel {

  position: fixed;

  right: 4.6rem;

  bottom: 0.16rem;

  z-index: 1190;

  width: 3.6rem;

  background: rgba(8, 32, 64, 0.92);

  border: 1px solid rgba(100, 177, 255, 0.45);

  border-radius: 4px;

  overflow: hidden;

  color: #e8f4ff;

}



.ol-preview-header {

  display: flex;

  align-items: center;

  gap: 0.08rem;

  padding: 0.08rem 0.1rem;

  border-bottom: 1px solid rgba(100, 177, 255, 0.2);

}



.ol-preview-title {

  font-weight: 600;

  color: #98ccff;

  font-size: 0.12rem;

}



.ol-preview-meta {

  flex: 1;

  text-align: right;

  font-size: 0.1rem;

  color: #7aa6d2;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

}



.ol-preview-close {

  cursor: pointer;

  color: #64b1ff;

  font-size: 0.12rem;

}



.ol-preview-map {

  width: 100%;

  height: 2.4rem;

  background: #0a1a30;

}



.ol-preview-footer {

  padding: 0.06rem 0.1rem;

  font-size: 0.1rem;

  color: #6a90b0;

  border-top: 1px solid rgba(100, 177, 255, 0.15);

}

</style>


