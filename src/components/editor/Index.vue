<template>
  <div
    id="editor"
    ref="editor"
    class="fixed bottom-0 flex justify-center w-full transform transition-transform duration-600 z-1102"
    :class="[visible ? 'translate-y-0' : 'translate-y-full']"
  >
    <div class="w-full md:(w-4/5) lg:w-2/3">
      <!-- 改变编辑器高度的控制条 -->
      <div
        class="grippie"
        ref="grippie"
        @mousedown="onGrippleMousedown"
        @mouseup="onGrippleMouseup"
      ></div>

      <!-- 实际的编辑区域 -->
      <div
        class="bg-white p-3 shadow-lg flex flex-col space-y-2.5"
        ref="editSection"
      >
        <!-- 各种选择框 -->
        <!--  --------------- 第一行 -----------------
            1. 更多操作按钮
            2. 按钮的提示文字
            3. 当前编辑器类型的提示文字
            4. 全屏
            5. 关闭编辑器
        -------------------------------------------- -->
        <div
          class="first-line select-none relative flex justify-between items-center"
          ref="firstLine"
        >
          <!-- 左边的按钮 -->
          <a-popover
            :visible="typeTogglePopupVisible"
            placement="bottomLeft"
            trigger="click"
            :overlayStyle="{ zIndex: 1501 }"
            :getPopupContainer="() => $refs.firstLine"
            @click.stop="typeTogglePopupVisible = !typeTogglePopupVisible"
          >
            <!-- prettier-ignore -->
            <Icon
              name="plus"
              size="1.75rem"
              class="outline-none px-0.5 py-1 border rounded-md mr-2
              cursor-pointer hover:(bg-gray-300 text-white) transition-colors duration-200"
            />
            <transition name="slide-fade" mode="out-in">
              <span
                v-if="currentType === 'replyToTheme'"
                @click.stop="onReplyToThemeLinkToTheme"
                class="text-green-400 cursor-pointer inline-block h-[1.75rem] leading-[1.75rem] whitespace-nowrap w-auto"
              >
                {{ params.title }}
              </span>
              <span
                v-else-if="currentType === 'replyToUser'"
                class="space-x-1"
                @click.stop
              >
                <a-avatar
                  v-show="params.avatar"
                  :src="params.avatar"
                  size="small"
                ></a-avatar>
                <strong class="text-gray-700">
                  {{ params.username }}
                </strong>
                <span class="text-gray-400 ml-2">
                  {{ `#${params.floor}楼` }}
                </span>
                <span
                  @click.self="onReplyToUserLinkToReply(params)"
                  class="hover:text-green-400 transition-colors duration-300 cursor-pointer"
                >
                  跳转至该回复
                </span>
              </span>
            </transition>

            <!-- 弹框 -->
            <ul
              slot="content"
              class="text-gray-500 rounded-md cursor-pointer select-none bg-white"
            >
              <li
                class="flex items-center px-3 py-2 transition-colors duration-400 space-x-2 hover:bg-green-100"
                data-type="private"
                v-for="item in currentEditorConfig.extraOpeList"
                :key="item.type"
                @click="item.onClick"
              >
                <Icon :name="item.icon"></Icon>
                <span class="text-base" v-html="item.title"></span>
              </li>
            </ul>
          </a-popover>

          <!-- 当前编辑的类型 ===> 创建主题 | 回复他人 -->
          <div
            class="absolute left-1/2 transform -translate-x-1/2 text-base font-semibold"
            v-show="isThemeOrPrivate"
          >
            {{ currentEditorConfig.title }}
          </div>

          <div class="space-x-3 text-gray-500">
            <!-- 最小化编辑器 -->
            <span title="最小化" @click="closeEditor(false)">
              <Icon
                name="arrow-up"
                class="transform rotate-180 cursor-pointer"
              />
            </span>
          </div>
        </div>

        <!-- 第二行 和 第三行 ，三个输入框 -->
        <!-- v-if="!currentType.includes('reply')" -->
        <div
          ref="selectArea"
          class="flex flex-col space-y-2"
          v-show="isThemeOrPrivate"
        >
          <template v-if="currentType === 'theme'">
            <!-- 标题 -->
            <a-input
              placeholder="输入一个标题, 或者粘贴一个链接"
              v-model="params.title"
            ></a-input>

            <!-- 类别 和 标签 -->
            <div class="w-full flex space-x-3">
              <a-select
                class="flex-1"
                placeholder="主题类别"
                allowClear
                v-model="params.categoryId"
                @change="onCategoryChange"
              >
                <a-select-option
                  v-for="item in categories"
                  :key="item.alias"
                  :value="item._id"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
              <a-select
                class="flex-1"
                placeholder="主题标签"
                mode="multiple"
                v-model="params.tags"
              >
                <a-select-option v-for="tag in tagList" :key="tag" :value="tag">
                  {{ tag }}
                </a-select-option>
              </a-select>
            </div>
          </template>
          <template v-else-if="currentType === 'private'">
            <a-select
              mode="multiple"
              v-model="params.to"
              label-in-value
              placeholder="搜索并选择用户"
              :filter-option="false"
              :not-found-content="
                isFetchingUser ? undefined : searchUserNotfoundMsg
              "
              @search="(username) => throttle(fetchUser, 300, true)(username)"
              @change="() => (searchUsers = [])"
              option-label-prop="label"
            >
              <a-spin
                v-if="isFetchingUser"
                slot="notFoundContent"
                size="small"
              />
              <a-select-option
                v-for="user in searchUsers"
                :key="user.userId"
                :value="user.userId"
                :label="user.fullname"
              >
                <div class="flex space-x-3 items-center">
                  <a-avatar :src="user.avatar" role="img"></a-avatar>
                  <span>{{ user.username }}</span>
                </div>
              </a-select-option>
            </a-select>
            <a-input
              placeholder="用简短的一句话概括你的内容"
              v-model="params.title"
            ></a-input>
          </template>
        </div>

        <!-- 编辑器 -->
        <mavon-editor
          :toolbars="mavonOptions"
          codeStyle="atom-one-dark"
          :placeholder="currentEditorConfig.mavonPlaceholder"
          ref="markdown"
          class="flex-1"
          v-model="params.content"
          :imageFilter="editorValidateImage"
          @fullScreen="setEditorToFullScreen"
          @change="handleEditorTextChange"
          @imgAdd="$imgAdd"
          @imgDel="$imgDel"
        ></mavon-editor>

        <!-- 提交按钮等 -->
        <div
          class="end-line mb-3 flex items-center space-x-3 select-none"
          ref="endLine"
        >
          <!-- prettier-ignore -->
          <button
            class="inline-flex items-center px-2 py-1 rounded-sm 
            bg-green-400 text-white text-base space-x-2 outline-none
            hover:bg-green-500 transition-colors duration-200"
            @click="currentEditorConfig.onSubmit"
          >
            <Icon :name="submitIconName" size="1.15rem" :spin="isSubmitting" />
            <span>{{ currentEditorConfig.submitButtonText }}</span>
          </button>
          <a-popconfirm
            title="确定关闭并清空编辑器 ?"
            placement="rightBottom"
            cancelText="再想想"
            okText="确定"
            :disabled="currentEditorConfig.canDirectlyCancel"
            @confirm="
              onCancelEdit(
                currentEditorConfig.clearParams.call(currentEditorConfig)
              )
            "
            :getPopupContainer="() => $refs.endLine"
          >
            <span
              class="emphasis-text"
              title="关闭并清空"
              v-show="!isSubmitting"
              @click="
                () => currentEditorConfig.canDirectlyCancel && closeEditor()
              "
            >
              取消
            </span>
          </a-popconfirm>
          <transition name="slide-fade">
            <span
              v-show="submitErrorText"
              class="inline-flex items-center space-x-1 text-red-500"
            >
              <Icon name="errorTip" size="1rem" />
              <span class="font-bold text-sm">{{ submitErrorText }}</span>
            </span>
          </transition>
          <transition name="slide-fade">
            <Icon
              v-show="isDraftSaving"
              name="loading"
              spin
              className="text-gray-500"
            />
          </transition>
        </div>
      </div>
    </div>

    <!-- 用于对打开编辑器之前的拦截 -->
    <a-modal
      :visible="assistModalVisible"
      :zIndex="2499"
      :closable="false"
      :keyboard="false"
      :maskClosable="false"
      :dialogStyle="{
        top: '30vh',
      }"
    >
      <span slot="title" class="text-gray-600 tracking-wider text-lg font-bold">
        确认
      </span>

      <!-- prettier-ignore -->
      <div
        class="text-lg w-full text-gray-500 text-center"
      >
        当前存在您<strong>
          <template v-if="isThemeOrPrivate">
            {{ currentEditorConfig.title }}
          </template>
          <!-- replyToTheme -->
          <template v-else-if="currentType === 'replyToTheme'">
            回复标题为 "{{params.title }}" 的主题
          </template>
          <template v-else>
            回复用户 <a-avatar :src="params.avatar"></a-avatar> {{params.username}}
          </template>
        </strong>的草稿，您打算如何处理？
      </div>

      <div slot="footer" class="w-full flex justify-center space-x-5 mb-6">
        <a-button @click="onAssistModalCancel">继续编辑</a-button>
        <a-button
          type="primary"
          @click="onAssistModalConfirm"
          :loading="assistModalLoading"
          >丢弃草稿</a-button
        >
      </div>
    </a-modal>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import mavonOptions from "./markdownOption";
