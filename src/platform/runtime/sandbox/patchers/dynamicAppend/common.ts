/**
 * @author Kuitos
 * @since 2019-10-21
 */
import { execScripts } from 'import-html-entry';
import { isFunction } from 'lodash';
import { frameworkConfiguration } from '../../../apis';

import * as css from '../css';

export const rawHeadAppendChild = HTMLHeadElement.prototype.appendChild;
const rawHeadRemoveChild = HTMLHeadElement.prototype.removeChild;
const rawBodyAppendChild = HTMLBodyElement.prototype.appendChild;
const rawBodyRemoveChild = HTMLBodyElement.prototype.removeChild;
const rawHeadInsertBefore = HTMLHeadElement.prototype.insertBefore;
const rawRemoveChild = HTMLElement.prototype.removeChild;

const SCRIPT_TAG_NAME = 'SCRIPT';
const LINK_TAG_NAME = 'LINK';
const STYLE_TAG_NAME = 'STYLE';

export function isHijackingTag(tagName?: string) {
  return (
    tagName?.toUpperCase() === LINK_TAG_NAME ||
    tagName?.toUpperCase() === STYLE_TAG_NAME ||
    tagName?.toUpperCase() === SCRIPT_TAG_NAME
  );
}

/**
 * Check if a style element is a styled-component liked.
 * A styled-components liked element is which not have textContext but keep the rules in its styleSheet.cssRules.
 * Such as the style element generated by styled-components and emotion.
 * @param element
 */
export function isStyledComponentsLike(element: HTMLStyleElement) {
  return (
    !element.textContent &&
    ((element.sheet as CSSStyleSheet)?.cssRules.length || getStyledElementCSSRules(element)?.length)
  );
}

function patchCustomEvent(
  e: CustomEvent,
  elementGetter: () => HTMLScriptElement | HTMLLinkElement | null,
): CustomEvent {
  Object.defineProperties(e, {
    srcElement: {
      get: elementGetter,
    },
    target: {
      get: elementGetter,
    },
  });

  return e;
}

function manualInvokeElementOnLoad(element: HTMLLinkElement | HTMLScriptElement) {
  // we need to invoke the onload event manually to notify the event listener that the script was completed
  // here are the two typical ways of dynamic script loading
  // 1. element.onload callback way, which webpack and loadjs used, see https://github.com/muicss/loadjs/blob/master/src/loadjs.js#L138
  // 2. addEventListener way, which toast-loader used, see https://github.com/pyrsmk/toast/blob/master/src/Toast.ts#L64
  const loadEvent = new CustomEvent('load');
  const patchedEvent = patchCustomEvent(loadEvent, () => element);
  if (isFunction(element.onload)) {
    element.onload(patchedEvent);
  } else {
    element.dispatchEvent(patchedEvent);
  }
}

function manualInvokeElementOnError(element: HTMLLinkElement | HTMLScriptElement) {
  const errorEvent = new CustomEvent('error');
  const patchedEvent = patchCustomEvent(errorEvent, () => element);
  if (isFunction(element.onerror)) {
    element.onerror(patchedEvent);
  } else {
    element.dispatchEvent(patchedEvent);
  }
}

function convertLinkAsStyle(
  element: HTMLLinkElement,
  postProcess: (styleElement: HTMLStyleElement) => void,
  fetchFn = fetch,
): HTMLStyleElement {
  const styleElement = document.createElement('style');
  const { href } = element;
  // add source link element href
  styleElement.dataset.freelogHref = href;

  fetchFn(href)
    .then((res: any) => res.text())
    .then((styleContext: string) => {
      styleElement.appendChild(document.createTextNode(styleContext));
      postProcess(styleElement);
      manualInvokeElementOnLoad(element);
    })
    .catch(() => manualInvokeElementOnError(element));

  return styleElement;
}

const styledComponentCSSRulesMap = new WeakMap<HTMLStyleElement, CSSRuleList>();
const dynamicScriptAttachedCommentMap = new WeakMap<HTMLScriptElement, Comment>();
const dynamicLinkAttachedInlineStyleMap = new WeakMap<HTMLLinkElement, HTMLStyleElement>();

export function recordStyledComponentsCSSRules(styleElements: HTMLStyleElement[]): void {
  styleElements.forEach((styleElement) => {
    /*
     With a styled-components generated style element, we need to record its cssRules for restore next re-mounting time.
     We're doing this because the sheet of style element is going to be cleaned automatically by browser after the style element dom removed from document.
     see https://www.w3.org/TR/cssom-1/#associated-css-style-sheet
     */
    if (styleElement instanceof HTMLStyleElement && isStyledComponentsLike(styleElement)) {
      if (styleElement.sheet) {
        // record the original css rules of the style element for restore
        styledComponentCSSRulesMap.set(styleElement, (styleElement.sheet as CSSStyleSheet).cssRules);
      }
    }
  });
}

export function getStyledElementCSSRules(styledElement: HTMLStyleElement): CSSRuleList | undefined {
  return styledComponentCSSRulesMap.get(styledElement);
}

