import { get, post,getBlob } from "../../utils/http-service";

const baseUrl = window.servicesConfig.servicesUrl

// 致灾因子导入
export function exportExcel({ taskId, tableName, exportName }) {
  return getBlob(`${baseUrl}/api/exportExcel?taskId=${taskId}&tableName=${tableName}&exportName=${exportName}`);
}