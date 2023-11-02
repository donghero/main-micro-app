import frequest from "./services/handler";
import exhibit from "./services/api/modules/exhibit";
import contract from "./services/api/modules/contract";
import operation from "./services/api/modules/operation";
import { baseInfo } from "../base/baseInfo";
console.log(baseInfo,666666)
// 展品非授权信息接口
export async function getExhibitListById(query: any): Promise<any> {
  if (query && Object.prototype.toString.call(query) !== "[object Object]") {
    return "query parameter must be object";
  }
  if (baseInfo.isTest)
    //@ts-ignore
    return frequest.bind({ name: this.name })(
      exhibit.getTestExhibitListById,
      [baseInfo.nodeId],
      {
        ...query,
      }
    );
  //@ts-ignore
  return frequest.bind({ name: this.name })(
    exhibit.getExhibitListById,
    [baseInfo.nodeId],
    {
      ...query,
    }
  );
}
export async function getExhibitListByPaging(query: any): Promise<any> {
  if (query && Object.prototype.toString.call(query) !== "[object Object]") {
    return Promise.reject("query parameter must be object");
  }
  if (baseInfo.isTest)
    // @ts-ignore
    return frequest.bind({ name: this.name })(
      exhibit.getTestExhibitByPaging,
      [baseInfo.nodeId],
      {
        ...query,
      }
    );
  // @ts-ignore
  return frequest.bind({ name: this.name })(
    exhibit.getExhibitListByPaging,
    [baseInfo.nodeId],
    {
      ...query,
    }
  );
}
export async function getSignStatistics(query: any) {
  // @ts-ignore
  return frequest(contract.getSignStatistics, "", {
    signUserIdentityType: 2,
    nodeId: baseInfo.nodeId,
    ...query,
  });
}
export async function getExhibitInfo(exhibitId: string, query: any) {
  if (baseInfo.isTest)
    // @ts-ignore
    return frequest(exhibit.getTestExhibitDetail, [baseInfo.nodeId, exhibitId], query);
  // @ts-ignore
  return frequest(exhibit.getExhibitDetail, [baseInfo.nodeId, exhibitId], query);
}
export async function getExhibitDepInfo(
  exhibitId: string,
  articleNids: string
) {
  if (baseInfo.isTest)
    // @ts-ignore
    return frequest(exhibit.getTestExhibitDepInfo, [baseInfo.nodeId, exhibitId], {
      articleNids,
    });
  // @ts-ignore
  return frequest(exhibit.getExhibitDepInfo, [baseInfo.nodeId, exhibitId], {
    articleNids,
  });
}

export async function getExhibitSignCount(exhibitId: string) {
  // @ts-ignore
  return frequest(exhibit.getExhibitSignCount, "", {
    subjectIds: exhibitId,
    subjectType: 2,
  });
}
export async function getExhibitAvailalbe(exhibitIds: string) {
  if (baseInfo.isTest) {
    return frequest(exhibit.getTestExhibitAuthStatus, [baseInfo.nodeId], {
      authType: 3,
      exhibitIds,
    });
  }
  // @ts-ignore
  return frequest(exhibit.getExhibitAuthStatus, [baseInfo.nodeId], {
    authType: 3,
    exhibitIds,
  });
}
export async function getExhibitAuthStatus(exhibitIds: string) {
  if (baseInfo.isTest) {
    return frequest(exhibit.getTestExhibitAuthStatus, [baseInfo.nodeId], {
      authType: baseInfo.isTest ? 3 : 4,
      exhibitIds,
    });
  }
  // @ts-ignore
  return frequest(exhibit.getExhibitAuthStatus, [baseInfo.nodeId], {
    authType: baseInfo.isTest ? 3 : 4,
    exhibitIds,
  });
}
// 展品授权信息接口
function getByExhibitId(
  name: string,
  exhibitId: string | number,
  type: string,
  parentNid?: string,
  subArticleIdOrName?: string,
  returnUrl?: boolean,
  config?: any
): Promise<any> | string {
  if (!exhibitId) {
    return "exhibitId is required";
  }
  let form: any = {};
  if (parentNid) {
    form.parentNid = parentNid;
  }
  if (subArticleIdOrName) {
    form.subArticleIdOrName = subArticleIdOrName;
  }
  if (baseInfo.isTest)
    return frequest.bind({
      name,
      isAuth: true,
      exhibitId: parentNid ? "" : exhibitId,
    })(
      exhibit.getTestExhibitAuthById,
      [baseInfo.nodeId, exhibitId, type],
      form,
      returnUrl,
      config
    );
  return frequest.bind({
    name,
    isAuth: true,
    exhibitId: parentNid ? "" : exhibitId,
  })(
    exhibit.getExhibitAuthById,
    [baseInfo.nodeId, exhibitId, type],
    form,
    returnUrl,
    config
  );
}
export async function getExhibitFileStream(
  exhibitId: string | number,
  options: {
    returnUrl?: boolean;
    config?: any;
    subFilePath?: string;
  },
  config?: any
) {
  return frequest.bind({
    // @ts-ignore
    name: this.name,
    isAuth: true,
    exhibitId: exhibitId,
  })(
    baseInfo.isTest ? exhibit.getTestExhibitById : exhibit.getExhibitById,
    [exhibitId],
    options?.subFilePath ? { subFilePath: options.subFilePath } : null,
    typeof options === "boolean" ? options : options?.returnUrl,
    config || options?.config
  );
  // @ts-ignore
  // return getByExhibitId(
  //   // @ts-ignore
  //   this.name,
  //   exhibitId,
  //   "fileStream",
  //   "",
  //   "",
  //   returnUrl,
  //   config
  // );
}
export async function getExhibitResultByAuth(exhibitId: string | number) {
  // @ts-ignore
  return getByExhibitId(this.name, exhibitId, "result", "", "");
}
export async function getExhibitInfoByAuth(exhibitId: string | number) {
  // @ts-ignore
  return getByExhibitId(this.name, exhibitId, "info", "", "");
}
// 子依赖树
export async function getExhibitDepTree(
  exhibitId: string | number,
  options: {
    version?: string;
    nid?: string;
    maxDeep?: number;
    isContainRootNode?: string;
  }
) {
  return frequest.bind({
    // @ts-ignore
    name: this.name,
    exhibitId: exhibitId,
  })(
    baseInfo.isTest ? exhibit.getTestExhibitDepTree : exhibit.getExhibitDepTree,
    [exhibitId],
    options
      ? {
          nid: options.nid,
          maxDeep: options.maxDeep,
          version: options.version,
          isContainRootNode: options.isContainRootNode,
        }
      : null
  );
}

// 子依赖
export async function getExhibitDepFileStream(
  exhibitId: string | number,
  parentNid: string,
  subArticleId: string,
  returnUrl?: boolean,
  config?: any
) {
  if (!parentNid || !subArticleId) {
    return Promise.reject("parentNid and subArticleId is required!");
  }
  return frequest.bind({
    // @ts-ignore
    name: this.name,
    isAuth: true,
    exhibitId: exhibitId,
  })(
    baseInfo.isTest ? exhibit.getTestExhibitById : exhibit.getExhibitById,
    [exhibitId],
    { parentNid, subArticleIdOrName: subArticleId },
    returnUrl,
    config
  );
  // // @ts-ignore
  // return getByExhibitId(
  //   // @ts-ignore
  //   this.name,
  //   exhibitId,
  //   "fileStream",
  //   parentNid,
  //   subArticleId,
  //   returnUrl,
  //   config
  // );
}

export async function pushMessage4Task(query: any) {
  return frequest(operation.pushMessage4Task, null, query);
}
