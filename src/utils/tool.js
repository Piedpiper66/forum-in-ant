import Vue from "vue";
import AES from "crypto-js/aes";
import Utf8 from "crypto-js/enc-utf8";

const proto = Vue.prototype;

/**
 * @param { Function } fn 目标函数
 * @param { number } delay 延迟多久执行
 * @param { boolean } immediate 函数是否立即执行
 * @param { object } host fn 的 `this`，默认为 `null`
 */
export const throttle = (fn, delay = 200, immediate = false, host = null) => {
  // prettier-ignore
  let timer = null, canRun = true;

  return function (...args) {
    if (!canRun) return;
    canRun = false;
    clearTimeout(timer);

    immediate && fn.apply(host, args);

    timer = setTimeout(() => {
      !immediate && fn.apply(host, args);
      canRun = true;
    }, delay);
  };
};

proto.throttle = throttle;

/**
 *
 */
export const debounce = (fn, delay, immediate = false, host) => {
  // prettier-ignore
  let timer = null;

  return function (...args) {
    if (!timer && immediate) fn.apply(host ?? this, args);

    clearTimeout(timer);

    timer = setTimeout(() => {
      immediate ? (timer = null) : fn.apply(host ?? this, args);
    }, delay);
  };
};

proto.debounce = debounce;

// 冻结嵌套对象, Object.freeze 只能冻结对象的第一层
export const deepFreeze = (obj) => {
  if (!obj) return;
  // 取出所有属性
  const propNames = Object.getOwnPropertyNames(obj);

  // // 在冻结自身之前冻结属性值
  propNames.forEach((name) => {
    const prop = obj[name];
    // 如果prop是个对象，冻结它
    if (prop !== null && typeof prop === "object") deepFreeze(prop);
  });

  // 冻结自身(no-op if already frozen)
  return Object.freeze(obj);
};

proto.deepFreeze = deepFreeze;

// 深拷贝
export const deepClone = (obj) => {
  let objClone = Array.isArray(obj) ? [] : {};

  if (obj && typeof obj === "object") {
    for (let key of Object.keys(obj)) {
      //判断 obj子元素是否为对象，如果是，递归复制
      if (obj[key] && typeof obj[key] === "object") {
        objClone[key] = deepClone(obj[key]);
      } else {
        //如果不是，简单复制
        objClone[key] = obj[key];
      }
    }
  }
  return objClone;
};

proto.deepClone = deepClone;

// 处理 document.cookie; 获取Cookie;
export const Cookie = {
  get: function (name) {
    const cookie = document.cookie,
      cookieName = encodeURIComponent(name) + "=",
      cookieStart = cookie.indexOf(cookieName); /* cookie 初始索引 */
    let cookieValue = null;

    // 倘若该 cookie 存在
    if (cookieStart > -1) {
      // 获取 cookie 末尾索引
      let cookieEnd = cookie.indexOf(";", cookieStart);
      // 尾部 cookie 没有 ';' 结尾, 则末尾索引为 document.cookie 的长度
      if (cookieEnd == -1) {
        cookieEnd = cookie.length;
      }
      // 从 cookie 名的后一位开始截取 cookie 的值
      cookieValue = decodeURIComponent(
        cookie.substring(cookieStart + cookieName.length, cookieEnd)
      );
    }

    return cookieValue;
  },
  set: function (name, value, expires, path, domain, secure) {
    let cookieText = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (expires instanceof Date) {
      cookieText += `; expires=${expires.toUTCString()}`;
    }

    if (path) {
      cookieText += `; path=${path}`;
    }

    if (domain) {
      cookieText += `; domain=${domain}`;
    }

    if (secure) {
      cookieText += "; secure";
    }

    document.cookie = cookieText;
  },
  remove: function (name, path, domain, secure) {
    this.set(name, "", new Date(0), path, domain, secure);
  },
};

proto.Cookie = Cookie;

// 对用户的登录注册的密码进行加密
export function aesEncrypt(data, key = "f4b1k4m7a") {
  return AES.encrypt(JSON.stringify(data), key).toString();
}

export function aesDecrypt(message, key = "f4b1k4m7a") {
  const wordArray = AES.decrypt(message, key);
  return JSON.parse(wordArray.toString(Utf8));
}

