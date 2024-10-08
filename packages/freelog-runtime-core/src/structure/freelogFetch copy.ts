﻿import { widgetsConfig } from "./widget";
export function freelogFetch(url: string, options: any, appName: string): any {
  const widgetConfig = widgetsConfig.get(appName);
  options = options || {};
  if (url == "https://file.freelog.com" || url == "https://file.freelog.com/") {
    // TODO 这里需要处理，可能后缀不是html
    url = widgetConfig.entry + "/index.html";
  } else if (url.includes("https://file.freelog.com")) {
    const urlObj = new URL(url);
    url = widgetConfig.entry + urlObj.pathname;
  }
  if (url == "https://authorization-processor.testfreelog.com/" || url == "https://authorization-processor.testfreelog.com") {
    return fetch(url + "index.html", { ...options });
  } 
  else if (url.includes("https://authorization-processor.testfreelog.com")) {
    const urlObj = new URL(url);
    url = "https://authorization-processor.testfreelog.com" + urlObj.pathname;
    return fetch(url, { ...options, mode: "cors" });
  }
  if (url.indexOf("freelog.com") > -1) {
    return fetch(url, { ...options, credentials: "include" });
  } else {
   
    return fetch(url, { ...options });
  }
}
