/// <reference path="../typings/global.d.ts" />
// Generated by dts-bundle v0.7.3
// Dependencies for this module:
//   ../../@micro-app/types

declare module '@micro-zoe/micro-app' {
    export { default, MicroApp, getActiveApps, getAllApps, unmountApp, unmountAllApps, reload, renderApp, } from '@micro-zoe/micro-app/micro_app';
    export { default as preFetch, } from '@micro-zoe/micro-app/prefetch';
    export { removeDomScope, pureCreateElement, version, } from '@micro-zoe/micro-app/libs/utils';
    export { EventCenterForMicroApp, } from '@micro-zoe/micro-app/interact';
}

declare module '@micro-zoe/micro-app/micro_app' {
    import { OptionsType, MicroAppBaseType, Router, AppName, Func, lifeCyclesType, MicroAppConfig, GetActiveAppsParam } from '@micro-app/types';
    import preFetch from '@micro-zoe/micro-app/prefetch';
    import { EventCenterForBaseApp } from '@micro-zoe/micro-app/interact';
    /**
        * if app not prefetch & not unmount, then app is active
        * @param excludeHiddenApp exclude hidden keep-alive app, default is false
        * @param excludePreRender exclude pre render app
        * @returns active apps
        */
    export function getActiveApps({ excludeHiddenApp, excludePreRender, }?: GetActiveAppsParam): AppName[];
    export function getAllApps(): string[];
    type unmountAppOptions = {
            destroy?: boolean;
            clearAliveState?: boolean;
            clearData?: boolean;
    };
    /**
        * unmount app by appName
        * @param appName
        * @param options unmountAppOptions
        * @returns Promise<void>
        */
    export function unmountApp(appName: string, options?: unmountAppOptions): Promise<boolean>;
    export function unmountAllApps(options?: unmountAppOptions): Promise<boolean>;
    /**
        * Re render app from the command line
        * microApp.reload(destroy)
        * @param appName app.name
        * @param destroy unmount app with destroy mode
        * @returns Promise<boolean>
        */
    export function reload(appName: string, destroy?: boolean): Promise<boolean>;
    interface RenderAppOptions extends MicroAppConfig {
            name: string;
            url: string;
            container: string | Element;
            baseroute?: string;
            'default-page'?: string;
            data?: Record<PropertyKey, unknown>;
            onDataChange?: Func;
            lifeCycles?: lifeCyclesType;
            [key: string]: unknown;
    }
    /**
        * Manually render app
        * @param options RenderAppOptions
        * @returns Promise<boolean>
        */
    export function renderApp(options: RenderAppOptions): Promise<boolean>;
    export class MicroApp extends EventCenterForBaseApp implements MicroAppBaseType {
            tagName: string;
            hasInit: boolean;
            options: OptionsType;
            router: Router;
            preFetch: typeof preFetch;
            unmountApp: typeof unmountApp;
            unmountAllApps: typeof unmountAllApps;
            getActiveApps: typeof getActiveApps;
            getAllApps: typeof getAllApps;
            reload: typeof reload;
            renderApp: typeof renderApp;
            start(options?: OptionsType): void;
    }
    const microApp: MicroApp;
    export default microApp;
}

declare module '@micro-zoe/micro-app/prefetch' {
    import { prefetchParamList, globalAssetsType } from '@micro-app/types';
    /**
        * preFetch([
        *  {
        *    name: string,
        *    url: string,
        *    iframe: boolean,
        *    inline: boolean,
        *    'disable-scopecss': boolean,
        *    'disable-sandbox': boolean,
        *    level: number,
        *    'default-page': string,
        *    'disable-patch-request': boolean,
        *  },
        *  ...
        * ])
        * Note:
        *  1: preFetch is async and is performed only when the browser is idle
        *  2: options of prefetch preferably match the config of the micro-app element, although this is not required
        * @param apps micro app options
        * @param delay delay time
        */
    export default function preFetch(apps: prefetchParamList, delay?: number): void;
    /**
        * load global assets into cache
        * @param assets global assets of js, css
        */
    export function getGlobalAssets(assets: globalAssetsType): void;
}

