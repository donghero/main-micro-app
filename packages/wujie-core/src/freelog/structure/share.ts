﻿import { widgetsConfig, widgetUserData, FREELOG_DEV } from "./widget";
import { rawLocation, rawHistory } from "./rawObjects";
export const SHARE_DETAIL = "detail";
export const SHARE_CONTENT = "content";
export const FREELOG_ROUTE_MAPS = "FREELOG_ROUTE_MAPS";
export function getShareUrl(name:string, exhibitId: string, type: "detail" | "content") {
  return `${rawLocation.origin}/${exhibitId}/${type}`;
}
// 只有在vue路由之前使用才有效
export function mapShareUrl(name: string, routeMap: any) {
  // @ts-ignore
  const theme = widgetsConfig.get(name);
  if (!theme.isTheme) {
    console.error("mapShareUrl ", "只能主题使用");
  }
  theme[FREELOG_ROUTE_MAPS] = routeMap || {};
  const href = rawLocation?.href;
  const data = isShareUrl(href);
  if (data && href) {
    const func = routeMap ? routeMap[data.type] : null;
    let route = "";
    if (func instanceof Function) {
      route = func(data.exhibitId);
    }
    const url =
      rawLocation.origin +
      (rawLocation.search
        ? rawLocation.search + `&${name}=${route}`
        : `?${name}=${route}`);
    rawHistory.replaceState(rawHistory.state, "", url);
  }
}
const urlTest = /^\/?.{24}\/(detail|content)$/;
export function isShareUrl(url: string) {
  if (urlTest.test(url)) {
    url = url.indexOf("/") === 0 ? url.replace("/", "") : url;
    const exhibitId = url.split("/")[0];
    const type = url.split("/")[1];
    return {
      exhibitId,
      type,
    };
  }
  return false;
}
