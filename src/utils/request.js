import Axios from "axios";
import { Cookie } from "./tool";
import Store from "../store";
import { message as Message } from "ant-design-vue";

const http = Axios.create({
  baseURL: process.env.VUE_APP_URL,
  withCredentials: true,
  timeout: 6000, // 超时重传还没做
  timeoutMaxRetry: 3,
  // timeoutRetryInterval: 1500,
  timeoutErrorMessage: "timeout invoke",
});

http.interceptors.request.use(
  (config) => {
    config.headers.Authorization = Cookie.get("FORUM_t");
    config.headers.forum_dev = Cookie.get("DEV_ID");

    // 取消发送
    if (config.cancel) {
      config.cancelToken = new Axios.CancelToken((canceler) => {
        Store.commit("ADD_CANCELREQUEST", canceler);
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isNotifyForExpire = false;

const msgCache = {
  error: "",
  info: "",
};

http.interceptors.response.use(
  ({ data, status }) => {
    return { data, status };
  },
  (error) => {
    const { config, message, response, code } = error;
    console.log(error);

    const status = response?.status;

    // 超时重传
    if (code === "ECONNABORTED" && message.includes("timeout")) {
      config.timeoutRetryCount = config.timeoutRetryCount || 0;

      // prettier-ignore
      // 如果重传次数已达上限，则返回错误信息
      if (config.timeoutRetryCount++ >= config.timeoutMaxRetry) {
        return copeWithErrorMsg(message, status);
      } else {
        // prettier-ignore
        // 设置请求间隔
        const backoff = new Promise((resolve) => {
          setTimeout(() => { 
            resolve();
          }, config.timeoutRetryInterval);
        });

        // 再次发送请求
        return backoff.then(() => {
          console.log("timeout resend", config.timeoutRetryCount, config.timeoutMaxRetry);
          return http(config);
        });
      }
    }

    const data = response.data;

    const isAvailableServerData = data && typeof data === "object" && data.code;

    // 如果响应的信息中包含 data，则返回该信息，不重传
    if (isAvailableServerData) {
      return Promise.reject({ message: response.data, status });
    }

    // prettier-ignore
    if (!isAvailableServerData && status) {
      if (status === 500 && code === "ERR_BAD_RESPONSE") {
        copeIfMsgNotRepeat.error("服务器开小猜了~");
      }
      // 身份过期
      if (status === 401) {
        // 防止一个页面导致多个 401 响应触发多个重复的 message 出现
        if (!isNotifyForExpire) {
          copeIfMsgNotRepeat.info("登录信息失效, 请重新登录");
          isNotifyForExpire = true;

          // 自动退出登录
          Store.dispatch("logout").then(() => {
            location.reload();
            isNotifyForExpire = false;
          });

          return Promise.reject(error);
        }
      }
    }

    if (!config || !config.timeoutRetryTimes) {
      return copeWithErrorMsg(message, status);
    }
  }
);

function copeWithErrorMsg(message, status) {
  if (message === "Network Error") {
    // 网络已断开
    const msg = "网络连接已断开，请检查网络";
    copeIfMsgNotRepeat.error(msg);
    return Promise.reject({ message: msg, status });
  } else if (message.includes("timeout")) {
    // 请求超时
    const msg = "请求超时";
    copeIfMsgNotRepeat.error(msg);
    return Promise.reject({ message: msg, status });
  } else {
    // 接口报错 => eg: 401, 500
    return Promise.reject({
      message: message ?? "出现错误，请稍后再试",
      status,
    });
  }
}

const copeIfMsgNotRepeat = {
  error(message) {
    if (msgCache.error !== message) {
      msgCache.error = message;
      Message.error(message).then(() => {
        this.flush(message, "error");
      });
    }
  },
  info(message) {
    if (msgCache.info !== message) {
      msgCache.info = message;
      Message.info(message).then(() => {
        this.flush(message, "info");
      });
    }
  },
  flush(message, type) {
    setTimeout(() => {
      if (msgCache[type] === message) {
        msgCache[type] = "";
      }
    }, 3000);
  },
};

export default http;