declare module '@micro-zoe/micro-app/libs/utils' {
    import { Func, LocationQueryObject, MicroLocation, AttrsType, fiberTasks, MicroAppElementTagNameMap, MicroAppElementInterface } from '@micro-app/types';
    export const version = "__MICRO_APP_VERSION__";
    export const isBrowser: boolean;
    export const globalThis: any;
    export const noop: () => void;
    export const noopFalse: () => boolean;
    export const isArray: (arg: any) => arg is any[];
    export const assign: {
            <T, U>(target: T, source: U): T & U;
            <T_1, U_1, V>(target: T_1, source1: U_1, source2: V): T_1 & U_1 & V;
            <T_2, U_2, V_1, W>(target: T_2, source1: U_2, source2: V_1, source3: W): T_2 & U_2 & V_1 & W;
            (target: object, ...sources: any[]): any;
    };
    export const rawDefineProperty: (o: any, p: string | number | symbol, attributes: PropertyDescriptor & ThisType<any>) => any;
    export const rawDefineProperties: (o: any, properties: PropertyDescriptorMap & ThisType<any>) => any;
    export const rawToString: () => string;
    export const rawHasOwnProperty: (v: string | number | symbol) => boolean;
    export const toTypeString: (value: unknown) => string;
    export function isUndefined(target: unknown): target is undefined;
    export function isNull(target: unknown): target is null;
    export function isString(target: unknown): target is string;
    export function isBoolean(target: unknown): target is boolean;
    export function isNumber(target: unknown): target is Number;
    export function isFunction(target: unknown): target is Function;
    export function isPlainObject<T = Record<PropertyKey, unknown>>(target: unknown): target is T;
    export function isObject(target: unknown): target is Object;
    export function isPromise(target: unknown): target is Promise<unknown>;
    export function isBoundFunction(target: unknown): boolean;
    export function isConstructor(target: unknown): boolean;
    export function isShadowRoot(target: unknown): target is ShadowRoot;
    export function isURL(target: unknown): target is URL;
    export function isElement(target: unknown): target is Element;
    export function isNode(target: unknown): target is Node;
    export function isLinkElement(target: unknown): target is HTMLLinkElement;
    export function isStyleElement(target: unknown): target is HTMLStyleElement;
    export function isScriptElement(target: unknown): target is HTMLScriptElement;
    export function isIFrameElement(target: unknown): target is HTMLIFrameElement;
    export function isDivElement(target: unknown): target is HTMLDivElement;
    export function isImageElement(target: unknown): target is HTMLImageElement;
    export function isBaseElement(target: unknown): target is HTMLBaseElement;
    export function isDocumentFragment(target: unknown): target is DocumentFragment;
    export function isMicroAppBody(target: unknown): target is HTMLElement;
    export function isMicroAppHead(target: unknown): target is HTMLElement;
    export function isProxyDocument(target: unknown): target is Document;
    export function isTargetExtension(path: string, suffix: string): boolean;
    export function includes(target: unknown[], searchElement: unknown, fromIndex?: number): boolean;
    /**
        * format error log
        * @param msg message
        * @param appName app name, default is null
        */
    export function logError(msg: unknown, appName?: string | null, ...rest: unknown[]): void;
    /**
        * format warn log
        * @param msg message
        * @param appName app name, default is null
        */
    export function logWarn(msg: unknown, appName?: string | null, ...rest: unknown[]): void;
    /**
        * async execution
        * @param fn callback
        * @param args params
        */
    export function defer(fn: Func, ...args: unknown[]): void;
    /**
        * async execution with macro task
        * @param fn callback
        * @param args params
        */
    export function macro(fn: Func, delay?: number, ...args: unknown[]): void;
    /**
        * create URL as MicroLocation
        */
    export const createURL: (path: string | URL, base?: string | undefined) => MicroLocation;
    /**
        * Add address protocol
        * @param url address
        */
    export function addProtocol(url: string): string;
    /**
        * format URL address
        * note the scenes:
        * 1. micro-app -> attributeChangedCallback
        * 2. preFetch
        */
    export function formatAppURL(url: string | null, appName?: string | null): string;
    /**
        * format name
        * note the scenes:
        * 1. micro-app -> attributeChangedCallback
        * 2. event_center -> EventCenterForMicroApp -> constructor
        * 3. event_center -> EventCenterForBaseApp -> all methods
        * 4. preFetch
        * 5. plugins
        * 6. router api (push, replace)
        */
    export function formatAppName(name: string | null): string;
    /**
        * Get valid address, such as
        *  1. https://domain/xx/xx.html to https://domain/xx/
        *  2. https://domain/xx to https://domain/xx/
        * @param url app.url
        */
    export function getEffectivePath(url: string): string;
    /**
        * Complete address
        * @param path address
        * @param baseURI base url(app.url)
        */
    export function CompletionPath(path: string, baseURI: string): string;
    /**
        * Get the folder where the link resource is located,
        * which is used to complete the relative address in the css
        * @param linkPath full link address
        */
    export function getLinkFileDir(linkPath: string): string;
    /**
        * promise stream
        * @param promiseList promise list
        * @param successCb success callback
        * @param errorCb failed callback
        * @param finallyCb finally callback
        */
    export function promiseStream<T>(promiseList: Array<Promise<T> | T>, successCb: CallableFunction, errorCb: CallableFunction, finallyCb?: CallableFunction): void;
    export function isSupportModuleScript(): boolean;
    export function createNonceSrc(): string;
    export function unique(array: any[]): any[];
    export const requestIdleCallback: any;
    /**
        * Wrap requestIdleCallback with promise
        * Exec callback when browser idle
        */
    export function promiseRequestIdle(callback: CallableFunction): Promise<void>;
    export function setCurrentAppName(appName: string | null): void;
    export function getCurrentAppName(): string | null;
    export function throttleDeferForSetAppName(appName: string): void;
    export function setIframeCurrentAppName(appName: string | null): void;
    export function getIframeCurrentAppName(): string | null;
    export function throttleDeferForIframeAppName(appName: string): void;
    export function getPreventSetState(): boolean;
    /**
        * prevent set appName
        * usage:
        * removeDomScope(true)
        * -----> element scope point to base app <-----
        * removeDomScope(false)
        */
    export function removeDomScope(force?: boolean): void;
    export function isSafari(): boolean;
    /**
        * Create pure elements
        */
    export function pureCreateElement<K extends keyof MicroAppElementTagNameMap>(tagName: K, options?: ElementCreationOptions): MicroAppElementTagNameMap[K];
    export function isInvalidQuerySelectorKey(key: string): boolean;
    export function isUniqueElement(key: string): boolean;
    export type RootContainer = HTMLElement & MicroAppElementInterface;
    /**
        * get micro-app element
        * @param target app container
        */
    export function getRootContainer(target: HTMLElement | ShadowRoot): RootContainer;
    /**
        * trim start & end
        */
    export function trim(str: string): string;
    export function isFireFox(): boolean;
    /**
        * Transforms a queryString into object.
        * @param search - search string to parse
        * @returns a query object
        */
    export function parseQuery(search: string): LocationQueryObject;
    /**
        * Transforms an object to query string
        * @param queryObject - query object to stringify
        * @returns query string without the leading `?`
        */
    export function stringifyQuery(queryObject: LocationQueryObject): string;
    /**
        * Register or unregister callback/guard with Set
        */
    export function useSetRecord<T>(): {
            add: (handler: T) => () => boolean;
            list: () => Set<T>;
    };
    /**
        * record data with Map
        */
    export function useMapRecord<T>(): {
            add: (key: PropertyKey, value: T) => () => boolean;
            get: (key: PropertyKey) => T | undefined;
            delete: (key: PropertyKey) => boolean;
    };
    export function getAttributes(element: Element): AttrsType;
    /**
        * if fiberTasks exist, wrap callback with promiseRequestIdle
        * if not, execute callback
        * @param fiberTasks fiber task list
        * @param callback action callback
        */
    export function injectFiberTask(fiberTasks: fiberTasks, callback: CallableFunction): void;
    /**
        * serial exec fiber task of link, style, script
        * @param tasks task array or null
        */
    export function serialExecFiberTasks(tasks: fiberTasks): Promise<void> | null;
    /**
        * inline script start with inline-xxx
        * @param address source address
        */
    export function isInlineScript(address: string): boolean;
    /**
        * call function with try catch
        * @param fn target function
        * @param appName app.name
        * @param args arguments
        */
    export function execMicroAppGlobalHook(fn: Func | null, appName: string, hookName: string, ...args: unknown[]): void;
    /**
        * remove all childNode from target node
        * @param $dom target node
        */
    export function clearDOM($dom: HTMLElement | ShadowRoot | Document): void;
    export function instanceOf<T extends new (...args: unknown[]) => unknown>(instance: unknown, constructor: T): instance is T extends new (...args: unknown[]) => infer R ? R : boolean;
    export function formatEventType(type: string, appName: string): string;
    /**
        * Is the object empty
        * target maybe number, string, array ...
        */
    export function isEmptyObject(target: unknown): boolean;
}

