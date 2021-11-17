import frequest from "../../services/handler";
import node from "../../services/api/modules/node";

import { getSubDep, getUserInfo, isMobile } from "./utils";
import { freelogApp } from "./global";
import { freelogAuth } from "./freelogAuth";
import { init } from "./api";
import { dev } from "./dev";
import { pathATag, initLocation } from "./proxy";
import { mountUI } from "./widget";
const mobile = isMobile()
// @ts-ignore
const uiPath = import.meta.env.DEV
  ? mobile
    ? "http://localhost:8881"
    : "http://localhost:8880"
  : mobile
  ? "/mobile"
  : "/pc";
let isTest = false;
if (
  window.location.href
    .replace("http://", "")
    .replace("https://", "")
    .indexOf("t.") === 0
) {
  isTest = true;
}
!mobile && document.querySelector.bind(document)('meta[name="viewport"]')?.setAttribute('content', "width=device-width, initial-scale=1.0") 
window.isTest = isTest;
window.freelogApp = freelogApp;
window.freelogAuth = freelogAuth;
export function initNode() {
  pathATag();
  return new Promise<void>(async (resolve) => {
    let nodeDomain = getDomain(window.location.host);
    Promise.all([requestNodeInfo(nodeDomain), getUserInfo()]).then(
      async (values) => {
        let nodeData = values[0];
        const nodeInfo = nodeData.data;
        freelogApp.nodeInfo = nodeInfo;
        document.title = nodeInfo.nodeName;
        Object.defineProperty(document, 'title', {
          set(msg) {
          },
          get() {
            return document.title;
          },
        });
        init();
        const devData = dev();
        Object.freeze(devData);
        freelogApp.devData = devData;
        Object.freeze(freelogApp);
        Object.freeze(freelogApp.nodeInfo);
        initLocation();
        const container = document.getElementById.bind(document)("freelog-plugin-container");
        if(window.isTest){
          const theme = await getSubDep(nodeInfo.nodeTestThemeId);
          freelogApp.mountWidget(
            theme.data,
            container,
            "",
            { shadowDom: false, scopedCss: true, ...theme.properties },
            null,
            true
          );
          resolve && resolve()
          return 
        }
        mountUI("freelog-ui", document.getElementById.bind(document)("ui-root"), uiPath, {
          shadowDom: false,
          scopedCss: false,
        }).mountPromise.then(async () => {
          // TODO 如果没有主题，需要提醒先签约主题才行，意味着开发主题需要先建一个节点和主题并签约
          const theme = await getSubDep(window.isTest? nodeInfo.nodeTestThemeId : nodeInfo.nodeThemeId);
          freelogApp.mountWidget(
            theme.data,
            container,
            "",
            { shadowDom: false, scopedCss: true, ...theme.properties },
            null,
            true
          );
          resolve && resolve()
        });
      }
    );
  });
}

function getDomain(url: string) {
  if (url.split(".")[0] === "t") {
    return url.split(".")[1];
  }
  return url.split(".")[0];
}

async function requestNodeInfo(nodeDomain: string) {
  let info = await frequest.bind({ name: "node" })(
    node.getInfoByNameOrDomain,
    "",
    { nodeDomain }
  );
  return info.data;
}