import editorConfig from "./mixin";
import { imgUrlToFile } from "../../utils/tool";

// 浏览器内容区高度
const winHeight = window.innerHeight;

// 编辑器的限高
const editorMaxHeight = winHeight - 74;

// 编辑器的最低高度
let editorMinHeight = 500;

let selectAreaTall = 0;

export default {
  name: "Editor",
  mixins: [editorConfig],
  data() {
    return {
      // 是否已经经过 mounted 阶段，防止 saveDraft 时的误保存
      isInited: false,
      // mavon-editor 配置项
      mavonOptions: Object.freeze(mavonOptions),
      visible: false,
      // 用于在开启之前的拦截
      openConfirm: false,
      currentEditorConfig: null,
      // 标志是主题 、私信、还是回复
      currentType: "theme",
      // typePopup 的功能列表
      currentTypePopList: [],
      typeTogglePopupVisible: false,
      categoryList: [],
      tagList: [],
      // 私信中搜索匹配的用户列表
      searchUsers: [],
      // 是否正在搜索用户
      isFetchingUser: false,
      // 未搜索到用户时的提示信息,
      searchUserNotfoundMsg: "",
      // 底部取消按钮点击之后是否可以直接关闭编辑框，默认可以，以为没数据
      canDirectlyCancel: true,
      submitErrorText: "",
      isSubmitting: false,
      isSuccessSubmit: false,
      // 是否正在保存草稿
      isDraftSaving: false,
      // 草稿是否保存成功
      isDraftSuccessSaved: false,
      // 用于辅助确认信息 Modal 的显影
      assistModalVisible: false,
      // 辅助 Modal 的确认和取消的回调
      onAssistModalConfirm: () => {},
      onAssistModalCancel: () => {},
      // 辅助 Modal 的 loading 状态
      assistModalLoading: false,
      assistModalOkText: "",
      assistModalCancelText: "",
      // 是否正在转换图片
      isTransferringImg: false,
      // 图片Url是否已经从 base64 转换为 link
      isImgUrlTransfer: false,
    };
  },
  computed: {
    ...mapGetters([
      "isLogin",
      "editorShow",
      "categories",
      "userInfo",
      "editorType",
      "assistModalStatus",
    ]),
    submitIconName() {
      return this.isSubmitting
        ? "loading"
        : this.isSuccessSubmit
        ? "correct"
        : "plus";
    },
    isThemeOrPrivate() {
      return !this.currentType.includes("reply");
    },
    params() {
      return this.currentEditorConfig.params;
    },
  },
  watch: {
    "$route.fullPath"() {
      this.editorShow && this.$store.dispatch("setEditorStatus", false);
    },
    editorShow(status) {
      this.visible = status;
    },
    // 控制对 setEditorType 进行拦截，弹出 assistModal
    assistModalStatus(status) {
      if (status) {
        const { show, payload } = status;

        if (show) {
          this.assistModalVisible = true;

          this.onAssistModalConfirm = () => {
            this.assistModalLoading = true;

            this.onCancelEdit(() => {
              setTimeout(async () => {
                this.assistModalVisible = false;

                this.assistModalLoading = false;

                // 先让模态框不可见，再更改 params, 要不然模态框中的信息变更会被看见影响体验
                await this.$nextTick();

                this.currentEditorConfig.clearParams.call(
                  this.currentEditorConfig,
                  null
                );

                this.$store.commit("SET_EDITORTYPE", payload);

                // 类型更改完毕之后再显示
                await this.$nextTick();

                this.$store.commit("SET_EDITORSHOW", true);
              }, 500);
            });
          };

          this.onAssistModalCancel = () => {
            this.assistModalVisible = false;

            this.$store.commit("SET_EDITORSHOW", true);
          };

          this.$store.commit("SET_SHOWASSISTMODAL", null);
        }
      }
    },
    currentType: {
      handler(type) {
        const config = this[`${type}Config`];

        this.currentEditorConfig = config;

        config.params = config.getInitialValue();
      },
      immediate: true,
    },
    categories(value) {
      this.tagList = [
        ...new Set(value.reduce((curr, { tags }) => curr.concat(tags), [])),
      ];
    },
    // 动态处理编辑时的错误提示，同时保存当前草稿
    "currentEditorConfig.params": {
      handler(current, pre) {
        const { type } = this.currentEditorConfig;

        // 如果仅是修改对象的值，而不是重置该对象，则 value === pre，指向相同的对象
        const { emptyError, safeCancel } =
          this.currentEditorConfig.safeCancelAndSubmitErrorTextFunc(current);

        emptyError && (this.submitErrorText = "");

        this.currentEditorConfig.canDirectlyCancel = safeCancel;

        // 如果有草稿，则 Home 的打开编辑器的 button 应该立即修改状态
        this.$store.commit("SET_UNFINISHEDEDIT", !safeCancel);

        // 防止不同类型之间切换时，即使未编辑也触发保存草稿的操作
        // 可见、不整体为空、两者为同一类型( 不同表示在切换 ) 则保存
        if (this.visible && Object.is(current, pre)) {
          safeCancel
            ? this.$api.removeDraft()
            : this.throttle(this.saveDraft, 1500)(current, type);
        }
      },
      deep: true,
    },
    "userInfo.user_draft": async function (draft) {
      if (draft) {
        const type = draft.sort;

        this.currentType = type;

        this.$store.commit("SET_EDITORTYPE", {
          type,
          info: { ...draft },
        });
      }
    },
    // 来自 reply 组件创建回复请求
    editorType: async function (value) {
      if (value) {
        const { type, info } = value;

        this.currentType = type;

        // 在 nextTick 后重新赋值，因为 currentEditorConfig 还未变更;
        await this.$nextTick();

        let combineInfo = null;

        let opeList = null;

        // 修改编辑器的初始状态
        if (type === "theme") {
          const {
            title,
            category,
            tags,
            content,
            markdown,
            contentImgReflect,
          } = info;

          // mongodb 的假值默认为 null, 而 null 在 select 或 input 中不会显示 placeholder
          // 需要修改 null 为 undefined
          combineInfo = {
            title: title || void 0,
            categoryId: category ? category.id : void 0,
            tags,
            content: content || void 0,
            markdown,
            contentImgReflect,
          };

          opeList = ["private"];
        } else if (type === "private") {
          const { to, title, content, markdown, contentImgReflect } = info;

          combineInfo = {
            to,
            title,
            content,
            markdown,
            contentImgReflect,
          };

          opeList = ["theme"];
        } else if (type.includes("reply")) {
          const {
            to,
            extra,
            content,
            username,
            userId,
            avatar,
            _id,
            themeId,
            markdown,
            contentImgReflect,
            floor,
            title,
            categoryId,
            createTime,
          } = info;

          const fixedUsername = username || to?.username,
            fixedUserId = userId || to?.userId,
            fixedAvatar = avatar || to?.avatar,
            fixedThemeId = themeId || extra?.themeId,
            fixedId = _id || extra?._id,
            fixedReflect = contentImgReflect || {};

          combineInfo = {
            username: fixedUsername,
            userId: fixedUserId,
            avatar: fixedAvatar,
            content,
            themeId: fixedThemeId,
            _id: fixedId,
            markdown,
            contentImgReflect: fixedReflect,
            title,
            categoryId,
            createTime,
          };

          const isToUser = type === "replyToUser";

          isToUser && (combineInfo.floor = floor || extra?.floor);

          // 处理 opeList
          /**
           * 处理 opeList
           * 1. 如果是私信或主题，直接相互切换
           * 2. 如果是回复主题
           *    2.1 创建一个新的主题
           *    2.2 创建一个回复该主题创建者的私信
           * 3. 如果是回复用户
           *    3.1 创建一个新的主题
           *    3.2 给该用户回复私信
           *    3.3 回复该主题而非该用户
           */
          opeList = isToUser
            ? ["theme", "private", "replyToTheme"]
            : ["theme", "private"];
        }

        // 这里给 combineInfo deepClone以下是因为 params 会被 vue 处理为响应式对象，
        // 导致切换后的 combineInfo 信息未变更
        Object.assign(this.currentEditorConfig, {
          params: Object.assign(this.params, combineInfo),
          extraOpeList: this.generateOpeListItems(opeList, combineInfo),
        });

        let imgReflect = combineInfo.contentImgReflect;

        let reflectKeys = [];

        // 处理 contentImgReflect, 给编辑器重新添加图片列表
        if (imgReflect && (reflectKeys = Object.keys(imgReflect)).length) {
          reflectKeys.forEach(async (key) => {
            const [originName, convertName] = key.split("|");

            const src = combineInfo.contentImgReflect[key];

            const base64 = localStorage.getItem(originName);

            const createdFile = await imgUrlToFile(
              base64,
              convertName,
              originName,
              src
            );

            const mdRef = this.$refs.markdown;

            // 若要成功删除，需要两个参数：1. 文件中需要 _name 属性, 2. src
            mdRef.$refs.toolbar_left.$imgAddByFilename(src, createdFile);
          });
        }
        /**
         *  之前由于 Object.assign 的第一个参数为 `this.currentEditorConfig.params`
         *  而 Vue 只对第一层的数据做出响应，导致 params 对象数据变了，视图没变
         *  这里通过强制刷新组件自身来让视图做出更新，也可以通过过 $set 重新赋值
         * */
        // this.$forceUpdate();

        // editorMinHeight = this.isThemeOrPrivate ? 500 : 412;
      }
    },
  },
  created() {
    // 初始化
    this.$store.dispatch("setEditorStatus", {
      show: false,
      type: "theme",
      info: this.themeConfig.getInitialValue(),
    });
  },
  mounted() {
    const editSection = this.$refs.editSection;

    editSection.style.height = editorMinHeight + "px";
    editSection.style.maxHeight = editorMinHeight + "px";
  },
  methods: {
    // ------------------------------ 编辑器的显隐和伸缩 start ----------------------------- //
    // 鼠标按下
    onGrippleMousedown() {
      window.addEventListener("mousemove", this.mousemoveFuncWrapper);

      window.addEventListener("mouseup", this.onGrippleMouseup);

      document.documentElement.classList.add("select-none");
    },
    // 移动的中间函数，用户清除事件函数
    mousemoveFuncWrapper(e) {
      return this.throttle(this.handleGripplemove, 5, true)(e);
    },
    // 移动控制函数
    handleGripplemove({ y }) {
      const editSection = this.$refs.editSection;

      const currEditorHeight = winHeight - y;

      if (
        currEditorHeight &&
        (currEditorHeight > editorMaxHeight ||
          currEditorHeight < editorMinHeight)
      )
        return false;

      requestAnimationFrame(() => {
        // maxHeight 用于限制内容超出当前高度时自动拓展高度
        editSection.style.maxHeight = currEditorHeight + "px";
        // height 用于调节高度
        editSection.style.height = currEditorHeight + "px";
      });
    },
    // 鼠标抬起
    onGrippleMouseup() {
      window.removeEventListener("mousemove", this.mousemoveFuncWrapper);

      window.removeEventListener("mouseup", this.onGrippleMouseup);

      document.documentElement.classList.remove("select-none");
    },
    setEditorToFullScreen() {
      const editorEl = this.$refs.editSection;

      editorEl.classList.toggle("resize-to-screen");
    },
    closeEditor(noNeedClose) {
      this.submitErrorText = "";

      // 成功发送之后，需要让首页的 `继续编辑` 按钮转换回 `创建新...`
      if (this.isSuccessSubmit) {
        this.currentEditorConfig.canDirectlyCancel = true;
      }

      this.$store.commit(
        "SET_UNFINISHEDEDIT",
        !this.currentEditorConfig.canDirectlyCancel
      );

      this.typeTogglePopupVisible = false;

      !noNeedClose && this.$store.dispatch("setEditorStatus", false);
    },
    // ----------------------------- 编辑器的显隐和伸缩 end ----------------------------- //

    // ----------------------------- 编辑时的 functions ------------------------------- //
    onCategoryChange(value) {
      console.log("cate change");
      value && (this.currentEditorConfig.params.tags = []);

      if (!value) {
        this.tagList = [
          ...new Set(
            this.categories.reduce((curr, { tags }) => curr.concat(tags), [])
          ),
        ];
      } else {
        const { tags } = this.categories.find(({ _id }) => _id === value);

        this.tagList = tags;
      }
    },
    /**
     * @param { "theme" | "reply" | "private" } sort
     */
    async saveDraft(draft, sort = "theme") {
      if (this.isSubmitting) return false;

      this.isDraftSaving = true;

      let to = null;

      let extra = null;

      let saveRes = null;

      const { params } = this.currentEditorConfig;

      // console.log(params.markdown);

      if (sort === "replyToUser") {
        const { username, userId, avatar, _id, themeId, floor } = params;

        to = {
          to: { username, userId, avatar },
          extra: { _id, themeId, floor },
        };
      } else if (sort === "replyToTheme") {
        const { themeId, _id } = params;

        extra = { extra: { themeId, _id } };
      }

      // 直接修改 draft 会触发重新 saveDraft
      const draftCopy = Object.assign({}, draft, to, extra);

      // 需要把属性值位 undefined 的改为 "", 否则在传输时会被忽略
      Object.keys(draftCopy).forEach((key) => {
        if (draftCopy[key] === undefined) draftCopy[key] = "";
      });

      const now = +new Date();

      const postData = {
        sort,
        date: now,
        ...draftCopy,
      };

      saveRes = await this.$api.saveDraft(postData);

      if (saveRes === -1) {
        setTimeout(() => {
          this.isDraftSaving = false;
        }, 600);
      }
    },
    async fetchUser(username) {
      if (!username) return false;

      this.isFetchingUser = true;

      const searchRes = await this.$api.searchUser(username);

      if (searchRes && !searchRes.length) {
        this.searchUserNotfoundMsg = `未搜索到包含关键字 ${username} 的用户`;
      } else if (!searchRes) {
        this.searchUserNotfoundMsg = "获取用户列表异常";
      } else {
        this.searchUserNotfoundMsg = null;
      }

      setTimeout(() => {
        this.searchUsers = searchRes || [];

        this.isFetchingUser = false;
      }, 500);
    },
    // 在回复主题时，点击 title的回调
    onReplyToThemeLinkToTheme() {
      const { themeId } = this.$route.params;

      const paramThemeId = this.currentEditorConfig.params.themeId;

      if (themeId === paramThemeId) return false;

      this.currentEditorConfig.canDirectlyCancel && this.closeEditor();

      this.$router.push({ name: "theme", params: { themeId: paramThemeId } });
    },
    // 在回复用户时，点击跳转的回调
    onReplyToUserLinkToReply({ themeId, _id }) {
      const { themeId: currentThemeId } = this.$route.params;

      if (currentThemeId === themeId) {
        this.$bus.$emit("moveToRef", _id);
      } else {
        this.$router.push({
          name: "theme",
          params: { themeId },
          query: { rId: _id },
        });
      }

      this.$store.commit("SET_EDITORSHOW", false);
    },
    editorValidateImage({ type, size }) {
      const validTypes = ["jpg", "jpeg", "png", "webp"];

      // image/png => png
      type = type.split("/")[1];

      const isValidType = validTypes.includes(type);

      const validSize = 2; // 2MB

      const isValidSize = size / 1024 / 1024 <= validSize;

      if (!isValidType) {
        this.$message.warn(`图片类型只能是: ${validTypes.toString()} 中的一种`);

        return false;
      }

      if (!isValidSize) {
        this.$message.warn(`图片大小最多为 ${validSize}MB`);

        return false;
      }

      return true;
    },
    handleEditorTextChange(_, markdown) {
      if (!this.isTransferringImg) {
        this.params.markdown = markdown;

        this.isTransferringImg = false;
      }
    },
    /**
     * @param { number } index 当前添加的图片为第几个图片
     * @param { File } file 所添加的图片
     */
    async $imgAdd(index, file) {
      this.isTransferringImg = true;

      const mdRef = this.$refs.markdown;

      const formData = new FormData();

      formData.append("image", file);

      const { src, filename } = await this.$api.postImg(formData);

      mdRef.$img2Url(index, src);

      // 将后端转换后的文件名存储到该文件对象上
      // 当该图片需要被删除时使用
      file._filename = filename;

      this.$set(this.params.contentImgReflect, `${file.name}|${filename}`, src);

      this.isTransferringImg = false;

      // 让视图更新，防止阻塞刷新
      await this.$nextTick();

      // file为File类型文件, 将文件转换为 base64 存储在本地，刷新后可继续使用
      // 同时生成一个文件名列表，在文件不再使用后一并删除
      const reader = new FileReader();

      reader.onload = () => {
        localStorage.setItem(file.name, reader.result);
      };

      reader.readAsDataURL(file);

      let imgNameList = localStorage.getItem("imgNameList");

      if (imgNameList && imgNameList !== "[]") {
        const opeList = JSON.parse(imgNameList);

        opeList.push(file.name);

        localStorage.setItem("imgNameList", JSON.stringify(opeList));
      } else {
        localStorage.setItem("imgNameList", JSON.stringify([file.name]));
      }
    },
    async $imgDel([_, file]) {
      // 从 toolbar 中删除图片
      const { _filename, name } = file;

      const result = await this.$api.removeImg(_filename);

      if (!result) {
        this.$message.error("删除失败!");
      } else {
        this.$delete(this.params.contentImgReflect, `${name}|${_filename}`);

        this.removeLocalBase64(name);
      }
    },

    // ----------------------- 纯纯工具 ----------------------- //
    setStoreEditorType(type, params) {
      this.typeTogglePopupVisible = false;

      // console.log(type, params, this[`${type}Config`].params);

      this.$store.dispatch("setEditorStatus", {
        type,
        info: Object.assign(this[`${type}Config`].getInitialValue(), params),
      });
    },
    isSameObject(a, b) {
      if (!(a && b)) return false;

      const keyA = Object.keys(a);
      const keyB = Object.keys(b);

      const isSameLen = keyA.length === keyB.length;

      if (!isSameLen) return false;

      const isSameKeysAndValue = keyA.every((key) => {
        return keyB.includes(key) && a[key] === b[key];
      });

      return isSameKeysAndValue;
    },
    /**
     * @param { [] } items
     */
    generateOpeListItems(items, params) {
      if (Array.isArray(items)) {
        let opeItems = [];

        items.forEach((itemName) => {
          switch (itemName) {
            case "theme":
              opeItems.push({
                type: "theme",
                icon: "theme",
                title: "创建一个新主题",
                onClick: this.setStoreEditorType.bind(this, "theme", null),
              });
              return;
            case "private":
              const { username, userId } = params;

              opeItems.push({
                type: "private",
                icon: "mail",
                title: !username
                  ? "创建一个新私信"
                  : `给用户 <strong>${username}</strong> 回复私信`,
                onClick: this.setStoreEditorType.bind(
                  this,
                  "private",
                  Object.assign(params, {
                    to: username ? [{ key: userId, label: username }] : [],
                  })
                ),
              });

              return;
            case "replyToTheme":
              const { title } = params;

              opeItems.push({
                type: "replyToTheme",
                icon: "reply",
                title: `回复主题 <strong>${title.slice(0, 5) + "..."}</strong>`,
                onClick: this.setStoreEditorType.bind(this, itemName, params),
              });

              return;
            default:
              return;
          }
        });

        return opeItems;
      }
    },
    /**
     * @param { string } imgName 需要指定删除的图片名
     * @param { boolean } removeSelf 是否删除 `imgNameList`
     */
    removeLocalBase64(imgName) {
      const key = "imgNameList";

      const localImgNameList = localStorage.getItem(key);

      const opeList = JSON.parse(localImgNameList ?? "[]");

      if (opeList.length) {
        // 没传图片说明全删
        if (!imgName) {
          opeList.forEach((localImgName) => {
            localStorage.removeItem(localImgName);
          });

          localStorage.removeItem(key);
        } else {
          const targetIndex = opeList.indexOf(imgName);

          opeList.splice(targetIndex, 1);

          localStorage.setItem(key, JSON.stringify(opeList));

          localStorage.removeItem(imgName);
        }
      }
    },
  },
};
</script>

<style lang="postcss">
#editor {
  .grippie {
    cursor: row-resize;
    border-radius: 0.375rem 0.375rem 0 0;
    padding: 4px 0;

    @apply h-3 bg-green-400;
  }

  .grippie::after {
    content: "";
    display: block;
    width: 27px;
    margin: auto;
    border-top: 3px double #fff;
  }

  .first-line {
    .ant-popover-arrow {
      display: none !important;
    }

    .ant-popover {
      top: 25px !important;
    }
  }

  .end-line .ant-popover {
    z-index: 2203 !important;

    .ant-popover-inner-content {
      padding: 0.5rem;
    }
  }

  .resize-to-screen {
    height: 100vh !important;
    max-height: 100vh !important;
    width: 100vw !important;
  }
}
</style>
