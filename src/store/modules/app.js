const state = {
  headerInfo: null,
  categories: [],
  showLogin: false,
  // 用于首页按钮与编辑器之间显隐数据的同步
  editorShow: false,
  // 关闭编辑器之后是否是否已存在编辑的内容
  unfinishedEdit: false,
  // 用于在主题详情页点击回复后更改编辑器的类型
  // replyToTheme | replyToUser
  editorType: null,
  // 在打开编辑器之前用于提示用于还未完成的编辑
  assistModalStatus: null,
  // 用于存放取消请求的队列
  cancelRequestQuene: [],
};

const mutations = {
  SET_CATEGORY(state, categories) {
    state.categories = categories;
  },
  SET_EDITORSHOW(state, status) {
    state.editorShow = status;
  },
  SET_UNFINISHEDEDIT(state, status) {
    state.unfinishedEdit = status;
  },
  SET_EDITORTYPE(state, typeInfo) {
    state.editorType = typeInfo;
  },
  SET_SHOWASSISTMODAL(state, status) {
    state.assistModalStatus = status;
  },
  ADD_CANCELREQUEST(state, cancelFn) {
    cancelFn && state.cancelRequestQuene.push(cancelFn);
  },
  FLUSH_CANCELQUENE(state) {
    state.cancelRequestQuene.forEach((c) => c());
    state.cancelRequestQuene = [];
  },
};

const actions = {
  // 用于控制编辑器显隐，和打开之前对草稿的控制
  /**
   * @param { {
   *  status: boolean,
   *  type: "theme" | "private" | "replyToTheme" | "replyToUser"
   *  info: object,
   * } | false } payload
   */
  setEditorStatus(
    { state: { editorType, editorShow, unfinishedEdit }, commit },
    payload
  ) {
    // 只是单纯关闭或打开
    if (typeof payload === "boolean") {
      commit("SET_EDITORSHOW", payload);

      return false;
    }

    const { show, type: gotoType, info: gotoInfo } = payload;

    // 初始 editorType 为 null
    if (editorType) {
      const { type: oldType, info: oldInfo } = editorType;

      // 在网站点击按钮不会出现 extra, extra 是在保存草稿时加上的
      const gotoId = gotoInfo._id;

      // 而 oldId 可能是草稿
      const oldId = oldInfo._id || oldInfo.extra?._id;

      let privateDifferent = false;

      // 如果是私信，则要比较字段 to: array
      if (gotoType === "private" && oldType === "private") {
        const gotoTo = gotoInfo.to;

        const oldTo = oldInfo.to;

        if (gotoTo.length !== oldTo.length) privateDifferent = true;
        else {
          privateDifferent = gotoTo.some(({ value }) =>
            oldTo.find((item) => item.value !== value)
          );
        }
      }

      /**
       *  1. 如果打开之前存在草稿( 即 unfinishedEdit 为 false )，判断是否为同一个回复
       *    1.1 是否为同一类型
       *    1.2 类型相同，是否 _id 相同
       *  2. 都不同则弹出 Modal
       *    2.1 Modal 中的逻辑都是相同的，交由 Editor 自身处理
       */
      // prettier-ignore
      const isDifferentType = gotoType !== oldType || privateDifferent || gotoId !== oldId;

      // 如果是同一操作，则直接控制显隐即可
      if (!isDifferentType) {
        commit("SET_EDITORSHOW", !editorShow);

        return false;
      }

      // 如果是不同类型，但是当前无草稿，则可以直接切换至对应类型
      if (isDifferentType && !unfinishedEdit) {
        // 如果当前编辑器已经打开，则不用关闭，直接切换视图
        commit("SET_EDITORSHOW", true);
        commit("SET_EDITORTYPE", { type: gotoType, info: gotoInfo });

        return false;
      }

      // 不同类型，有草稿，则显示提示 Modal
      if (isDifferentType && unfinishedEdit) {
        // 在 edtior.vue 中监听 showassistmodal 的值
        commit("SET_SHOWASSISTMODAL", {
          show: true,
          payload,
        });
      }
    } else {
      commit("SET_EDITORSHOW", show);

      commit("SET_EDITORTYPE", { type: gotoType, info: gotoInfo });
    }
  },
};

export default {
  namespace: true,
  state,
  mutations,
  actions,
};