/**
 * @param Component 组件实例的选项对象
 * @param props 组件实例中的prop
 */
export function create(Component, props) {
  const comp = new (Vue.extend(Component))({ propsData: props }).$mount();

  document.body.appendChild(comp.$el);

  comp.remove = () => {
    document.body.removeChild(comp.$el);

    comp.$destroy();
  };

  return comp;
}

proto.create = create;

export function capitalize(str) {
  str += "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ---------------------- 通过 src 生成 File 对象 -----------------------------*/

export function imgUrlToFile(base64, filename, originName, src) {
  // const imgLink = url;
  // const tempImage = new Image();
  //如果图片url是网络url，要加下一句代码
  //跨域不可用
  return new Promise((resolve) => {
    // tempImage.crossOrigin = "*";
    // tempImage.src = imgLink;
    // tempImage.onload = () => {
    // const base64 = getBase64Image(tempImage);

    const imgBlob = base64toBlob(base64);

    const convertFile = blobToFile(imgBlob, filename, originName, src);

    //获取原文件名称
    resolve(convertFile);
    // };
  });
}
// function getBase64Image(img) {
//   //通过canvas绘制图片转base64
//   const canvas = document.createElement("canvas");
//   canvas.width = img.width;
//   canvas.height = img.height;
//   const ctx = canvas.getContext("2d");
//   ctx.drawImage(img, 0, 0, img.width, img.height);
//   const ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
//   const dataURL = canvas.toDataURL("image/" + ext);
//   return dataURL;
// }
function base64toBlob(base64) {
  //base64转Blob
  let arr = base64.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
function blobToFile(blob, filename, originName, src) {
  //Blob转file对象
  // edge浏览器不支持new File对象，所以用以下方法兼容
  blob.lastModifiedDate = new Date();
  blob.name = originName;
  blob._name = originName;
  blob._filename = filename;
  // blob.url = url;
  return blob;
}

/* ------------------------ -*/
export function getElementToPageTop(el) {
  if (!el instanceof HTMLElement) return 0;
  if (el.offsetParent) {
    return getElementToPageTop(el.offsetParent) + el.offsetTop;
  } else {
    return el.offsetTop;
  }
}

// 获取操作系统
export function detectOS() {
  var isWin = navigator.platform == "Win32" || navigator.platform == "Windows";
  if (isWin) return "Windows";
  var isMac =
    navigator.platform == "Mac68K" ||
    navigator.platform == "MacPPC" ||
    navigator.platform == "Macintosh" ||
    navigator.platform == "MacIntel";

  if (isMac) return "Mac";

  var isUnix = navigator.platform == "X11" && !isWin && !isMac;

  if (isUnix) return "Unix";

  var isLinux = String(navigator.platform).indexOf("Linux") > -1;

  if (isLinux) return "Linux";

  return "other";
}

// 获取浏览器厂商名称
export function detectBrowser() {
  const inBrowser = typeof window !== "undefined";
  const inWeex =
    typeof WXEnvironment !== "undefined" && !!WXEnvironment.platform;
  const weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
  const UA = inBrowser && window.navigator.userAgent.toLowerCase();
  const isIE = UA && /msie|trident/.test(UA);
  const edgeReg = /edg(e?)\//;
  const isEdge = UA && edgeReg.test(UA);
  const isAndroid =
    (UA && UA.indexOf("android") > 0) || weexPlatform === "android";
  const isIOS =
    (UA && /iphone|ipad|ipod|ios/.test(UA)) || weexPlatform === "ios";
  const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
  const isFF = UA && UA.match(/firefox\/(\d+)/);
  const isSafari = UA && UA.indexOf("safari") !== -1;

  const isMobile =
    isAndroid ||
    isIOS ||
    (window.navigator.userAgentData && window.navigator.userAgentData.mobile);

  const browser = isIE
    ? "Internet Explorer"
    : isEdge
    ? "Microsoft Edge"
    : isChrome
    ? "Google Chrome"
    : isSafari || isIOS
    ? "Safari"
    : isFF
    ? "FireFox"
    : "unknown";

  return { isMobile, browser };
}