export type ContainerConfig = {
  appName: string;
  proxy: WindowProxy;
  strictGlobal: boolean;
  dynamicStyleSheetElements: HTMLStyleElement[];
  appWrapperGetter: CallableFunction;
  scopedCSS: boolean;
  excludeAssetFilter?: CallableFunction;
};

function getOverwrittenAppendChildOrInsertBefore(opts: {
  rawDOMAppendOrInsertBefore: <T extends Node>(newChild: T, refChild?: Node | null) => T;
  isInvokedByMicroApp: (element: HTMLElement) => boolean;
  containerConfigGetter: (element: HTMLElement) => ContainerConfig;
}) {
  return function appendChildOrInsertBefore<T extends Node>(
    this: HTMLHeadElement | HTMLBodyElement,
    newChild: T,
    refChild?: Node | null,
  ) {
    let element = newChild as any;
    const { rawDOMAppendOrInsertBefore, isInvokedByMicroApp, containerConfigGetter } = opts;
    if (!isHijackingTag(element.tagName) || !isInvokedByMicroApp(element)) {
      return rawDOMAppendOrInsertBefore.call(this, element, refChild) as T;
    }

    if (element.tagName) {
      const containerConfig = containerConfigGetter(element);
      const {
        appName,
        appWrapperGetter,
        proxy,
        strictGlobal,
        dynamicStyleSheetElements,
        scopedCSS,
        excludeAssetFilter,
      } = containerConfig;

      switch (element.tagName) {
        case LINK_TAG_NAME:
        case STYLE_TAG_NAME: {
          let stylesheetElement: HTMLLinkElement | HTMLStyleElement = newChild as any;
          const { href } = stylesheetElement as HTMLLinkElement;
          if (excludeAssetFilter && href && excludeAssetFilter(href)) {
            return rawDOMAppendOrInsertBefore.call(this, element, refChild) as T;
          }

          const mountDOM = appWrapperGetter();

          if (scopedCSS) {
            // exclude link elements like <link rel="icon" href="favicon.ico">
            const linkElementUsingStylesheet =
              element.tagName?.toUpperCase() === LINK_TAG_NAME &&
              (element as HTMLLinkElement).rel === 'stylesheet' &&
              (element as HTMLLinkElement).href;
            if (linkElementUsingStylesheet) {
              const fetch =
                typeof frameworkConfiguration.fetch === 'function'
                  ? frameworkConfiguration.fetch
                  : frameworkConfiguration.fetch?.fn;
              stylesheetElement = convertLinkAsStyle(
                element,
                (styleElement) => css.process(mountDOM, styleElement, appName),
                fetch,
              );
              dynamicLinkAttachedInlineStyleMap.set(element, stylesheetElement);
            } else {
              css.process(mountDOM, stylesheetElement, appName);
            }
          }

          // eslint-disable-next-line no-shadow
          dynamicStyleSheetElements.push(stylesheetElement);
          const referenceNode = mountDOM.contains(refChild) ? refChild : null;
          return rawDOMAppendOrInsertBefore.call(mountDOM, stylesheetElement, referenceNode);
        }

        case SCRIPT_TAG_NAME: {
          const { src, text } = element as HTMLScriptElement;
          // some script like jsonp maybe not support cors which should't use execScripts
          if (excludeAssetFilter && src && excludeAssetFilter(src)) {
            return rawDOMAppendOrInsertBefore.call(this, element, refChild) as T;
          }

          const mountDOM = appWrapperGetter();
          const { fetch } = frameworkConfiguration;
          const referenceNode = mountDOM.contains(refChild) ? refChild : null;

          if (src) {
            execScripts(null, [src], proxy, {
              fetch,
              strictGlobal,
              beforeExec: () => {
                Object.defineProperty(document, 'currentScript', {
                  get(): any {
                    return element;
                  },
                  configurable: true,
                });
              },
              success: () => {
                manualInvokeElementOnLoad(element);
                element = null;
              },
              error: () => {
                manualInvokeElementOnError(element);
                element = null;
              },
            });

            const dynamicScriptCommentElement = document.createComment(`dynamic script ${src} replaced by freelog`);
            dynamicScriptAttachedCommentMap.set(element, dynamicScriptCommentElement);
            return rawDOMAppendOrInsertBefore.call(mountDOM, dynamicScriptCommentElement, referenceNode);
          }

          // inline script never trigger the onload and onerror event
          execScripts(null, [`<script>${text}</script>`], proxy, { strictGlobal });
          const dynamicInlineScriptCommentElement = document.createComment('dynamic inline script replaced by freelog');
          dynamicScriptAttachedCommentMap.set(element, dynamicInlineScriptCommentElement);
          return rawDOMAppendOrInsertBefore.call(mountDOM, dynamicInlineScriptCommentElement, referenceNode);
        }

        default:
          break;
      }
    }

    return rawDOMAppendOrInsertBefore.call(this, element, refChild);
  };
}

