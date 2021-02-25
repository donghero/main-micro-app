import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import { nextTick } from '../utils';
import { getTargetValue, setCurrentRunningSandboxProxy } from './common';
/**
 * fastest(at most time) unique array method
 * @see https://jsperf.com/array-filter-unique/30
 */

function uniq(array) {
    return array.filter(function filter(element) {
        return element in this ? false : this[element] = true;
    }, Object.create(null));
} // zone.js will overwrite Object.defineProperty


var rawObjectDefineProperty = Object.defineProperty;
var variableWhiteListInDev = process.env.NODE_ENV === 'development' || window.__QIANKUN_DEVELOPMENT__ ? [ // for react hot reload
    // see https://github.com/facebook/create-react-app/blob/66bf7dfc43350249e2f09d138a20840dae8a0a4a/packages/react-error-overlay/src/index.js#L180
    '__REACT_ERROR_OVERLAY_GLOBAL_HOOK__'
] : []; // who could escape the sandbox

var variableWhiteList = [ // FIXME System.js used a indirect call with eval, which would make it scope escape to global
    // To make System.js works well, we write it back to global window temporary
    // see https://github.com/systemjs/systemjs/blob/457f5b7e8af6bd120a279540477552a07d5de086/src/evaluate.js#L106
    'System', // see https://github.com/systemjs/systemjs/blob/457f5b7e8af6bd120a279540477552a07d5de086/src/instantiate.js#L357
    '__cjsWrapper'
].concat(variableWhiteListInDev);
/*
 variables who are impossible to be overwrite need to be escaped from proxy sandbox for performance reasons
 */

var unscopables = {
    undefined: true,
    Array: true,
    Object: true,
    String: true,
    Boolean: true,
    Math: true,
    Number: true,
    Symbol: true,
    parseFloat: true,
    Float32Array: true
};

function createFakeWindow(global) {
    // map always has the fastest performance in has check scenario
    // see https://jsperf.com/array-indexof-vs-set-has/23
    var propertiesWithGetter = new Map();
    var fakeWindow = {};
    /*
     copy the non-configurable property of global to fakeWindow
     see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getOwnPropertyDescriptor
     > A property cannot be reported as non-configurable, if it does not exists as an own property of the target object or if it exists as a configurable own property of the target object.
     */

    Object.getOwnPropertyNames(global).filter(function(p) {
        var descriptor = Object.getOwnPropertyDescriptor(global, p);
        return !(descriptor === null || descriptor === void 0 ? void 0 : descriptor.configurable);
    }).forEach(function(p) {
        var descriptor = Object.getOwnPropertyDescriptor(global, p);

        if (descriptor) {
            var hasGetter = Object.prototype.hasOwnProperty.call(descriptor, 'get');
            /*
             make top/self/window property configurable and writable, otherwise it will cause TypeError while get trap return.
             see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/get
             > The value reported for a property must be the same as the value of the corresponding target object property if the target object property is a non-writable, non-configurable data property.
             */

            if (p === 'top' || p === 'parent' || p === 'self' || p === 'window' || process.env.NODE_ENV === 'test' && (p === 'mockTop' || p === 'mockSafariTop')) {
                descriptor.configurable = true;
                /*
                 The descriptor of window.window/window.top/window.self in Safari/FF are accessor descriptors, we need to avoid adding a data descriptor while it was
                 Example:
                  Safari/FF: Object.getOwnPropertyDescriptor(window, 'top') -> {get: function, set: undefined, enumerable: true, configurable: false}
                  Chrome: Object.getOwnPropertyDescriptor(window, 'top') -> {value: Window, writable: false, enumerable: true, configurable: false}
                 */

                if (!hasGetter) {
                    descriptor.writable = true;
                }
            }

            if (hasGetter) propertiesWithGetter.set(p, true); // freeze the descriptor to avoid being modified by zone.js
            // see https://github.com/angular/zone.js/blob/a5fe09b0fac27ac5df1fa746042f96f05ccb6a00/lib/browser/define-property.ts#L71

            rawObjectDefineProperty(fakeWindow, p, Object.freeze(descriptor));
        }
    });
    return {
        fakeWindow: fakeWindow,
        propertiesWithGetter: propertiesWithGetter
    };
}

var activeSandboxCount = 0;
/**
 * 基于 Proxy 实现的沙箱
 */
