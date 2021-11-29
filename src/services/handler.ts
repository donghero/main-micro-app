import axios from "./request";
import { placeHolder, baseConfig } from "./base";
import { compareObjects } from "../utils/utils";
import { setPresentableQueue } from "../bridge/index";
/**
 *
 * @param action api namespace.apiName
 * @param urlData array, use item for replace url's placeholder
 * @param data  body data or query data  string | object | Array<any> | null | JSON | undefined
 */
export default function frequest(
  action: any,
  urlData: Array<string | number> | null | undefined | "",
  data: any,
  returnUrl?: boolean,
  config?: any
): any {
  // @ts-ignore
  const caller = this;
  let api = Object.assign({}, action);
  // type Api2 = Exclude<Api, 'url' | 'before' | 'after'>
  let url = api.url;
  if (url.indexOf(placeHolder) > -1) {
    if (!urlData || !urlData.length) {
      console.error("urlData is required: " + urlData);
      return;
    }
    urlData.forEach((item) => {
      url = url.replace(placeHolder, item + "");
    });
  }
  // filter data if there is dataModel
  if (api.dataModel) {
    // TODO 需要用deepclone
    data = Object.assign({}, data);
    compareObjects(api.dataModel, data, !!api.isDiff);
  }
  // pre method
  if (api.before) {
    data = api.before(data) || data;
  }
  if (api.method.toLowerCase() === "get") {
    api.params = data;
  } else {
    api.data = data;
  }
  // delete extra keys
  ["url", "before", "after"].forEach((item) => {
    delete api[item];
  });
  let _config: any = {};
  if (config) {
    ["onUploadProgress", "onDownloadProgress", "responseType"].forEach(
      (key) => {
        if (config[key]) _config[key] = config[key];
      }
    );
  }
  let _api = Object.assign(_config, baseConfig, api);
  if (returnUrl && _api.method.toLowerCase() === "get") {
    let query = "";
    if (_api.params) {
      Object.keys(_api.params).forEach((key) => {
        query = query + "&" + key + "=" + _api.params[key];
      });
    }
    if (query) {
      query = "?" + query;
    }
    return _api.baseURL + url + query;
  }
  // show msg
  return new Promise((resolve, reject) => {
    axios(url, _api)
      .then(async (response) => {
        api.after && api.after(response);
        // TODO 仅授权失败
        if (
          response.data.errCode &&
          response.data.errCode === 3 &&
          caller &&
          (caller.exhibitId || caller.resourceIdOrName)
        ) {
          // freelog-entity-nid,freelog-test-resource-id,freelog-test-resource-name,
          // freelog-sub-dependencies,freelog-resource-type,freelog-entity-property
          const exhibitId = response.headers["freelog-presentable-id"];
          const presentableName = decodeURI(
            response.headers["freelog-presentable-name"]
          );
          setPresentableQueue(exhibitId, {
            widget: caller.name,
            errCode: response.data.errCode,
            authCode: response.data.data.authCode,
            contracts: response.data.data.data.contracts || [],
            policies: response.data.data.data.policies,
            presentableName,
            exhibitId,
            info: response.data,
          });
          resolve({
            data: {
              errCode: 3,
              authCode: response.data.errCode,
              presentableName,
              exhibitId,
              errorMsg: response.data.data.errorMsg,
            },
          });
          return;
        } else {
          resolve(response);
        }
      })
      .catch((error) => {
        // 防止error为空
        reject({ error });
        if (typeof error === "string") {
        } else {
        }
      });
  });
}
