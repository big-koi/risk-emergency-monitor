<template>
  <div class="resource-menu-wrapper">
    <a-button
      style="height: 45px; border-top: none; border-left: none; border-bottom: none;padding: 0 0.1rem; box-shadow: 0 0.01rem 0.03rem 0 rgba(0, 0, 0, 0.18);"
      @click="show"
    >
      <a-icon type="menu-fold" style="font-size: 0.24rem" />
      <span style="font-size: 14px; color: #000;">资源目录</span>
    </a-button>
    <div class="tree-wrapper" id="resource-tree-wrapper" v-if="visible">
      <a-tree
        slot="overlay"
        v-model="checkedKeys"
        checkable
        :show-line="true"
        :expanded-keys="expandedKeys"
        :auto-expand-parent="autoExpandParent"
        :selected-keys="selectedKeys"
        :replace-fields="replaceFields"
        :tree-data="treeData"
        @expand="onExpand"
        @select="onSelect"
        @check="onCheck"
      >
        <a-icon slot="switcherIcon" type="down" />
      </a-tree>
      <!-- <a-menu
        style="width: 100%"
        :default-selected-keys="['1']"
        :open-keys.sync="openKeys"
        mode="inline"
        @click="handleClick"
      >
        <a-sub-menu v-for="item in treeData" :key="item.ename" @titleClick="() => titleClick(item)">
          <span slot="title"
            ><span>{{ item.name }}</span></span
          >
          <a-menu-item-group v-for="child in item.children"  :key="child.ename">
            <template slot="title">
              <span>{{ child.name }}</span>
            </template>
            <a-menu-item v-for="subchild in child.children" :key="subchild.id">
              {{ subchild.name }}
            </a-menu-item>
          </a-menu-item-group>
        </a-sub-menu>
      </a-menu> -->
    </div>
  </div>
</template>