declare module '@micro-zoe/micro-app/interact' {
    import { CallableFunctionForInteract } from '@micro-app/types';
    class EventCenterForGlobal {
            /**
                * add listener of global data
                * @param cb listener
                * @param autoTrigger If there is cached data when first bind listener, whether it needs to trigger, default is false
                */
            addGlobalDataListener(cb: CallableFunctionForInteract, autoTrigger?: boolean): void;
            /**
                * remove listener of global data
                * @param cb listener
                */
            removeGlobalDataListener(cb: CallableFunctionForInteract): void;
            /**
                * dispatch global data
                * @param data data
                */
            setGlobalData(data: Record<PropertyKey, unknown>, nextStep?: CallableFunction, force?: boolean): void;
            forceSetGlobalData(data: Record<PropertyKey, unknown>, nextStep?: CallableFunction): void;
            /**
                * get global data
                */
            getGlobalData(): Record<PropertyKey, unknown> | null;
            /**
                * clear global data
                */
            clearGlobalData(): void;
            /**
                * clear all listener of global data
                * if appName exists, only the specified functions is cleared
                * if appName not exists, only clear the base app functions
                */
            clearGlobalDataListener(): void;
    }
    export class EventCenterForBaseApp extends EventCenterForGlobal {
            /**
                * add listener
                * @param appName app.name
                * @param cb listener
                * @param autoTrigger If there is cached data when first bind listener, whether it needs to trigger, default is false
                */
            addDataListener(appName: string, cb: CallableFunction, autoTrigger?: boolean): void;
            /**
                * remove listener
                * @param appName app.name
                * @param cb listener
                */
            removeDataListener(appName: string, cb: CallableFunction): void;
            /**
                * get data from micro app or base app
                * @param appName app.name
                * @param fromBaseApp whether get data from base app, default is false
                */
            getData(appName: string, fromBaseApp?: boolean): Record<PropertyKey, unknown> | null;
            /**
                * Dispatch data to the specified micro app
                * @param appName app.name
                * @param data data
                */
            setData(appName: string, data: Record<PropertyKey, unknown>, nextStep?: CallableFunction, force?: boolean): void;
            forceSetData(appName: string, data: Record<PropertyKey, unknown>, nextStep?: CallableFunction): void;
            /**
                * clear data from base app
                * @param appName app.name
                * @param fromBaseApp whether clear data from child app, default is true
                */
            clearData(appName: string, fromBaseApp?: boolean): void;
            /**
                * clear all listener for specified micro app
                * @param appName app.name
                */
            clearDataListener(appName: string): void;
    }
    export class EventCenterForMicroApp extends EventCenterForGlobal {
            appName: string;
            umdDataListeners?: {
                    global: Set<CallableFunctionForInteract>;
                    normal: Set<CallableFunctionForInteract>;
            };
            constructor(appName: string);
            /**
                * add listener, monitor the data sent by the base app
                * @param cb listener
                * @param autoTrigger If there is cached data when first bind listener, whether it needs to trigger, default is false
                */
            addDataListener(cb: CallableFunctionForInteract, autoTrigger?: boolean): void;
            /**
                * remove listener
                * @param cb listener
                */
            removeDataListener(cb: CallableFunctionForInteract): void;
            /**
                * get data from base app
                */
            getData(fromBaseApp?: boolean): Record<PropertyKey, unknown> | null;
            /**
                * dispatch data to base app
                * @param data data
                */
            dispatch(data: Record<PropertyKey, unknown>, nextStep?: CallableFunction, force?: boolean): void;
            forceDispatch(data: Record<PropertyKey, unknown>, nextStep?: CallableFunction): void;
            /**
                * clear data from child app
                * @param fromBaseApp whether clear data from base app, default is false
                */
            clearData(fromBaseApp?: boolean): void;
            /**
                * clear all listeners
                */
            clearDataListener(): void;
    }
    /**
        * Record UMD function before exec umdHookMount
        * NOTE: record maybe call twice when unmount prerender, keep-alive app manually with umd mode
        * @param microAppEventCenter instance of EventCenterForMicroApp
        */
    export function recordDataCenterSnapshot(microAppEventCenter: EventCenterForMicroApp): void;
    /**
        * Rebind the UMD function of the record before remount
        * @param microAppEventCenter instance of EventCenterForMicroApp
        */
    export function rebuildDataCenterSnapshot(microAppEventCenter: EventCenterForMicroApp): void;
    /**
        * delete umdDataListeners from microAppEventCenter
        * @param microAppEventCenter instance of EventCenterForMicroApp
        */
    export function resetDataCenterSnapshot(microAppEventCenter: EventCenterForMicroApp): void;
    export {};
}

