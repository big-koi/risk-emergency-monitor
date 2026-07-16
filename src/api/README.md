# 存放接口的文件夹
## 目录结构
1. **页面**的接口按照接口地址来划分目录，例如 
   1. 接口：`landData/getLandData`，目录 `landData > index.js > export function getLandData(){}`
   2. 接口：`land-data/getLandData`，目录 `landData > index.js > export function getLandData(){}`
   3. 接口：`jobPlan/years/getYears`， 目录 `jobPlan > years > index.js > export function getYears(){}`

2. **其它**的接口按照类型来划分目录，例如
   1. `user` 存放用户类接口
   2. `menu` 存放菜单类接口
