(function (global) {
  var RestSysApiBaseUrl = "$apiBbaseUrl$";
  var apiList = [
    {
      "key": "CommonSOEAnalysis",
      "uri": "SOEAnalysis/CommonSOEAnalysis",
      "type": "POST",
      "form": true,
      "des": "SOE分析"
    },
    {
      "key": "uploadResource",
      "uri": "fileHandle/uploadResource",
      "type": "POST",
      "des": "上传资源"
    },
    {
      "key": "getResource",
      "uri": "fileHandle/getResource",
      "type": "GET",
      "des": "获取资源"
    },
    {
      "key": "getNetResource",
      "uri": "fileHandle/getNetResource",
      "type": "GET",
      "des": "获取网络资源"
    },
    {
      "key": "deleteResource",
      "uri": "fileHandle/deleteResource",
      "type": "GET",
      "des": "删除资源"
    },
    {
      "key": "resoverExcel",
      "uri": "fileHandle/resoverExcel",
      "type": "POST",
      "form": true,
      "des": "解析Excel文件"
    },
    {
      "key": "exportTXT",
      "uri": "Export/exportTXT",
      "type": "POST",
      "des": "导出txt"
    },
    {
      "key": "exportEXCEL2",
      "uri": "Export/exportEXCEL2",
      "type": "POST",
      "des": "导出excel"
    },
    {
      "key": "addDkInfo",
      "uri": "addDataInfo/addDkInfo",
      "type": "POST",
      "des": "保存导入地块"
    },
    {
      "key": "listDkInfo",
      "uri": "addDataInfo/listDkInfo",
      "type": "GET",
      "des": "查询导入地块列表"
    },
    {
      "key": "deleteDkInfo",
      "uri": "addDataInfo/deleteDkInfo",
      "type": "POST",
      "form": true,
      "des": "删除导入地块"
    },
    {
      "key": "getBookmarkList",
      "uri": "mapApplication/listBookmark",
      "type": "POST",
      "form": true,
      "des": "获取书签列表"
    },
    {
      "key": "updateBookmark",
      "uri": "mapApplication/updateBookmark",
      "type": "POST",
      "des": "编辑书签"
    },
    {
      "key": "deleteBookmark",
      "uri": "mapApplication/deleteBookmark",
      "type": "POST",
      "des": "删除书签"
    },
    {
      "key": "addBookmark",
      "uri": "mapApplication/addBookmark",
      "type": "POST",
      "des": "添加书签"
    },
    {
      "key": "queryUserByName",
      "uri": "userController/list",
      "type": "GET",
      "des": "查询用户"
    },
    {
      "key": "shareToUser",
      "uri": "tUserBook/share",
      "type": "POST",
      "des": "分享给用户"
    },
    {
      "key": "insertSearch",
      "uri": "diitMapSearch/insertSearch",
      "type": "POST",
      "des": "插入查询内容"
    },
    {
      "key": "selectSearch",
      "uri": "diitMapSearch/selectSearch",
      "type": "GET",
      "des": "查询历史查询"
    },
    {
      "key": "deleteSearch",
      "uri": "diitMapSearch/deleteSearch",
      "type": "GET",
      "des": "查询历史查询"
    },
    {
      "key": "selectHotCity",
      "uri": "hotcity/selectHotCity",
      "type": "GET",
      "des": "查询热门城市"
    },
    {
      "key": "insertHotCity",
      "uri": "hotcity/insertHotCity",
      "type": "POST",
      "des": "插入热门城市"
    },
    {
      "key": "deleteHotCity",
      "uri": "hotcity/deleteHotCity",
      "type": "GET",
      "des": "删除热门城市"
    },
    {
      "key": "getDistrictTree",
      "uri": "district/getDistrictTree",
      "type": "GET",
      "des": "获取行政区划面板数据"
    },
    {
      "key": "bufferRetreat",
      "uri": "spatialAnalysis/bufferRetreat",
      "type": "post",
      "des": "缓冲器退让分析"
    },
    {
      "key": "selectDistrict",
      "uri": "district/selectDistrict",
      "type": "GET",
      "des": "获取行政区划坐标点数据"
    },
    {
      "key": "exportAnalysisReport",
      "uri": "exportAnalysisReport/export",
      "type": "POST",
      "des": "导出分析结果"
    },
    {
      "key": "proxyGET",
      "uri": "proxy/get",
      "type": "GET",
      "des": "后端代码请求接口"
    },
    {
      "key": "FileUplaod",
      "uri": "/uploadfile",
      "type": "POST",
      "des": "上传文件"
    },
    {
      "key": "extent",
      "uri": "/ServiceAPi/extent",
      "type": "POST",
      "des": "执行分析接口调用"
    },
    {
      "key": "taskList",
      "uri": "/analysis_task/list",
      "type": "GET",
      "des": "合规性执行结果列表"
    },
    {
      "key": "taskByJobId",
      "uri": "/analysis_task/listByJobId",
      "type": "GET",
      "des": "合规性执行结果列表"
    },
    {
      "key": "taskAdd",
      "uri": "/analysis_task/add",
      "type": "POST",
      "des": "保存合规性分析记录"
    },
    {
      "key": "taskView",
      "uri": "/analysis_task/view",
      "type": "GET",
      "des": "查看合规性分析详情"
    },
    {
      "key": "taskListDate",
      "uri": "/analysis_task/listDate",
      "type": "GET",
      "des": "查看合规性分析详情"
    }, {
      "key": "getDzdaFile",
      "uri": "/dzda/getDzdaFile",
      "type": "GET",
      "des": "根据code获取电子档案"
    }, {
      "key": "getHctpFile",
      "uri": "/hctc/getHctpFile",
      "type": "GET",
      "des": "根据package和name获取核查图片"
    },
    {
      "key": "exportShp1",
      "uri": "/geometry/geometyToShp",
      "type": "POST",
      "des": "导出shp"
    },
    {
      "key": "importShp1",
      "uri": "/geometry/shpToGeomety",
      "type": "POST",
      "des": "导入shp"
    },
    {
      "key": "printMap-base64Tojpg",
      "uri": "/printMap/base64Tojpg",
      "type": "POST",
      "des": ""
    },
    {
      "key": "printMap-addThematicMap",
      "uri": "/printMap/addThematicMap",
      "type": "POST",
      "des": ""
    },
    {
      "key": "printMap-addThematicMapLog",
      "uri": "/printMap/addThematicMapLog",
      "type": "POST",
      "des": ""
    },
    {
      "key": "printMap-downloadFile",
      "uri": "/printMap/downloadFile",
      "type": "GET",
      "des": ""
    },
    {
      "key": "printMap-dowmloadFileList",
      "uri": "/printMap/dowmloadFileList",
      "type": "POST",
      "des": ""
    },
    {
      "key": "printMap-queryThematicMapList",
      "uri": "/printMap/queryThematicMapList",
      "type": "POST",
      "des": ""
    },
    {
      "key": "printMap-queryThematicMapLog",
      "uri": "/printMap/queryThematicMapLog",
      "type": "POST",
      "des": ""
    },
    {
      "key": "printMap-dropThematicMap",
      "uri": "/printMap/dropThematicMap",
      "type": "POST",
      "des": ""
    },
    {
      "key": "printMap-browse",
      "uri": "/printMap/browse",
      "type": "GET",
      "des": ""
    },
    {
      "key": "coordTransformation",
      "uri": "/DIITRestSOEService/getCoordinate",
      "type": "POST",
      "des": "坐标转换"
    },
    {
      "key": "taskDelete",
      "uri": "/analysis_task/del",
      "type": "GET",
      "des": "删除分析记录"
    }
  ];

  var commonSOE = {
    "baseURL": "$soeUrl$",
    "functions": [
      {
        "key": "ZBZH",
        "uri": "/exts/DIITRestSOEService/Project",
        "des": "坐标转换"
      },
      {
        "key": "DRSHP",
        "uri": "/exts/DIITRestSOEService/ImportSHP",
        "des": "导入shp"
      },
      {
        "key": "DRCAD",
        "uri": "/exts/CADProcessorSOE/CADOperate",
        "des": "导入CAD"
      },
      {
        "key": "DCSHP",
        "uri": "/exts/DIITRestSOEService/ExportSHP",
        "des": "导出shp"
      },
      {
        "key": "FileUplaodByExportSHP",
        "uri": "/uploadfile",
        "des": "soe生成shp压缩包的网络地址"
      },
      {
        "key": "queryAreaAndLength",
        "uri": "/exts/DIITRestSOE2000/queryAreaAndLength",
        "des": "计算面积"
      }
    ]
  };

  var analysisBaList = {
    "baseURL": "$analysisBbaseUrl$",
    "functions": [
      {
        "key": "intersect",
        "uri": "/stGeometry/intersect",
        "type": "POST",
        "des": "单表相交"
      },
      {
        "key": "contains",
        "uri": "/stGeometry/contains",
        "type": "POST",
        "des": "单表包含"
      },
      {
        "key": "query2TableIntersect",
        "uri": "/stGeometry/query2TableIntersect",
        "type": "POST",
        "des": "双表相交"
      },
      {
        "key": "query2TableContains",
        "uri": "/stGeometry/query2TableContains",
        "type": "POST",
        "des": "双表相交"
      },
      {
        "key": "query2TableDifference",
        "uri": "/stGeometry/query2TableDifference",
        "type": "POST",
        "des": "双表相交"
      },
      {
        "key": "query2TableSymmetricdiff",
        "uri": "/stGeometry/query2TableSymmetricdiff",
        "type": "POST",
        "des": "双表相交"
      },
      {
        "key": "query2TableUnion",
        "uri": "/stGeometry/query2TableUnion",
        "type": "POST",
        "des": "联合"
      },
      {
        "key": "query2TableIntersectByGeometry",
        "uri": "/stGeometry/query2TableIntersectByGeometry",
        "type": "POST",
        "des": "双表相交"
      },
      {
        "key": "query2TableContainsByGeometry",
        "uri": "/stGeometry/query2TableContainsByGeometry",
        "type": "POST",
        "des": "双表相交"
      },
      {
        "key": "query2TableDifferenceByGeometry",
        "uri": "/stGeometry/query2TableDifferenceByGeometry",
        "type": "POST",
        "des": "双表相交"
      },
      {
        "key": "query2TableSymmetricdiffByGeometry",
        "uri": "/stGeometry/query2TableSymmetricdiffByGeometry",
        "type": "POST",
        "des": "双表相交"
      },
      {
        "key": "query2TableUnionByGeometry",
        "uri": "/stGeometry/query2TableUnionByGeometry",
        "type": "POST",
        "des": "联合"
      }
    ]
  };

  //吉威服务
  var apiJWList = {
    "baseURL": "$apiJWBaseUrl$",
    "functions": [
      {
        "key": "jwServerQuery",
        "uri": "ApiController/callApi",
        "type": "POST",
        "des": "吉威服务查询"
      }
    ]
  }

  global.RestSysApiBaseUrl = RestSysApiBaseUrl;
  global.analysisBaList = analysisBaList;
  global.apiJWList = apiJWList;
  global.apiList = apiList;
  global.commonSOE = commonSOE;

})(window);
