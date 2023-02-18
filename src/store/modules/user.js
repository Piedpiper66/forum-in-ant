import {
  Cookie,
  aesEncrypt as encrypt,
  detectBrowser,
  detectOS,
  aesEncrypt,
} from "../../utils/tool";
import {
  login as userLogin,
  logout as userLogout,
  register,
  sendOneCheckMail,
  sendActiveMail,
} from "../../api/auth";

const state = {
  token: "",
  isLogin: !!Cookie.get("FORUM_t"),
  userInfo: null,
  devId: Cookie.get("DEV_ID"),
  findQeoKey: "Q64BZ-WO4WX-4DR4T-ZIFAF-UEWM2-XRBOF",
};

import { Modal } from "ant-design-vue";

import router from "../../router";

import Bus from "../../utils/bus";

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token;
  },
  SET_ISLOGIN(state, status) {
    state.isLogin = status;
  },
  SET_USERINFO(state, userInfo) {
    state.userInfo = userInfo;
  },
  SET_USERAVATAR(state, src) {
    state.userInfo.avatar = src;
  },
  CLEAR_USERDRAFT(state) {
    if (state.userInfo) {
      state.userInfo.user_draft = null;
    }
  },
  SET_USERDRAFT(state, draft) {
    state.userInfo.user_draft = draft;
  },
  SET_DEVID(state) {
    state.devId = Cookie.get("DEV_ID");
    console.log("devId set", state.devId);
  },
};

const actions = {
  register: async (_, reigsterInfo) => {
    delete reigsterInfo.password2;

    const encrypted = encrypt(JSON.stringify(reigsterInfo));

    const { status, message } = await register(encrypted);

    return { success: status === 1, message };
  },
  login: async ({ commit, dispatch }, { userIdentity, password }) => {
    const device = await dispatch("getUserDevice");
    // prettier-ignore
    const { data: userInfo, message, code, status: ID, isActive } = await userLogin({
      userIdentity: userIdentity.trim(),
      password: encrypt(password),
      device,
    });

    // 登录异常，需要进行邮箱验证
    if (code === 403) {
      Modal.confirm({
        title: (h) =>
          h(
            "span",
            { class: "inline-block text-base font-bold text-gray-500" },
            message
          ),
        content: (h) =>
          h(
            "p",
            { class: "font-bold text-lg text-gray-600 text-center mt-6" },
            "由于您的登录信息异常，需要进行邮箱验证，是否继续？"
          ),
        zIndex: 2249,
        okText: "验证",
        cancelText: "取消",
        onOk() {
          return new Promise(async (resolve) => {
            const { status: checkMailStatus } = await sendOneCheckMail(
              {
                user: userIdentity,
              },
              true
            );
            if (checkMailStatus === 1) {
              // 此时 data 对应的时数据库中某字段的 id
              router
                .push({
                  name: "mailcheck",
                  query: {
                    c: ID,
                    redirect: "noRisk",
                    u: aesEncrypt(userIdentity),
                  },
                })
                .then(resolve);
            }
          });
        },
        onCancel() {
          // 不知是不是源码中的问题，当该 Modal 出现后，Login 的模态框会自动消失
          // 但 Login 的父元素的状态并没有因此改变，导致点击后无法控制显隐
          // 此时需要调用 Login 的 handleCancel 方法通知父元素更新状态
          Bus.$emit("closeLogin");
          commit("FLUSH_CANCELQUENE");
        },
      });

      return { message: null };
    } else if (typeof isActive === "boolean" && !isActive) {
      // 未激活
      Modal.confirm({
        title: (h) =>
          h(
            "span",
            { class: "inline-block text-base font-bold text-gray-500" },
            message
          ),
        content: (h) =>
          h(
            "p",
            { class: "font-bold text-lg text-gray-600 text-center mt-6" },
            "账号未激活，是否前去激活？"
          ),
        zIndex: 2499,
        okText: "去激活",
        cancelText: "取消",
        onOk() {
          return new Promise(async (resolve) => {
            const { status } = await sendActiveMail({
              identity: userIdentity,
            });
            if (status === 1) {
              // 此时 data 对应的时数据库中某字段的 id
              router
                .push({
                  name: "mailcheck",
                  query: {
                    u: aesEncrypt(userIdentity),
                  },
                })
                .then(resolve);
            } else {
            }
          });
        },
        onCancel() {
          Bus.$emit("closeLogin");
        },
      });

      return { message: null, isActive: false };
    }

    if (userInfo) {
      // 获取最新的 token
      const token = Cookie.get("FORUM_t");

      commit("SET_USERINFO", userInfo);
      commit("SET_TOKEN", token);
      commit("SET_ISLOGIN", true);
      commit("SET_DEVID");

      return { userInfo };
    } else {
      return { message };
    }
  },
  getUserDevice({ state }) {
    const script = document.createElement("script");
    // prettier-ignore
    script.onload = () => { document.body.removeChild(script) };

    return new Promise((resolve) => {
      let device = null;
      // 腾讯接口,使用的 JSONP 的方式
      window.QQmap = ({ status, result }) => {
        if (status === 0) {
          const { ad_info, ip } = result;

          const os = detectOS();
          const platform = detectBrowser();

          // prettier-ignore
          device = {
            ip, os, ...platform, date: Date.now(),
            geo: {
              country: ad_info.nation,
              province: ad_info.province,
              city: ad_info.city,
            }
          }
        }

        resolve(device);
      };

      script.src = `https://apis.map.qq.com/ws/location/v1/ip?key=${state.findQeoKey}&output=jsonp`;
      document.body.append(script);
    });
  },
  logout: async ({ commit, state }, info) => {
    const userId = state.userInfo.userId;

    const devId = Cookie.get("DEV_ID");

    // 删除账户不用退出登录
    if (!info?.isRemove) {
      await userLogout(userId, devId);
    }

    Cookie.remove("FORUM_t", "/");
    Cookie.remove("LOGIN_DATE", "/");
    Cookie.remove("DEV_ID", "/");

    commit("SET_USERINFO", null);
    commit("SET_TOKEN", "");
    commit("SET_ISLOGIN", false);

    return true;
  },
};

export default {
  namespace: true,
  state,
  mutations,
  actions,
};
