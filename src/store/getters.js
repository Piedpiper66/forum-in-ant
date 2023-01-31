const userGetters = {
  userDraft: (state) => state.user?.userInfo?.user_draft,
  headerInfo: (state) => state.app?.headerInfo,
  isLogin: (state) => state.user.isLogin,
  userInfo: (state) => state.user.userInfo,
  userId: (state) => state.user.userInfo?.userId,
  username: (state) => state.user.userInfo?.username,
};

const appGetters = {
  editorShow: (state) => state.app.editorShow,
  color: (state) => state.app.typeColor,
  routeMap: (state) => state.app.routeMap,
  titleMap: (state) => state.app.titleMap,
  categories: (state) => state.app.categories,
  editorType: (state) => state.app.editorType,
  unfinishedEdit: (state) => state.app.unfinishedEdit,
  assistModalStatus: (state) => state.app.assistModalStatus,
};

export default { ...userGetters, ...appGetters };
