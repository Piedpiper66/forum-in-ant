import Vue from "vue";
import VueRouter from "vue-router";
import Store from "../store";

Vue.use(VueRouter);

// IndexPages
import HomePage from "../views/Home";
import Overview from "../pages/homepage/Overview";

const routes = [
  // 首页
  {
    path: "/",
    component: HomePage,
    name: "首页",
    redirect: "/overview",
    alias: "/root", // alias 别名，将不同路径映射至同一个视图中
    children: [
      {
        path: "overview",
        name: "overview",
        meta: { title: "概览" },
        component: Overview,
      },
      {
        // 仅类目变更
        path: "/c/:category/:type?",
        name: "cateOnly",
        meta: { title: "分类" },
        component: () =>
          import(
            /* webpackChunkName: "data-list" */ "../pages/homepage/DataList"
          ),
      },
      {
        // 仅标签变更
        path: "/tag/:tagname/:type?",
        name: "tagOnly",
        meta: { title: "分类" },
        component: () =>
          import(
            /* webpackChunkName: "data-list" */ "../pages/homepage/DataList"
          ),
      },
      {
        // 类目和标签都变更
        path: "/tag/c/:category/:tagname/:type?",
        name: "fullQuery",
        meta: { title: "分类" },
        component: () =>
          import(
            /* webpackChunkName: "data-list" */ "../pages/homepage/DataList"
          ),
      },
      {
        // 点击不同的首页导航按钮触发 ( latest | recent | hot )
        path: "/type/:type",
        name: "typeOnly",
        meta: { title: "分类" },
        component: () =>
          import(
            /* webpackChunkName: "data-list" */ "../pages/homepage/DataList"
          ),
      },
    ],
  },
  {
    path: "/t/:themeId",
    name: "theme",
    meta: { title: "主题详情" },
    component: () =>
      import(/* webpackChunkName: "theme" */ "../views/ThemeDetail"),
  },
  {
    path: "/u/:username",
    component: () =>
      import(/* webpackChunkName: "persona" */ "../views/Persona"),
    name: "persona",
    redirect: "/u/:username/summary",
    children: [
      {
        path: "summary",
        meta: { title: "用户信息概览" },
        component: () =>
          import(/* webpackChunkName: "persona" */ "../pages/persona/Summary"),
        name: "summary",
      },
      {
        path: "activity",
        meta: { title: "用户活动信息" },
        component: () =>
          import(/* webpackChunkName: "persona" */ "../pages/persona/Activity"),
        name: "activity",
        redirect: "/u/:username/activity/all",
        children: [
          {
            path: ":type",
            component: () =>
              import(
                /* webpackChunkName: "persona" */ "../components/persona/ActivityList"
              ),
            name: "activityList",
          },
        ],
      },
      {
        path: "message",
        name: "message",
        component: () =>
          import(/* webpackChunkName: "persona" */ "../pages/persona/Message"),
        redirect: "/u/:username/message/send",
        children: [
          {
            path: ":type",
            name: "messageList",
            meta: { title: "私信" },
            beforeEnter: toPersonaIfNotLogin,
            component: () =>
              import(
                /* webpackChunkName: "persona" */ "../components/persona/MessageList"
              ),
          },
        ],
      },
      {
        path: "preference",
        name: "preference",
        component: () =>
          import(
            /* webpackChunkName: "persona" */ "../pages/persona/Preference"
          ),
        redirect: "/u/:username/preferences/account",
        children: [
          {
            path: "account",
            name: "account",
            meta: { title: "账户" },
            beforeEnter: toPersonaIfNotLogin,
            component: () =>
              import(
                /* webpackChunkName: "persona" */ "../components/persona/Account"
              ),
          },
          {
            path: "profile",
            name: "profile",
            meta: { title: "个人信息" },
            beforeEnter: toPersonaIfNotLogin,
            component: () =>
              import(
                /* webpackChunkName: "persona" */ "../components/persona/Profile"
              ),
          },
        ],
      },
    ],
  },
  {
    path: "/private-msg/:type",
    component: () =>
      import(/* webpackChunkName: "functional" */ "../views/PrivateMsg"),
    name: "privateMsg",
    meta: { title: "私信" },
  },
  {
    path: "/search",
    component: () =>
      import(
        /* webpackChunkName: "functional" */ "../views/functional/AdvancedSearch"
      ),
    name: "search",
    meta: { title: "搜索" },
  },
  {
    path: "/forget-pwd",
    component: () =>
      import(
        /* webpackChunkName: "functional" */ "../views/functional/ForgetPwd"
      ),
    name: "forgetpwd",
    meta: { title: "忘记密码" },
  },
  {
    path: "/reset-pwd",
    component: () =>
      import(
        /* webpackChunkName: "functional" */ "../views/functional/ResetPwd"
      ),
    name: "resetpwd",
    meta: { title: "重置密码" },
  },
  {
    path: "/mail-check",
    component: () =>
      import(
        /* webpackChunkName: "functional" */ "../views/functional/MailCheck"
      ),
    name: "mailcheck",
    meta: { title: "邮箱验证" },
  },
  {
    path: "/no-risk",
    name: "noRisk",
    component: () =>
      import(/* webpackChunkName: "functional" */ "../views/functional/NoRisk"),
    meta: { title: "安全验证" },
  },
  {
    path: "/type/*",
    redirect: "/type/latest",
  },
  {
    path: "*",
    redirect: "/",
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
  scrollBehavior() {
    return { x: 0, y: 0, behavior: "smooth" };
  },
});

router.beforeEach((to, _, next) => {
  document.title = "Rao Forum:  " + to.meta.title;
  next();
});

export default router;

function toPersonaIfNotLogin(to, _, next) {
  const isLogin = Store.getters.isLogin;

  const nextPath = isLogin ? void 0 : `/u/${to.params.username}/summary`;

  next(nextPath);
}
