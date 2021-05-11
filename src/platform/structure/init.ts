import frequest from "../../services/handler";
import node from "../../services/api/modules/node";
import { getSubDep, getUserInfo } from "./utils";
import { freelogApp } from "./global";
import { init } from "./api";
import { dev, DEV_WIDGET } from "./dev";
import { mountSubWidgets } from "./widget";
import {LOGIN} from '../../bridge/event'
import {addAuth} from '../../bridge/index'
// @ts-ignore  TODO 需要控制不可改变
window.freelogApp = freelogApp;
export function initNode() {
  /**
   * 1.resolveUrl
   * 2.requestNodeInfo
   * 3.requestTheme
   * TODO  error resolve
   * TODO title 问题
   */
  
  return new Promise<void>(async (resolve) => {
    const nodeDomain = await getDomain(window.location.host);
    let nodeData = await requestNodeInfo(nodeDomain);
    if(nodeData.errCode === 30){
      const result = await new Promise((resolve, reject)=>{
        addAuth.bind({name: 'node', event: LOGIN})('', resolve, reject)
      })
      nodeData = await requestNodeInfo(nodeDomain);
    }
    const nodeInfo = nodeData.data;
    // @ts-ignore
    freelogApp.nodeInfo = nodeInfo;
    document.title = nodeInfo.nodeName
    init();
    const devData = dev();
    freelogApp.devData = devData;
    Object.freeze(freelogApp)
    // @ts-ignore
    const container = document.getElementById("freelog-plugin-container");
    if (devData.type === DEV_WIDGET) {
      freelogApp.mountWidget("", container, {presentableId: nodeInfo.nodeThemeId}, "", {shadowDom: false,scopedCss: true});
      return;
    }
    const userInfo = await getUserInfo()
    // @ts-ignore
    const theme = await getSubDep(nodeInfo.nodeThemeId);
    const themeApp = freelogApp.mountWidget(
      { id: theme.data.presentableId, name: theme.data.presentableName },
      container,
      {
        presentableId: theme.data.presentableId,
        entityNid: "",
        subDependId: theme.data.presentableId,
        resourceInfo: { resourceId: theme.data.resourceInfo.resourceId },
        isTheme: true,
      },
      "",
      {shadowDom: false,scopedCss: true}
    );
    // new Promise<void>((resolve) => {
    //   let count = 0
    //   const inter = setInterval(() => {
    //     count++
    //     if (themeApp.getStatus() === "MOUNTED" || count === 25) {
    //       clearInterval(inter)
    //       resolve && resolve();
    //     }
    //   }, 200);
    // }).then(() => {
    //   mountSubWidgets(theme, true, resolve)
    // });
  });
}

function getDomain(url: string) {
  if(url.split(".")[0] === 't'){
    return url.split(".")[1]
  }
  return url.split(".")[0];
}

async function requestNodeInfo(nodeDomain: string) {
  let info = await frequest.bind({name: 'node'})(node.getInfoByNameOrDomain, "", { nodeDomain });
  return info.data;
}

