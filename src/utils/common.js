import { exportExcel } from "../api/rapidAnalysis/export";

export default {

  //添加定位标识
  addImage(_map, img, uuid, pos, markerLayer) {
    this.removeLayer(_map, markerLayer);
    let domid = "charts1" + uuid.v4();
    window
      .$("#addMarker")
      .append("<div id=" + domid + "><img src='" + img + "'/></div>");
    let t = {
      domid: domid,
      position: [pos.lng, pos.lat],
      notLocate: true
    };
    _map.layerManager.clearSelectLayer();
    let a = _map.addMarker(t);
    markerLayer.push(a);
    return markerLayer;
  },

  removeLayer(_map, markerLayer) {
    if (markerLayer.length > 0) {
      for (var i = 0; i < markerLayer.length; i++) {
        _map.map.removeOverlay(markerLayer[i])
      }
      markerLayer = []
    }
  },

  _exportExcel({ taskId, tableName, exportName}) {
    exportExcel({ taskId, tableName, exportName}).then(res => {
      const content = res
      const blob = new Blob([content])
      const fileName = exportName + '.zip'
      let data = res
      let that = this
      let fileReader = new FileReader()
      fileReader.onload = function (e) {
        try {
          let jsonData = JSON.parse(e.target.result) // 说明是普通对象数据，后台转换失败
          if (jsonData.code != 200) {
            that.loading = false
            that.$message.warning(jsonData.trace)
          }
        } catch (err) {
          // 解析成对象失败，说明是正常的文件流
          // that.downloadFile(res, map)
          that.loading = false
          if ('download' in document.createElement('a')) {
            // 非IE下载
            const elink = document.createElement('a')
            elink.download = fileName
            elink.style.display = 'none'
            elink.href = URL.createObjectURL(blob)
            document.body.appendChild(elink)
            elink.click()
            URL.revokeObjectURL(elink.href) // 释放URL 对象
            document.body.removeChild(elink)
          } else {
            // IE10+下载
            navigator.msSaveBlob(blob, fileName)
          }
        }
      }
      fileReader.readAsText(data)
    }).catch(e => {
      console.log('e=', e)
    })
  }
}
