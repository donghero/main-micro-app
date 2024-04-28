﻿import { unmountAppParams } from "./widget";
import { AxiosResponse, ResponseType } from "axios";
import { FreelogUserInfo, PageResult } from "egg-freelog-base";
import { IApiDataFormat, NodeInfo, PlainObject } from "./base";
import {
  ExhibitInfo,
  ExhibitDependencyTree,
  AuthResult,
  SignItem,
  DependArticleInfo,
  SignCount,
} from "./exhibit";
export interface WidgetController {
  success: boolean;
  name: string;
  getApi: () => PlainObject;
  unmount: (options?: unmountAppParams) => Promise<boolean>;
  reload: (destroy?: boolean) => Promise<boolean>;
  getData: () => any;
  clearData: () => any;
  setData: (data: Record<PropertyKey, unknown>) => any;
  addDataListener: (dataListener: Function, autoTrigger?: boolean) => any;
  removeDataListener: (dataListener: Function) => any;
  clearDataListener: () => any;
}

export interface GetSubDepResult {
  exhibitName: string;
  exhibitId: string;
  /**
   * 作品链路id, 在依赖树当中的唯一标识id
   */
  articleNid: string;
  /**
   * 作品类型
   */
  resourceType: string;
  subDep: SubDepType[];
  versionInfo: PlainObject;
  /**
   * 有授权时data为展品信息，无授权时data为授权信息
   */
  data: AuthResult | ExhibitInfo;
}
export interface SubDepType {
  /**
   * 子依赖作品id
   */
  id: string;
  /**
   * 子依赖名称
   */
  name: string;
  /**
   * 子依赖链路id,在依赖树当中的唯一标识id
   */
  nid: string;
  /**
   * 资源类型
   */
  resourceType: string[];
  /**
   * 当前请求的作品类型(1:独立资源 2:组合资源 3:节点组合资源 4:存储对象)
   */
  type: number;
}

export type GetExhibitListByIdResult = AxiosResponse<
  IApiDataFormat<ExhibitInfo[]>
>;

export type GetExhibitListByPagingResult = AxiosResponse<
  IApiDataFormat<PageResult<ExhibitInfo>>
>;

export type GetExhibitInfoResult = AxiosResponse<IApiDataFormat<ExhibitInfo[]>>;

export type GetExhibitSignCountResult = AxiosResponse<
  IApiDataFormat<SignItem[]>
>;

export type GetExhibitAuthStatusResult = AxiosResponse<
  IApiDataFormat<AuthResult[]>
>;

export type GetExhibitAvailableResult = AxiosResponse<
  IApiDataFormat<AuthResult[]>
>;

export type GetExhibitDepTreeResult = AxiosResponse<
  IApiDataFormat<ExhibitDependencyTree[]>
>;

export type GetExhibitDepInfoResult = IApiDataFormat<DependArticleInfo[]>;

export type GetSignStatisticsResult = IApiDataFormat<SignCount[]>;
