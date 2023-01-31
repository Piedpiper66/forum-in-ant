import { capitalize } from "../../utils/tool";

export default {
  data() {
    // const _this = this;

    return {
      themeConfig: {
        type: "theme",
        extraOpeList: [],
        title: "创建主题",
        getInitialValue() {
          return {
            title: void 0,
            categoryId: void 0,
            tags: [],
            content: "",
            markdown: "",
            contentImgReflect: {},
          };
        },
        params: null,
        mavonPlaceholder: "请输入主题内容 ...",
        submitButtonText: "创建主题",
        onSubmit: this.themeSubmit,
        canDirectlyCancel: true,
        safeCancelAndSubmitErrorTextFunc: this.themeDynamicCheck,
        // onCancelEdit: this.onCancelEdit,
        // this 指向 themeConfig
        clearParams() {
          this.params = this.getInitialValue();
        },
      },
      privateConfig: {
        type: "private",
        extraOpeList: [],
        title: "创建私信",
        getInitialValue() {
          return {
            to: [],
            title: void 0,
            content: "",
            markdown: "",
            contentImgReflect: {},
          };
        },
        params: null,
        mavonPlaceholder: "请输入私信内容 ...",
        submitButtonText: "创建私信",
        onSubmit: this.privateSubmit,
        canDirectlyCancel: true,
        safeCancelAndSubmitErrorTextFunc: this.privateDynamicCheck,
        // onCancelEdit: this.onCancelEdit,
        clearParams() {
          this.params = this.getInitialValue();
        },
      },
      replyToThemeConfig: {
        type: "replyToTheme",
        title: "回复主题",
        extraOpeList: [],
        getInitialValue() {
          return {
            title: "",
            themeId: "",
            content: "",
            markdown: "",
            categoryId: "",
            contentImgReflect: {},
          };
        },
        params: null,
        mavonPlaceholder: "请输入回复内容 ...",
        submitButtonText: "回复主题",
        onSubmit: this.replySubmit,
        canDirectlyCancel: true,
        safeCancelAndSubmitErrorTextFunc: this.replyDynamicCheck,
        clearParams() {
          this.params = this.getInitialValue();
        },
      },
      replyToUserConfig: {
        type: "replyToUser",
        title: "回复用户",
        extraOpeList: [],
        getInitialValue() {
          return {
            userId: -1,
            avatar: "",
            username: "",
            themeId: "",
            content: "",
            markdown: "",
            categoryId: "",
            contentImgReflect: {},
            floor: 0,
          };
        },
        params: null,
        mavonPlaceholder: "请输入回复内容 ...",
        submitButtonText: "回复该用户",
        onSubmit: this.replySubmit,
        canDirectlyCancel: true,
        safeCancelAndSubmitErrorTextFunc: this.replyDynamicCheck,
        clearParams() {
          this.params = this.getInitialValue();
        },
      },
    };
  },
  methods: {
    //  ------------------------------------ 主题 ----------------------------------- //
    // toPrivate(users) {
    //   // 在切换之前需要判断当前是否存在草稿，提示保存还是丢弃
    //   this.setStoreEditorType({ type: "private", extra: { to: users } });

    //   this.typeTogglePopupVisible = false;
    // },
    /**
     * 1位 title, 2位 tags, 3位 content
     */
    validCheckForTheme(...args) {
      const [title, categoryId, tags, content] = args;

      if (!title || !title.trim()) {
        this.submitErrorText = "标题不能为空或空串哦!";
        return false;
      }

      if (title.length < 5) {
        this.submitErrorText = "标题的长度不能小于 5 哦!";
        return false;
      }

      if (!categoryId) {
        this.submitErrorText = "必须要选择一个类别哦!";
        return false;
      }

      if (tags.length > 3) {
        this.submitErrorText = "最多只能选择 3 个标签哦!";
        return false;
      }

      if (content.length < 10) {
        this.submitErrorText = "主题内容长度不能少于10个字符哦!( 不包含空格 )";
        return false;
      }

      return true;
    },
    themeSubmit() {
      this.onSubmit({
        validator: this.validCheckForTheme.bind(
          this,
          ...["title", "categoryId", "tags", "content"].map(
            (v) => this.params[v]
          )
        ),
        api: "postTheme",
        params: this.params,
        isSuccess: (res) => res && res.status === "success",
      });
    },
    themeDynamicCheck({ title, categoryId, tags, content }) {
      const errText = this.submitErrorText;

      const safeCancel = !title && !categoryId && !tags.length && !content;

      const isValidParams =
        (errText.includes("标题") && title && title.length >= 5) ||
        (errText.includes("内容") && content && content.length >= 10) ||
        (errText.includes("标签") && tags.length <= 3);

      return { emptyError: isValidParams, safeCancel };
    },

    // ------------------------------------ 私信 -----------------------------------  //
    // toTheme() {
    //   this.setStoreEditorType({ type: "theme" });

    //   this.typeTogglePopupVisible = false;
    // },
    validCheckForPrivate([to, title, content]) {
      if (!to.length || to.length > 5) {
        this.submitErrorText = "用户数量在限制在 1- 5 个之间";
        return false;
      }

      if (!title || title.trim().length < 3) {
        this.submitErrorText = "简介长度不能小于3个字符哦!";
        return false;
      }

      if (content.length < 10) {
        this.submitErrorText = "内容长度不能小于10个字符哦!";
        return false;
      }

      return true;
    },
    privateDynamicCheck({ to, title, content }) {
      const errText = this.submitErrorText;

      const safeCancel = !to.length && !title && !content;

      const isValidParams =
        (errText.includes("私信") && to.length <= 5 && to.length) ||
        (errText.includes("简介") && title && title.length >= 3) ||
        (errText.includes("内容") && content.length >= 10);

      return { emptyError: isValidParams, safeCancel };
    },
    privateSubmit() {
      this.onSubmit({
        validator: this.validCheckForPrivate.bind(
          this,
          ["to", "title", "content"].map((v) => this.params[v])
        ),
        api: "postPrivate",
        params: this.params,
        isSuccess: (res) => res && res.status === "success",
      });
    },

    //  --------------------------------- 回复 `主题 ` 和 回复 ` 用户 ` 通用 -------------------------------- //
    replyDynamicCheck(params) {
      const { content } = params;

      const errText = this.submitErrorText;

      const safeCancel = !content;

      const isValidParams =
        errText.includes("内容") && content && content.length >= 10;

      return { emptyError: isValidParams, safeCancel };
    },
    replyValidCheck(content) {
      if (content.length < 10) {
        this.submitErrorText = "内容长度不能小于10个字符哦!";
        return false;
      }

      return true;
    },
    replySubmit() {
      const { type, params } = this.currentEditorConfig;

      this.onSubmit({
        validator: this.replyValidCheck.bind(this, params.content),
        api: `post${capitalize(type)}`,
        params: Object.assign(params, {
          topicId: params.themeId,
          date: Date.now(),
          to: {
            replyId: params._id,
            userId: params.userId,
            createTime: params.createTime,
          },
        }),
        isSuccess: (res) => res && res.status === "success",
      });
    },

    //  ----------------------------------- 通用 ------------------------------- //
    /**
     * @param { {
     *   validator: () => boolean
     *   api: string
     *   params: object
     *   isSuccess: () => boolean
     * } }
     */
    async onSubmit({ validator, api, params, isSuccess }) {
      const isValid = validator();

      if (isValid) {
        this.isSubmitting = true;

        const sendRes = await this.$api[api](params);

        setTimeout(() => {
          this.isSubmitting = false;

          this.isSuccessSubmit = isSuccess.call(this, sendRes);

          if (!this.isSuccessSubmit) {
            this.$message.error("发送失败，请重试");
          } else {
            this.$message.success("已发送!");

            this.removeLocalBase64();

            this.onCancelEdit(() => {
              this.currentEditorConfig.clearParams.call(
                this.currentEditorConfig,
                null
              );

              this.currentType = "theme";
            });
          }
        }, 500);
      }
    },
    async onCancelEdit(callback, noNeedClose) {
      const removeRes = await this.$api.removeDraft();

      if (removeRes === -1) {
        this.closeEditor(noNeedClose);

        await this.$nextTick();

        typeof callback === "function" && callback();

        this.isSuccessSubmit = false;
      } else {
        this.$message.error("重置失败，请重试");
      }
    },
    dealOpeList(type) {},
  },
};
