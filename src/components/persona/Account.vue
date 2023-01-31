<template>
  <transition name="slide-fade" mode="out-in" tag="div">
    <div
      class="user_account w-full space-y-5"
      v-if="currView === 'account'"
      key="account"
    >
      <!-- 用户名 -->
      <section class="user_name">
        <h2>用户名</h2>
        <p class="text-gray-600 text-2xl font-thin">{{ userInfo.username }}</p>
      </section>

      <!-- 头像 -->
      <section>
        <h2>个人头像</h2>
        <div class="flex items-center space-x-5">
          <RaoImage
            :src="currUserAvatar"
            :size="100"
            class="h-full"
            avatar
          ></RaoImage>
          <div class="flex flex-col">
            <a-upload
              action="http://localhost:3000/common/u/uploadAvatar"
              :multiple="true"
              :withCredentials="true"
              name="image"
              :headers="{ Authorization: Cookie.get('FORUM_t') }"
              :beforeUpload="beforeAvatarUpload"
              :showUploadList="false"
              @change="onUploadChange"
            >
              <button
                type="submit"
                class="basic-btn bg-gray-300 hover:(bg-gray-500 text-white)"
              >
                <Icon name="upload" />上传
              </button>
            </a-upload>
            <p class="mt-2 mb-0 text-gray-400 text-xs">不用保存自动上传</p>
            <p
              class="mt-2 mb-0 text-red-400 text-sm font-bold"
              v-html="uploadErrorTip"
            ></p>
          </div>
        </div>
      </section>

      <!-- 名字 -->
      <section class="w-2/3 space-y-2">
        <h2>姓名</h2>
        <a-input v-model="profile.fullname" clearable></a-input>
        <p class="text-sm text-gray-400">你的真实姓名 (可选)</p>
      </section>

      <!-- 邮箱 -->
      <section class="cursor-default">
        <h2>个人邮箱</h2>
        <p class="flex items-center justify-between w-2/3">
          <span class="text-gray-600 text-base">{{ userInfo.email }}</span>
          <span
            class="basic-btn text-sm hover:(bg-gray-300)"
            @click="currView = 'email'"
          >
            <Icon name="edit" className="col-rotate" />
            更改邮箱
          </span>
        </p>
        <p class="text-sm mt-2 text-gray-400">你的邮箱不会被公开</p>
      </section>

      <!-- 密码 -->
      <section class="user_password">
        <h2>账号密码</h2>
        <div class="space-x-3 flex items-center">
          <div
            class="basic-btn bg-gray-300 hover:(bg-gray-500 text-white)"
            @click="resetPwdModalVisible = true"
          >
            <Icon name="mail" />
            <span class="text-base">重置密码</span>
          </div>
        </div>
      </section>
      <!--  @cancel="resetPwdModalVisible = false" -->
      <a-modal
        v-model="resetPwdModalVisible"
        :zIndex="2499"
        :keyboard="false"
        :maskClosable="false"
        :dialogStyle="{
          top: '25vh',
          minWidth: '430px',
        }"
        :footer="null"
      >
        <span
          slot="title"
          class="text-gray-600 tracking-wider text-lg font-bold"
        >
          更改密码
        </span>

        <a-form
          :form="resetPwdForm"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 18 }"
        >
          <a-form-item label="新密码">
            <a-input-password
              v-decorator="[
                'password',
                {
                  rules: [{ require: true, validator: checkPwd }],
                  validateTrigger: 'blur',
                },
              ]"
            />
          </a-form-item>
          <a-form-item label="确认密码">
            <a-input-password
              v-decorator="[
                'password2',
                {
                  rules: [{ require: true, validator: reCheckPwd }],
                  validateTrigger: 'blur',
                },
              ]"
              @pressEnter="onResetPwd"
            />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 18, offset: 4 }">
            <a-button
              type="primary"
              class="w-full"
              @click="onResetPwd"
              :loading="isResettingPwd"
            >
              重置密码
            </a-button>
          </a-form-item>
        </a-form>
      </a-modal>

      <!-- 使用的设备 -->
      <section>
        <h2>最近使用的设备</h2>
        <ul class="space-y-5 mt-3">
          <li
            v-for="(device, index) in userInfo.userLoginDevices"
            :key="index"
            class="flex items-center h-10 space-x-20"
          >
            <div class="flex items-center space-x-3">
              <Icon
                name="windows"
                width="2.5rem"
                height="2.5rem"
                className="text-cool-gray-500"
              />
              <span class="flex flex-col text-base">
                <span class="font-semibold space-x-2 text-gray-600">
                  <span>{{ device.os }}</span>
                  <span>{{ device.isMobile ? "移动端" : "PC端" }}</span>
                  <span>-</span>
                  <span :title="device.ip" class="text-gray-500">{{
                    device.geo.country + device.geo.province + device.geo.city
                  }}</span>
                </span>
                <span class="text-gray-400 space-x-2 flex ite ms-center">
                  <span v-text="device.browser"></span>
                  <span>|</span>
                  <span v-date.CN.live.suffix="device.date"></span>
                </span>
              </span>
            </div>
            <div class="text-green-400 cursor-pointer" title="退出该设备">
              <Icon name="logout" size="1rem" />
            </div>
          </li>
        </ul>
      </section>

      <!-- 保存 | 注销 -->
      <div class="ope-btn-group space-y-5 pt-3 text-base">
        <div
          class="basic-btn w-max bg-green-400 hover:bg-green-500 text-center text-white"
          @click="onSaveAccount"
        >
          <Icon v-show="isSaving" name="loading" spin />
          <span>保存更改</span>
        </div>
        <div
          class="basic-btn text-white bg-red-400 w-28 hover:(bg-red-600) space-x-2"
          @click="onRemoveAccount"
        >
          <Icon name="delete" />
          <span>注销账户</span>
        </div>
      </div>
    </div>

    <!-- 更换邮箱 -->
    <div
      v-else-if="currView === 'email'"
      class="space-y-8 w-full"
      ref="mail"
      v-cloak
      :key="switchCounter"
    >
      <b title="回到账户首页" @click="currView = 'account'" class="w-12">
        <Icon name="arrow-up" class="transform -rotate-90 cursor-pointer" />
      </b>
      <h1 class="font-bold text-xl text-gray-600 ml-8 mb-0">
        设置新的电子邮箱
      </h1>
      <section class="flex flex-col w-2/3">
        <div class="flex items-center w-full">
          <a-form
            :form="alterEmailForm"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            @submit="handleResetMail"
            class="w-full"
            ref="resetMail"
          >
            <!-- <span class="font-thin text-gray-500">Email：</span> -->
            <a-form-item
              label="新的邮箱"
              has-feedback
              :validate-status="emailCheckStatus"
            >
              <a-input
                v-decorator="[
                  'newEmail',
                  {
                    initialValue: void 0,
                    rules: [{ validator: emailValidator }],
                    validateTrigger: 'blur',
                  },
                ]"
                placeholder="xxx@xx.xx"
                :disabled="isSendSuccess && !shouldResend"
              ></a-input>
            </a-form-item>
            <a-form-item label="验证码" v-show="isSendSuccess">
              <a-input
                v-decorator="[
                  'captcha',
                  {
                    initialValue: void 0,
                    rules: [{ validator: captchaValidator }],
                    validateTrigger: 'blur',
                  },
                ]"
                placeholder="请输入你的邮箱"
              ></a-input>
            </a-form-item>
            <a-form-item
              :wrapperCol="{ span: 22, offset: 2 }"
              v-show="shouldResend"
            >
              <a-button
                type="link"
                ghost
                class="emphasis-text float-right"
                :class="[
                  shouldResend
                    ? '!text-gray-600'
                    : '!text-gray-400 cursor-not-allowed',
                ]"
                @click="sendCaptcha"
                :loading="isSendingMail"
              >
                重新发送
              </a-button>
            </a-form-item>
            <a-form-item :wrapperCol="{ span: 22, offset: 2 }">
              <a-button
                type="primary"
                class="w-full"
                :loading="isSendingMail"
                @click="handleResetMail"
                >{{ resetMailButtonText }}</a-button
              >
            </a-form-item>
          </a-form>
        </div>
      </section>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import store from "../../store";
