import { Cookie, aesEncrypt as encrypt } from "../../utils/tool";
import {
  login as userLogin,
  logout as userLogout,
  register,
} from "../../api/auth";
const state = {
  token: "",
  isLogin: !!Cookie.get("FORUM_t"),
  userInfo: null,
};

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
};

const actions = {
  register: async (_, reigsterInfo) => {
    delete reigsterInfo.password2;

    const encrypted = encrypt(JSON.stringify(reigsterInfo));

    const { status, message } = await register(encrypted);

    return { success: status === 1, message };
  },
  login: async ({ commit }, loginInfo) => {
    const { data: userInfo, message } = await userLogin({
      userIdentity: loginInfo.userIdentity.trim(),
      password: encrypt(loginInfo.password),
    });

    if (typeof isActive === "boolean" && !isActive) {
      return { isActive };
    } else if (userInfo) {
      // 获取最新的 token
      const token = Cookie.get("FORUM_t");

      localStorage.setItem("forum_u_id", userInfo.userId);

      commit("SET_USERINFO", userInfo);
      commit("SET_TOKEN", token);
      commit("SET_ISLOGIN", true);

      return { userInfo };
    } else {
      return { message };
    }
  },
  logout: async ({ commit, state }, info) => {
    const local_id = +localStorage.getItem("forum_u_id");

    const store_u_id = state.userInfo.userId;

    if (info && !info.isRemove) {
      await userLogout(local_id || store_u_id);
    }

    commit("SET_USERINFO", null);
    commit("SET_TOKEN", "");
    commit("SET_ISLOGIN", false);

    Cookie.remove("FORUM_t", "/");
    Cookie.remove("LOGIN_DATE", "/");

    localStorage.removeItem("forum_u_id");
    localStorage.setItem("hasNotify", false);

    // window.pollUserPrivate 用于轮询用户是否有新的私信
    clearInterval(window.pollUserPrivateTimer);
  },
};

export default {
  namespace: true,
  state,
  mutations,
  actions,
};