function getNewRemoveChild(
  headOrBodyRemoveChild: typeof HTMLElement.prototype.removeChild,
  appWrapperGetterGetter: (element: HTMLElement) => ContainerConfig['appWrapperGetter'],
) {
  return function removeChild<T extends Node>(this: HTMLHeadElement | HTMLBodyElement, child: T) {
    const { tagName } = child as any;
    if (!isHijackingTag(tagName)) return headOrBodyRemoveChild.call(this, child) as T;

    try {
      let attachedElement: Node;
      switch (tagName) {
        case LINK_TAG_NAME: {
          attachedElement = (dynamicLinkAttachedInlineStyleMap.get(child as any) as Node) || child;
          break;
        }

        case SCRIPT_TAG_NAME: {
          attachedElement = (dynamicScriptAttachedCommentMap.get(child as any) as Node) || child;
          break;
        }

        default: {
          attachedElement = child;
        }
      }

      // container may had been removed while app unmounting if the removeChild action was async
      const appWrapperGetter = appWrapperGetterGetter(child as any);
      const container = appWrapperGetter();
      if (container.contains(attachedElement)) {
        return rawRemoveChild.call(container, attachedElement) as T;
      }
    } catch (e) {
      console.warn(e);
    }

    return headOrBodyRemoveChild.call(this, child) as T;
  };
}

export function patchHTMLDynamicAppendPrototypeFunctions(
  isInvokedByMicroApp: (element: HTMLElement) => boolean,
  containerConfigGetter: (element: HTMLElement) => ContainerConfig,
) {
  // Just overwrite it while it have not been overwrite
  if (
    HTMLHeadElement.prototype.appendChild === rawHeadAppendChild &&
    HTMLBodyElement.prototype.appendChild === rawBodyAppendChild &&
    HTMLHeadElement.prototype.insertBefore === rawHeadInsertBefore
  ) {
    HTMLHeadElement.prototype.appendChild = getOverwrittenAppendChildOrInsertBefore({
      rawDOMAppendOrInsertBefore: rawHeadAppendChild,
      containerConfigGetter,
      isInvokedByMicroApp,
    }) as typeof rawHeadAppendChild;
    HTMLBodyElement.prototype.appendChild = getOverwrittenAppendChildOrInsertBefore({
      rawDOMAppendOrInsertBefore: rawBodyAppendChild,
      containerConfigGetter,
      isInvokedByMicroApp,
    }) as typeof rawBodyAppendChild;

    HTMLHeadElement.prototype.insertBefore = getOverwrittenAppendChildOrInsertBefore({
      rawDOMAppendOrInsertBefore: rawHeadInsertBefore as any,
      containerConfigGetter,
      isInvokedByMicroApp,
    }) as typeof rawHeadInsertBefore;
  }

  // Just overwrite it while it have not been overwrite
  if (
    HTMLHeadElement.prototype.removeChild === rawHeadRemoveChild &&
    HTMLBodyElement.prototype.removeChild === rawBodyRemoveChild
  ) {
    HTMLHeadElement.prototype.removeChild = getNewRemoveChild(
      rawHeadRemoveChild,
      (element) => containerConfigGetter(element).appWrapperGetter,
    );
    HTMLBodyElement.prototype.removeChild = getNewRemoveChild(
      rawBodyRemoveChild,
      (element) => containerConfigGetter(element).appWrapperGetter,
    );
  }

  return function unpatch() {
    HTMLHeadElement.prototype.appendChild = rawHeadAppendChild;
    HTMLHeadElement.prototype.removeChild = rawHeadRemoveChild;
    HTMLBodyElement.prototype.appendChild = rawBodyAppendChild;
    HTMLBodyElement.prototype.removeChild = rawBodyRemoveChild;

    HTMLHeadElement.prototype.insertBefore = rawHeadInsertBefore;
  };
}

export function rebuildCSSRules(
  styleSheetElements: HTMLStyleElement[],
  reAppendElement: (stylesheetElement: HTMLStyleElement) => boolean,
) {
  styleSheetElements.forEach((stylesheetElement) => {
    // re-append the dynamic stylesheet to sub-app container
    const appendSuccess = reAppendElement(stylesheetElement);
    if (appendSuccess) {
      /*
      get the stored css rules from styled-components generated element, and the re-insert rules for them.
      note that we must do this after style element had been added to document, which stylesheet would be associated to the document automatically.
      check the spec https://www.w3.org/TR/cssom-1/#associated-css-style-sheet
       */
      if (stylesheetElement instanceof HTMLStyleElement && isStyledComponentsLike(stylesheetElement)) {
        const cssRules = getStyledElementCSSRules(stylesheetElement);
        if (cssRules) {
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < cssRules.length; i++) {
            const cssRule = cssRules[i];
            const cssStyleSheetElement = stylesheetElement.sheet as CSSStyleSheet;
            cssStyleSheetElement.insertRule(cssRule.cssText, cssStyleSheetElement.cssRules.length);
          }
        }
      }
    }
  });
}