<script>
import { layerObj } from "@/../static/config/js/floodlayer.js";
export default {
  name: "ResourceMenu",
  data() {
    return {
      // openKeys: ["jichudili", "yunzaihuanjing", "chengzaiti"],
      visible: false,
      checkedKeys: [],
      expandedKeys: [
        "jichudili",
        "xzqh",
        "lyqh",
        "yunzaihuanjing",
        "dixing",
        "hewang",
        "chengzaiti",
        "renkou",
        "jingji",
        "nongzuowu",
        "jiaotong"
      ],
      autoExpandParent: true,
      selectedKeys: [],
      replaceFields: {
        title: "name",
        key: "ename"
      },
      // treeData: [
      //   {
      //     name: "基础地理",
      //     ename: "jichudili",
      //     type: 2,
      //     isactive: false,
      //     showright: false,
      //     icon: "jcdl.png",
      //     children: [
      //       {
      //         name: "行政区划",
      //         ename: "xzqh",
      //         type: 1,
      //         children: [
      //           {
      //             name: "省",
      //             ename: "sheng",
      //             id: '05'
      //           },
      //           {
      //             name: "市",
      //             ename: "shi",
      //             id: '06'
      //           },
      //           {
      //             name: "县",
      //             ename: "xian",
      //             id: '07'
      //           }
      //         ],
      //         isactive: false,
      //         showright: false
      //       },
      //       {
      //         name: "流域区划",
      //         ename: "lyqh",
      //         type: 1,
      //         children: [
      //           {
      //             name: "一级流域",
      //             ename: "first",
      //             id: '02'
      //           },
      //           {
      //             name: "二级流域",
      //             ename: "second",
      //             id: '03'
      //           },
      //           {
      //             name: "三级流域",
      //             ename: "third",
      //             id: '04'
      //           }
      //         ],
      //         isactive: false,
      //         showright: false
      //       }
      //     ]
      //   },
      //   {
      //     name: "孕灾环境",
      //     ename: "yunzaihuanjing",
      //     type: 2,
      //     isactive: false,
      //     showright: false,
      //     icon: "yunzai.png",
      //     children: [
      //       {
      //         name: "地形",
      //         ename: "dixing",
      //         type: 1,
      //         children: [
      //           {
      //             name: "DEM",
      //             ename: "DEM",
      //             id: '12'
      //           }
      //         ],
      //         isactive: false,
      //         showright: false
      //       },
      //       {
      //         name: "河网",
      //         ename: "hewang",
      //         type: 1,
      //         children: [
      //           {
      //             name: "河网水面",
      //             ename: "hwsm",
      //             id: '15'
      //           },
      //           {
      //             name: "线状河流",
      //             ename: "xzhl",
      //             id: '16'
      //           },
      //           {
      //             name: "小流域",
      //             ename: "xly",
      //             id: '17'
      //           },
      //           {
      //             name: "湖泊",
      //             ename: "hp",
      //             id: '18'
      //           }
      //         ],
      //         isactive: false,
      //         showright: false
      //       }
      //     ]
      //   },
      //   {
      //     name: "承灾体",
      //     ename: "chengzaiti",
      //     type: 1,
      //     isactive: false,
      //     showright: false,
      //     icon: "czt.png",
      //     children: [
      //       {
      //         name: "人口",
      //         ename: "renkou",
      //         type: 1,
      //         children: [
      //           {
      //             name: "人口格网",
      //             ename: "rkgw",
      //             id: '21'
      //           },
      //           {
      //             name: "人口密度",
      //             ename: "rkmd",
      //             id: '20'
      //           }
      //         ],
      //         isactive: false,
      //         showright: false
      //       },
      //       {
      //         name: "经济",
      //         ename: "jingji",
      //         type: 1,
      //         children: [
      //           {
      //             name: "GDP格网",
      //             ename: "GDP",
      //             id: '28'
      //           }
      //         ],
      //         isactive: false,
      //         showright: false
      //       },
      //       {
      //         name: "农作物",
      //         ename: "nongzuowu",
      //         type: 1,
      //         children: [
      //           {
      //             name: "耕地面积",
      //             ename: "gdmj",
      //             id: '23'
      //           },
      //           {
      //             name: "玉米",
      //             ename: "ym",
      //             id: '24'
      //           },
      //           {
      //             name: "小麦",
      //             ename: "xm",
      //             id: '25'
      //           },
      //           {
      //             name: "水稻",
      //             ename: "sd",
      //             id: '26'
      //           }
      //         ],
      //         isactive: false,
      //         showright: false
      //       },
      //       {
      //         name: "交通",
      //         ename: "jiaotong",
      //         type: 1,
      //         children: [
      //           {
      //             name: "国道",
      //             ename: "gd",
      //             id: '30'
      //           },
      //           {
      //             name: "高速公路",
      //             ename: "gsgl",
      //             id: '31'
      //           },
      //           {
      //             name: "机场",
      //             ename: "jc",
      //             id: '32'
      //           },
      //           {
      //             name: "铁路",
      //             ename: "tl",
      //             id: '33'
      //           }
      //         ],
      //         isactive: false,
      //         showright: false
      //       }
      //     ]
      //   }
      // ],
      treeData: [
        {
          name: "基础地理",
          ename: "jichudili",
          type: 2,
          isactive: false,
          showright: false,
          icon: "jcdl.png",
          children: [
            {
              name: "行政区划",
              ename: "xzqh",
              type: 1,
              children: [
                {
                  name: "省",
                  ename: "sheng",
                  id: "05"
                },
                {
                  name: "市",
                  ename: "shi",
                  id: "06"
                },
                {
                  name: "县",
                  ename: "xian",
                  id: "07"
                }
              ],
              isactive: false,
              showright: false,
              checkable: false
            },
            {
              name: "流域区划",
              ename: "lyqh",
              type: 1,
              children: [
                {
                  name: "一级流域",
                  ename: "first",
                  id: "02"
                },
                {
                  name: "二级流域",
                  ename: "second",
                  id: "03"
                },
                {
                  name: "三级流域",
                  ename: "third",
                  id: "04"
                }
              ],
              isactive: false,
              showright: false,
              checkable: false
            }
          ],
          checkable: false
        },
        {
          name: "孕灾环境",
          ename: "yunzaihuanjing",
          type: 2,
          isactive: false,
          showright: false,
          icon: "yunzai.png",
          children: [
            {
              name: "地形",
              ename: "dixing",
              type: 1,
              children: [
                {
                  name: "DEM",
                  ename: "DEM",
                  id: "12"
                }
              ],
              isactive: false,
              showright: false,
              checkable: false
            },
            {
              name: "河网",
              ename: "hewang",
              type: 1,
              children: [
                {
                  name: "河网水面",
                  ename: "hwsm",
                  id: "15"
                },
                {
                  name: "线状河流",
                  ename: "xzhl",
                  id: "16"
                },
                {
                  name: "小流域",
                  ename: "xly",
                  id: "17"
                },
                {
                  name: "湖泊",
                  ename: "hp",
                  id: "18"
                }
              ],
              isactive: false,
              showright: false,
              checkable: false
            }
          ],
          checkable: false
        },
        {
          name: "承灾体",
          ename: "chengzaiti",
          type: 1,
          isactive: false,
          showright: false,
          icon: "czt.png",
          children: [
            {
              name: "人口",
              ename: "renkou",
              type: 1,
              children: [
                {
                  name: "人口格网",
                  ename: "rkgw",
                  id: "21"
                },
                {
                  name: "人口密度",
                  ename: "rkmd",
                  id: "20"
                }
              ],
              isactive: false,
              showright: false,
              checkable: false
            },
            {
              name: "经济",
              ename: "jingji",
              type: 1,
              children: [
                {
                  name: "GDP格网",
                  ename: "GDP",
                  id: "28"
                }
              ],
              isactive: false,
              showright: false,
              checkable: false
            },
            {
              name: "农作物",
              ename: "nongzuowu",
              type: 1,
              children: [
                {
                  name: "耕地面积",
                  ename: "gdmj",
                  id: "23"
                },
                {
                  name: "玉米",
                  ename: "ym",
                  id: "24"
                },
                {
                  name: "小麦",
                  ename: "xm",
                  id: "25"
                },
                {
                  name: "水稻",
                  ename: "sd",
                  id: "26"
                }
              ],
              isactive: false,
              showright: false,
              checkable: false
            },
            {
              name: "交通",
              ename: "jiaotong",
              type: 1,
              children: [
                {
                  name: "国道",
                  ename: "gd",
                  id: "30"
                },
                {
                  name: "高速公路",
                  ename: "gsgl",
                  id: "31"
                },
                {
                  name: "机场",
                  ename: "jc",
                  id: "32"
                },
                {
                  name: "铁路",
                  ename: "tl",
                  id: "33"
                }
              ],
              isactive: false,
              showright: false,
              checkable: false
            }
          ],
          checkable: false
        }
      ],
      layerObj
      // leafList: [
      //   "sheng",
      //   "shi",
      //   "xian",
      //   "first",
      //   "second",
      //   "third",
      //   "DEM",
      //   "hwsm",
      //   "xzhl",
      //   "xly",
      //   "hp",
      //   "rkgw",
      //   "rkmd",
      //   "GDP",
      //   "gdmj",
      //   "ym",
      //   "xm",
      //   "sd",
      //   "gd",
      //   "gsgl",
      //   "jc",
      //   "tl",
      //   "chongqingfangwu"
      // ]
    };
  },

  methods: {
    // handleClick(e) {
    //   me.earth.removeAllLayer();
    //   const pEname = e.keyPath[1];
    //   let nodedome = "";
    //   const chlidList = [];
    //   this.layerObj[pEname].forEach(obj => {
    //     chlidList.push(...obj.children);
    //   });
    //   nodedome = chlidList.filter(item => {
    //     return item.id === e.key;
    //   })[0];
    //   const layer = me.earth.layerManager.createLayer(
    //     e.key,
    //     nodedome.attributes.serviceType,
    //     nodedome.attributes.serviceURL,
    //     {
    //       name: nodedome.showTitle || nodedome.text || "未命名图层"
    //     }
    //   );
    //   me.earth.addLayer(layer);
    // },
    // titleClick(e) {},
    show() {
      const that = this;
      that.visible = true;
      that.$nextTick(() => {
        const div = document.getElementById("resource-tree-wrapper");
        div.onmouseleave = function() {
          that.visible = false;
        };
      });
    },
    removeLayer(event) {
      if (event.data.layer) {
        const indexToRemove = this.checkedKeys.indexOf(event.data.layer.id);
        if (indexToRemove !== -1) {
          this.checkedKeys.splice(indexToRemove, 1);
        }
      }
    },
    onCheck(checkedKeys, e) {
      const key = e.node.eventKey;
      if (e.checked) {
        let position = e.node.pos.split("-");
        const pName = this.treeData[position[1]].ename;
        const nodedome = this.layerObj[pName][position[2]].children[
          position[3]
        ];
        const layer = me.earth.layerManager.createLayer(
          key,
          nodedome.attributes.serviceType,
          nodedome.attributes.serviceURL,
          {
            name: nodedome.showTitle || nodedome.text || "未命名图层"
          }
        );
        me.earth.addLayer(layer);
      } else {
        const layers = me.earth.layerManager.getOperationLayers();
        for (let i = 0; i < layers.length; i++) {
          if (layers[i].id == key) {
            me.earth.removeLayer(layers[i]);
            break;
          }
        }
      }
    },
    clearLayer() {
      this.checkedKeys = [];
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
    },
    onSelect(selectedKeys, info) {
      this.selectedKeys = selectedKeys;
    }
  },
  mounted() {
    const that = this;
    me.earth.eventManager.subscribe(
      me.earth.eventManager.enumEventType.Map.RemoveLayerEvent,
      that.removeLayer
    );
    me.earth.eventManager.subscribe(
      me.earth.eventManager.enumEventType.Map.ClearLayerEvent,
      that.clearLayer
    );
  }
};
</script>
<style lang="less" scoped>
.resource-menu-wrapper {
  position: fixed;
  top: 0.84rem;
  right: 0.04rem;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: flex-end;
  .tree-wrapper {
    width: 200px;
    max-height: 60vh;
    background-color: #fff;
    overflow-y: auto;
  }
}
</style>
