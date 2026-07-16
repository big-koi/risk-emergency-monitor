
<script>
export default {
  name:'WidgetModal',
  props: {
    visible: {},
    left: {
      type: String,
      default: 'auto'
    },
    top: {
      type: String,
      default: 'auto'
    },
    bottom: {
      type: String,
    },
    right: {
      type: String,
    },
    isFullscreen: {
      type: Boolean,
      default: false
    },
    title: "",
    modalProps: {
      type: Object,
    },
  },
  data() {
    return {
      showVisible: false,
      Fullscreen: false,
      width: '',
      height:'',
    };
  },
  render(h) {
    if (!this.visible) return null
    if(this.modalProps.wrapClassName==undefined) this.modalProps.wrapClassName='';
    return h('div', {},[ h("a-modal", {
        props: {
          visible: this.visible,
          ...this.modalProps,
          wrapClassName: "weiget-modal-warp "+this.modalProps.wrapClassName
        },
        ref: "dialogWrapImport",
        attrs: {
          dialogClass: "weiget-modal "+ this.modalProps.wrapClassName,
          dialogStyle: {
            left: this.left,
            top: this.top,
            bottom: this.bottom,
            right: this.right
          }
        },
        directives: [
          {
            name: "draggable",
            value: { trigger: ".ant-modal-header", body: ".ant-modal-content", left: "100", top: "200" },
            modifiers: {
              trigger: true,
            },
          },
        ],
        on: {
          ok: this.ok,
          cancel: this.close,
        },
      },
      [
        h(
          "div",
          {
            slot: "title",
            attrs: {
              class: "weiget-title",
            },
          },
          [
            h("span", this.title),
            h('div', {
              attrs: {
                class: "weiget-handler",
              }
            },[
              (function(that) {
                if(that.isFullscreen) {
                 return h("a-icon", {
                    attrs: {
                      class: "weiget-fullscreen",
                      type: that.Fullscreen ? "fullscreen-exit" : 'fullscreen',
                    },
                    style: {
                      cursor: "pointer",
                    },
                    on: {
                      click: that.handleFullscreen,
                    },
                  })
                }
              })(this),
            ])
          ]
        ),
        h(
          "div",
          {
            slot: "closeIcon",
            attrs: {
              class: "close-Icon",
            },
          },
          [
            h("diit-icon",{
              attrs: {
                type: "guanbianniu",
              },
            }),
          ]
        ),
        this.$slots.default,
      ]
    )]);
  },
  methods: {
    close() {
      if (this.Fullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        this.modalProps.width = this.width
        this.modalProps.height = this.height
        this.Fullscreen = false;
      }
      this.$emit("cancel");
    },
    ok() {
      if (this.Fullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        this.modalProps.width = this.width
        this.modalProps.height = this.height
        this.Fullscreen = false;
      }
      this.$emit("ok");
    },
    handleFullscreen(e) {
     let main2=e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
      let main=e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement;
      if (this.Fullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        this.modalProps.width = this.width
        this.modalProps.height = this.height
      } else {
        if (main.requestFullscreen) {
          main2.requestFullscreen();
        } else if (main.mozRequestFullScreen) {
          main2.mozRequestFullScreen();
        } else if (main.webkitRequestFullScreen) {
          main2.webkitRequestFullScreen();
        } else if (main.msRequestFullscreen) {
          main2.msRequestFullscreen();
        }
        this.modalProps.width = '100%'
      }
      this.Fullscreen = !this.Fullscreen;
    },
    exitFullscreen() {
      let isFullscreen =
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.fullScreen ||
        document.mozFullScreen ||
        document.webkitIsFullScreen;
      isFullscreen = !!isFullscreen;
      if (isFullscreen == false) {
        this.Fullscreen = false;
      }
    }
  },
  mounted() {
    this.width = this.modalProps.width || '500px'
    document.addEventListener("fullscreenchange", () => {
      this.exitFullscreen()
    });
    document.addEventListener("mozfullscreenchange", () => {
      this.exitFullscreen()
    });
    document.addEventListener("webkitfullscreenchange", () => {
      this.exitFullscreen()
    });
    document.addEventListener("msfullscreenchange", () => {
      this.exitFullscreen()
    });
  },
  watch: {
    visible() {
      this.showVisible = this.visible;
    },
  },
};
</script>

<style lang="less">
.close-Icon {
  color: var(--fontColor);
}
.weiget-title {
  display: flex;
  justify-content: space-between;
  padding-right: 25px;
  padding-left:18px;
}
.weiget-modal-warp {
  right: auto;
  bottom: auto;
}
.weiget-modal{
  top: 0;
  // height: 100%;
}
.weiget-modal {
  .ant-modal-body{
    width: 100%;
    padding:10px 15px;
  }
}
.weiget-handler{
  padding-top: 2px;
  color: #d2d3d1;
  font-weight: bold;
  font-size: 18px;
  vertical-align: bottom;
}
.weiget-handler i {
  margin: 0 4px;
}
.weiget-modal-warp{
  overflow: initial;
  height: 0;
  width: 0;
}
.weiget-modal{
  position:fixed !important;
  padding-bottom:0px;
}
.weiget-modal .ant-modal-content {
  height: 100%;
  width: 100%;
  background: var(--bgColor) !important;
}

</style>