var rawDocument = document
var rawHistory = history
var locations = new Map()
if (location.hash && location.hash.split('#')) {
    var loc = location.hash.split('#')
    loc.forEach((item) => {
        var l = item.split('=')
        item && l && locations.set(l[0], { pathname: l[1], href: l[1] })
    })
    console.log(locations)
}
// TODO pathname  search
function locationCenterf() {
    this.set = function(name, attr) {
        var loc = locations.get(name) || {}
        if (attr.pathname && attr.pathname.indexOf(location.host) > -1) {
            attr.pathname = attr.pathname.replace(location.protocol, '').replace(location.host, '').replace('//', '')
        }
        locations.set(name, {
            ...loc,
            ...attr
        })

        // TODO 只有在线的应用才在url上显示, 只有pathname和query需要
        var hash = ''
        locations.forEach((value, key) => {
            hash += '#' + key + '=' + value.pathname || ''
        })
        location.hash = hash
    }

    this.get = function(name) {
        locations.get(name)
    }
}
var locationCenter = new locationCenterf()
var rawLocation = location
var ProxySandbox = /*#__PURE__*/ function() {
    function ProxySandbox(name) {
        var _this = this;
        _classCallCheck(this, ProxySandbox);

        /** window 值变更记录 */
        this.updatedValueSet = new Set();
        this.sandboxRunning = true;
        this.latestSetProp = null;
        this.name = name;
        this.type = 'Proxy';
        var updatedValueSet = this.updatedValueSet;
        var rawWindow = window;

        var _createFakeWindow = createFakeWindow(rawWindow),
            fakeWindow = _createFakeWindow.fakeWindow,
            propertiesWithGetter = _createFakeWindow.propertiesWithGetter;

        var descriptorTargetMap = new Map();

        var hasOwnProperty = function hasOwnProperty(key) {
            return fakeWindow.hasOwnProperty(key) || rawWindow.hasOwnProperty(key);
        };
        var fakeDoc = {}
        var fakeHis = {}
        var fakeLoc = {}
        var proxyDoc = null
        var proxyHis = null
        var proxyLoc = null
        var proxy = new Proxy(fakeWindow, {
            set: function set(target, p, value) {
                if (_this.sandboxRunning) {
                    // We must kept its description while the property existed in rawWindow before
                    if (!target.hasOwnProperty(p) && rawWindow.hasOwnProperty(p)) {
                        var descriptor = Object.getOwnPropertyDescriptor(rawWindow, p);
                        var writable = descriptor.writable,
                            configurable = descriptor.configurable,
                            enumerable = descriptor.enumerable;

                        if (writable) {
                            Object.defineProperty(target, p, {
                                configurable: configurable,
                                enumerable: enumerable,
                                writable: writable,
                                value: value
                            });
                        }
                    } else {
                        // @ts-ignore
                        target[p] = value;
                    }

                    if (variableWhiteList.indexOf(p) !== -1) {
                        // @ts-ignore
                        rawWindow[p] = value;
                    }

                    updatedValueSet.add(p);
                    _this.latestSetProp = p;
                    return true;
                }

                if (process.env.NODE_ENV === 'development') {
                    console.warn("[qiankun] Set window.".concat(p.toString(), " while sandbox destroyed or inactive in ").concat(name, "!"));
                } // 在 strict-mode 下，Proxy 的 handler.set 返回 false 会抛出 TypeError，在沙箱卸载的情况下应该忽略错误


                return true;
            },
            get: function get(target, p) {
                if (p === Symbol.unscopables) return unscopables; // avoid who using window.window or window.self to escape the sandbox environment to touch the really window
                // see https://github.com/eligrey/FileSaver.js/blob/master/src/FileSaver.js#L13

                if (p === 'window' || p === 'self') {
                    return proxy;
                } // hijack global accessing with globalThis keyword


                if (p === 'globalThis') {
                    return proxy;
                }

                if (p === 'top' || p === 'parent' || process.env.NODE_ENV === 'test' && (p === 'mockTop' || p === 'mockSafariTop')) {
                    // if your master app in an iframe context, allow these props escape the sandbox
                    if (rawWindow === rawWindow.parent) {
                        return proxy;
                    }

                    return rawWindow[p];
                } // proxy.hasOwnProperty would invoke getter firstly, then its value represented as rawWindow.hasOwnProperty


                if (p === 'hasOwnProperty') {
                    return hasOwnProperty;
                } // mark the symbol to document while accessing as document.createElement could know is invoked by which sandbox for dynamic append patcher

                if (p === 'history') {
                    // TODO 如果是单应用模式（提升性能）则不用代理 
                    proxyHis = proxyHis || new Proxy(fakeHis, {
                        /* 
                         */
                        get: function get(HisTarget, property) {
                            if (property === 'pushState' || property === 'replaceState') {
                                return function() {
                                    // TODO 解析query参数  search
                                    locationCenter.set(name, { pathname: arguments[2] })
                                    console.log(locations)
                                };

                            } else {
                                return rawHistory[property]
                            }
                        }
                    })
                    return proxyHis
                }
                if (p === 'location') {
                    // TODO 如果是单应用模式（提升性能）则不用代理, 可以设置location.href的使用权限 
                    // TODO reload相当于重载应用，想办法把主应用的对应操控函数弄过来，发布订阅模式
                    // TODO replace与reload、toString方法无法访问
                    proxyLoc = proxyLoc || new Proxy(fakeLoc, {
                        /* 
                            a标签的href需要拦截，// TODO 如果以http开头则不拦截
                         */
                        get: function get(docTarget, property) {
                            if (['href', 'pathname', 'hash'].indexOf(property) > -1) {
                                return locations.get(name) && locations.get(name)[property] || ''
                            } else {
                                if (['replace'].indexOf(property) > -1) {
                                    return function() {

                                    }
                                }
                                if (property === 'toString') {
                                    return () => {
                                        return locations.get(name) && locations.get(name)['pathname'] || ''
                                    }
                                }
                                if (typeof rawLocation[property] === 'function') {
                                    return rawLocation[property].bind(rawLocation)
                                }
                                return rawLocation[property]
                            }
                        }
                    })
                    return proxyLoc
                }
                // TODO test localstorage
                if(p === 'localStorage'){
                    return {
                        clear: function(){

                        },
                        getItem: function(){

                        },
                        key: function(){

                        },
                        removeItem: function(){

                        },
                        setItem: function(){

                        },
                        length: 0
                    }
                }
                if (p === 'document' || p === 'eval') {
                    setCurrentRunningSandboxProxy(proxy); // FIXME if you have any other good ideas
                    // remove the mark in next tick, thus we can identify whether it in micro app or not
                    // this approach is just a workaround, it could not cover all complex cases, such as the micro app runs in the same task context with master in some case

                    nextTick(function() {
                        return setCurrentRunningSandboxProxy(null);
                    });

                    switch (p) {
                        case 'document':
                            // @ts-ignore
                            if (true) {
                                // TODO 如果是单应用模式（提升性能）则不用代理 
                                // TODO 为了保证id唯一性，必须每访问一次都取不同的值作为id
                                // fakeDoc = document.getElementById('subapp-viewport') || fakeDoc;
                                // if (!fakeDoc.firstChild) return document
                                // var a = fakeDoc.firstChild.shadowRoot ? fakeDoc.firstChild.shadowRoot.children : fakeDoc.firstChild.children
                                // var doc;
                                // for (var i = 0; i < a.length; i++) {
                                //     if (a.item(i).tagName === 'DIV') doc = a.item(i);
                                // }
                                var doc = document.getElementById(name)
                                if (!doc) return document
                                proxyDoc = new Proxy(fakeDoc, {
                                    /* 分类 
                                       1.通过caller来确定this的非属性方法
                                         例如 addEventListener
                                       2.zonejs需要用的全局取值的方法（出问题再解决问题）
                                         例如 'querySelector', 'getElementsByTagName'
                                       3.根节点下没有的方法
                                       4.属性（包括原型）方法：替换this为根节点
                                    */
                                    get: function get(docTarget, property) {
                                        if(property === 'location'){
                                            // TODO varify
                                            return proxy.location
                                        }
                                        if (property === 'createElement') {
                                            return document.createElement.bind(document)
                                        }
                                        // @ts-ignore

                                        document.addEventListener = doc.addEventListener.bind(doc)
                                            // @ts-ignore
                                        doc.body = doc;
                                        doc.body.appendChild = doc.appendChild.bind(doc)
                                            // if (property === 'addEventListener') debugger
                                        if (doc[property] && ['querySelector', 'getElementsByTagName'].indexOf(property) === -1) {
                                            if (property === 'nodeType') return document.nodeType
                                            if (typeof doc[property] === 'function') return doc[property].bind(doc)
                                            return doc[property]
                                        } else {
                                            if (['querySelector', 'getElementsByTagName'].indexOf(property) !== -1) {
                                                return function() {
                                                    if (['head', 'html'].indexOf(arguments[0]) !== -1) {
                                                        return document[property](...arguments)
                                                    } else {
                                                        return doc[property](...arguments)
                                                    }
                                                }
                                            }
                                            if (property === 'getElementById') return function(id) {
                                                let children = doc.getElementsByTagName('*').children
                                                if (children) {
                                                    for (let i = 0; i < children.length; i++) {
                                                        if (children[i].getAttribute('id') === id) {
                                                            return children[i]
                                                        }
                                                    }
                                                }
                                                return null
                                            }
                                            if (typeof document[property] === 'function') return document[property].bind(document)
                                            return document[property]
                                        }

                                    }
                                })
                                return proxyDoc
                            }
                            return document

                        case 'eval':
                            // eslint-disable-next-line no-eval
                            return eval;
                            // no default
                    }
                } // eslint-disable-next-line no-nested-ternary


                var value = propertiesWithGetter.has(p) ? rawWindow[p] : p in target ? target[p] : rawWindow[p];
                return getTargetValue(rawWindow, value);
            },
            // trap in operator
            // see https://github.com/styled-components/styled-components/blob/master/packages/styled-components/src/constants.js#L12
            has: function has(target, p) {
                return p in unscopables || p in target || p in rawWindow;
            },
            getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, p) {
                /*
                 as the descriptor of top/self/window/mockTop in raw window are configurable but not in proxy target, we need to get it from target to avoid TypeError
                 see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getOwnPropertyDescriptor
                 > A property cannot be reported as non-configurable, if it does not exists as an own property of the target object or if it exists as a configurable own property of the target object.
                 */
                if (target.hasOwnProperty(p)) {
                    var descriptor = Object.getOwnPropertyDescriptor(target, p);
                    descriptorTargetMap.set(p, 'target');
                    return descriptor;
                }

                if (rawWindow.hasOwnProperty(p)) {
                    var _descriptor = Object.getOwnPropertyDescriptor(rawWindow, p);

                    descriptorTargetMap.set(p, 'rawWindow'); // A property cannot be reported as non-configurable, if it does not exists as an own property of the target object

                    if (_descriptor && !_descriptor.configurable) {
                        _descriptor.configurable = true;
                    }

                    return _descriptor;
                }

                return undefined;
            },
            // trap to support iterator with sandbox
            ownKeys: function ownKeys(target) {
                var keys = uniq(Reflect.ownKeys(rawWindow).concat(Reflect.ownKeys(target)));
                return keys;
            },
            defineProperty: function defineProperty(target, p, attributes) {
                var from = descriptorTargetMap.get(p);
                /*
                 Descriptor must be defined to native window while it comes from native window via Object.getOwnPropertyDescriptor(window, p),
                 otherwise it would cause a TypeError with illegal invocation.
                 */

                switch (from) {
                    case 'rawWindow':
                        return Reflect.defineProperty(rawWindow, p, attributes);

                    default:
                        return Reflect.defineProperty(target, p, attributes);
                }
            },
            deleteProperty: function deleteProperty(target, p) {
                if (target.hasOwnProperty(p)) {
                    // @ts-ignore
                    delete target[p];
                    updatedValueSet.delete(p);
                    return true;
                }

                return true;
            }
        });
        this.proxy = proxy;
        activeSandboxCount++;
    }

    _createClass(ProxySandbox, [{
        key: "active",
        value: function active() {
            if (!this.sandboxRunning) activeSandboxCount++;
            this.sandboxRunning = true;
        }
    }, {
        key: "inactive",
        value: function inactive() {
            var _this2 = this;

            if (process.env.NODE_ENV === 'development') {
                console.info("[qiankun:sandbox] ".concat(this.name, " modified global properties restore..."), _toConsumableArray(this.updatedValueSet.keys()));
            }

            if (--activeSandboxCount === 0) {
                variableWhiteList.forEach(function(p) {
                    if (_this2.proxy.hasOwnProperty(p)) {
                        // @ts-ignore
                        delete window[p];
                    }
                });
            }

            this.sandboxRunning = false;
        }
    }]);

    return ProxySandbox;
}();

export { ProxySandbox as default };