import { aesEncrypt } from "../../utils/tool";
import { Modal } from "ant-design-vue";

export default {
  name: "Account",
  inject: ["appReload"],
  beforeRouteEnter(to, _, next) {
    const { username: gotoUser } = to.params;

    const { isLogin, username: loginUser } = store.getters;

    if (!isLogin || loginUser !== gotoUser) {
      next("/u/" + gotoUser);
    } else {
      next();
    }
  },
  data() {
    return {
      switchCounter: 0,
      userInfo: null,
      currUserAvatar: "",
      uploadErrorTip: "",
      // 这 a-upload 不行,
      hasAvatarUploaded: false,
      profile: {
        fullname: "",
      },
      currView: "account",
      // 重置的邮箱
      alteredMail: "",
      emailCheckStatus: "",
      alterEmailForm: this.$form.createForm(this),
      resetMailButtonText: "验证该邮箱",
      shouldResend: false,
      // 重新发送邮箱需要间隔 30 s
      nextSendDurantion: 30,
      isSendingMail: false,
      isSendSuccess: false,
      // 是否显示重新发送邮件需要的倒计时
      showCountdown: false,
      errorInvoke: false,
      // isResetPwsMailSend: false,
      isResetPwdError: false,
      // 重置密码的模态框的可见性
      resetPwdModalVisible: false,
      resetPwdForm: this.$form.createForm(this),
      // 是否正在更改密码
      isResettingPwd: false,
      removeModalVisible: false,
      isSaving: false,
      // 注销账户时的等待
      removeConfirmLoading: false,
      timer: null,
    };
  },
  computed: {
    ...mapGetters({
      storeUserInfo: "userInfo",
    }),
    originMail() {
      return this.userInfo.email;
    },
    isValidMailFormat() {
      const mailReg =
        /^[A-Za-z0-9-._]+@[A-Za-z0-9-]+(.[A-Za-z0-9]+)*(.[A-Za-z]{2,6})$/;
      return (
        this.alteredMail !== this.userInfo.email &&
        mailReg.test(this.alteredMail)
      );
    },
    // 更改邮箱的按钮是否能被点击
    canButtonAlter() {
      return (
        this.isValidMailFormat &&
        !(this.isSendingMail || this.isSendSuccess || this.showCountdown)
      );
    },
  },
  watch: {
    currView(curr, last) {
      // this.switchCounter++;
      if (curr === "newMail") {
        this.$nextTick(() => {
          setTimeout(() => {
            console.log(this.$refs.resetMail);
          });
        });
      }
    },
    storeUserInfo: {
      handler(info) {
        if (info) {
          this.userInfo = info;
        }
      },
      immediate: true,
    },
  },
  created() {
    this.currUserAvatar = this.userInfo.avatar;

    this.profile.fullname = this.userInfo.fullname;

    window.addEventListener("storage", async ({ key, newValue }) => {
      console.log(key, newValue);
      // 新开窗口重设密码，新窗口在完成重设密码后，通知当前窗口让该用户重新登陆
      if (key === "passResetStauts" && +newValue === 1) {
        await this.$store.dispatch("logout");

        await this.$router.push("/");

        this.$bus.$emit("showLoginModal");
      }
    });
  },
  methods: {
    beforeAvatarUpload(file) {
      this.hasAvatarUploaded = false;

      const fileType = file.type.split("/")[1];

      const validImageTypes = ["jpg", "jpeg", "png", "webp"];

      const isValidImage = validImageTypes.includes(fileType);

      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isValidImage) {
        this.uploadErrorTip = `图片类型只能是 <b>${validImageTypes.toString()}</b> 中的一种`;
      }

      if (!isLt2M) {
        const tip = "图片大小不能超过 2MB";
        this.uploadErrorTip ? (this.uploadErrorTip += tip) : tip;
      }

      return isValidImage && isLt2M;
    },
    // 上传中、完成、失败都会调用这个函数
    onUploadChange({ file }) {
      const { response } = file;

      if (!this.hasAvatarUploaded && response && response.code === 200) {
        this.uploadErrorTip = "";

        const src = response.data.src;

        this.currUserAvatar = src;

        this.$store.commit("SET_USERAVATAR", src);

        this.$bus.$emit("updateHeaderAvatar", src);

        this.hasAvatarUploaded = true;
      }
    },
    async onSaveAccount() {
      this.isSaving = true;

      await this.$api.resetFullname(this.profile.fullname);

      setTimeout(() => {
        location.reload();
      }, 500);
    },
    async emailValidator(_, email, callback) {
      const mailReg =
        /^[A-Za-z0-9-._]+@[A-Za-z0-9-]+(.[A-Za-z0-9]+)*(.[A-Za-z]{2,6})$/;

      let errorText = "";

      if (!email) {
        errorText = "邮箱不能为空";
      } else if (!mailReg.test(email)) {
        errorText = "邮箱格式不正确";
      } else if (this.userInfo.email === email) {
        errorText = "不能与原邮箱相同";
      } else {
        const { status } = await this.$api.checkmail(email);

        errorText = status ? "该邮箱已被注册" : undefined;
      }

      this.emailCheckStatus = errorText ? "error" : "success";

      callback(errorText);
    },
    captchaValidator(_, captcha, callback) {
      if (!this.isSendSuccess) {
        callback();
      } else {
        callback(captcha ? void 0 : "验证码不能为空");
      }
    },
    onResendCaptcha() {},
    async sendCaptcha() {
      this.shouldResend = false;

      this.isSendingMail = true;

      const newEmail = this.alterEmailForm.getFieldValue("newEmail");

      const { status, message } = await this.$api.createMailCaptcha(
        this.originMail,
        newEmail
      );

      this.isSendingMail = false;

      if (status === 1) {
        this.$message.success("已向该邮箱发送验证码");

        this.isSendSuccess = true;

        this.resetMailButtonText = "验证并更改邮箱";
      } else {
        this.$message.error(message);
      }
    },
    handleResetMail() {
      this.alterEmailForm.validateFields(
        async (error, { newEmail, captcha }) => {
          if (!error) {
            // 验证邮箱
            if (!this.isSendSuccess) {
              await this.sendCaptcha();
              // 验证 验证码
            } else {
              this.isSendingMail = true;

              const { status, message } = await this.$api.checkResetEmail({
                email: this.originMail,
                newEmail,
                captcha,
              });

              this.isSendingMail = false;

              // 验证并更改成功，重新登录
              if (status === 4) {
                this.$message.success("更改成功!");

                await this.$store.dispatch("logout");

                await this.$router.push("/");

                this.$bus.$emit("showLoginModal");

                // 验证码过期
              } else if (status === 3) {
                this.$message.warn("验证码已过期");

                this.shouldResend = true;
              } else {
                this.$message.error(message);
              }
            }
          }
        }
      );
    },
    checkPwd(_, value, callback) {
      if (!value) {
        callback(new Error("请输入密码"));
      } else if (value.length < 8 || value.length > 16) {
        callback(new Error("密码长度在8-16位之间"));
      } else if (!/[^\d]/.test(value)) {
        callback(new Error("密码过于简单, 请使用字母加数字的组合"));
      } else if (!/[^a-z]/.test(value)) {
        callback(new Error("请使用数字加字母的组合"));
      } else {
        callback();
      }
    },
    reCheckPwd(_, value, callback) {
      const newPass = this.resetPwdForm.getFieldValue("password");

      if (!value) {
        callback(new Error("请再次输入密码"));
      } else if (value !== newPass) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    },
    onResetPwd() {
      this.resetPwdForm.validateFields(async (err, { password }) => {
        if (!err) {
          this.isResettingPwd = true;

          const encryptPwd = aesEncrypt(password);

          const { status, message } = await this.$api.resetPwd({
            password: encryptPwd,
            email: this.originMail,
            noSession: true,
          });

          if (status === 0) {
            this.$message.success("重置成功");

            await this.$store.dispatch("logout");

            await this.$router.push("/");

            this.$bus.$emit("showLoginModal");
          } else {
            this.$message.error(message);
          }

          this.isResettingPwd = false;
        }
      });
    },
    onRemoveAccount() {
      // this.removeModalVisible = true;
      let countdown = 3;

      const _this = this;

      const confirmRef = Modal.confirm({
        icon: () => (
          <Icon name="errorTip" class="float-left mr-3 text-red-400" />
        ),
        title: <span class="text-gray-600 font-thin">确认</span>,
        zIndex: 2499,
        cancelText: "再想想",
        cancelButtonProps: {
          type: "danger",
        },
        okText: `(${countdown--}s) 确定注销`,
        okButtonProps: {
          props: {
            type: "danger",
            disabled: true,
          },
        },
        content: (
          <p class="font-extrabold text-gray-600 text-lg text-center mt-5">
            注销后内容将不再保留，确定删除？
          </p>
        ),
      });

      let timer = setInterval(() => {
        if (countdown >= 0) {
          confirmRef.update({
            okText: `(${countdown--}s) 确定注销`,
          });
        } else {
          clearInterval(timer);

          confirmRef.update({
            okText: "确定注销",
            okButtonProps: {
              props: {
                type: "danger",
                disabled: false,
              },
            },
            async onOk() {
              confirmRef.update({
                okButtonProps: {
                  props: {
                    type: "danger",
                    loading: true,
                  },
                },
              });

              const userId = _this.$store.getters.userId;

              const { status, message } = await _this.$api.removeAccount(
                userId
              );

              setTimeout(async () => {
                if (status === 1) {
                  _this.$message.success("注销成功");

                  await _this.$store.dispatch("logout", { isRemove: true });

                  _this.$router.replace("/");

                  return true;
                } else {
                  _this.$message.error(message);

                  confirmRef.update({
                    okButtonProps: {
                      props: {
                        type: "danger",
                        loading: false,
                      },
                    },
                  });
                }
              }, 500);
            },
          });
        }
      }, 1000);
    },
  },
};
</script>

<style lang="postcss" scoped>
[v-cloak] {
  display: none;
}

section {
  font-size: 1rem;
}

.user_account > section > h2 {
  @apply text-xl font-semibold tracking-wider mb-1.5 text-gray-600;
}

.user_account > section > p {
  @apply font-light;
}

.basic-btn {
  @apply px-2 py-1 rounded-sm flex items-center space-x-1
        transition-colors duration-300 cursor-pointer;
}
</style>
<style lang="postcss">
.remove-btn-bg {
  @apply bg-red-500 !important;
}

.cancel-btn-bg {
  @apply bg-gray-300 !important;
}
</style>
