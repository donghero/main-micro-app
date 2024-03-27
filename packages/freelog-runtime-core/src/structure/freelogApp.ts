import { resultType } from "../bridge/eventType";
import { freelogApp as freelogAppLib } from "../freelogApp";
import { mountWidget } from "./widget";
import { isTest } from "../base/baseInfo";
import {
  getSelfConfig,
  setUserData,
  getUserData,
  getSubDep,
  getSelfArticleId,
  getSelfExhibitId,
  getSelfWidgetId,
  getStaticPath,
  getCurrentUser,
  setViewport,
  callLogin,
  callLoginOut,
  reload,
  setSelfResourceNameForDev,
  getCurrentUrl
} from "./utils";
import { getShareUrl, mapShareUrl } from "./share";
import { callAuth, addAuth } from "../bridge/index";
import { onLogin, onUserChange } from "../bridge/eventOn";
import { isUserChange } from "../security";
import { dev } from "./dev";
import { getActiveWidget, getAllWidget } from "./jdPatch";
const devData = dev();
export const freelogApp: any = {
  ...freelogAppLib,
  // initGlobalState,
  nodeInfo: "",
  status: {
    authUIMounted: false,
    themeMounted: false,
  },
  mountWidget,
  devData,
  getStaticPath,
  getSubDep,
  getSelfArticleId,
  getSelfExhibitId,
  getSelfWidgetId,
  callAuth,
  addAuth,
  onLogin,
  onUserChange,
  callLogin,
  callLoginOut,
  getCurrentUser,
  setViewport,
  setUserData,
  getUserData,
  getSelfConfig,
  isUserChange,
  reload,
  resultType,
  setSelfResourceNameForDev,
  isTest,
  getActiveWidget,
  getAllWidget,
  getShareUrl,
  mapShareUrl,
  getCurrentUrl
};
