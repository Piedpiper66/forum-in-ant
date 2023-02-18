<template>
  <transition name="slide-fade">
    <div v-show="isTransiOver" class="mail-check select-none">
      <template>
        <div class="main-h flex p-10 flex-col md:flex-row">
          <div
            class="w-90 items-center hidden md:flex select-none flex-shrink-0"
          >
            <img :src="waitingImg" :draggable="false" />
          </div>
          <div
            class="divider border-l mr-10 h-2/3 self-center hidden md:block"
          ></div>
          <div
            class="min-w-120 flex-1"
            :class="{ 'flex items-center justify-center': isCaptchaCorrect }"
          >
            <section class="flex flex-col py-20" v-if="!isCaptchaCorrect">
              <h1 class="font-bold text-2xl text-gray-500 mt-10">
                一封包含验证码的邮件已发送至你的邮箱 <br /><br />
              </h1>
              <!--  -->
              <div class="flex space-x-5 items-center mt-10">
                <h2 class="font-bold text-lg whitespace-nowrap text-gray-600">
                  验证码 :
                </h2>
                <a-input
                  v-model="captcha"
                  class="flex-1 transition-all duration-200"
                  ref="ipt"
                  allowClear
                >
                </a-input>
              </div>
              <p
                class="text-gray-400 text-sm font-thin mt-3 ml-21 tracking-wider clear-both"
              >
                <span class="float-left">
                  <transition name="fadeInOut">
                    <!-- 无错误显示验证码过期时间，有错误显示错误信息 -->
                    <span v-if="!errorMsg">{{ timeTip }}</span>
                    <span v-else class="text-red-400">{{ errorMsg }}</span>
                  </transition>
                </span>
                <transition name="fadeInOut">
                  <!-- 验证码过期，重新发送 -->
                  <span
                    class="float-right space-x-1 flex items-center"
                    v-show="responseType === 3"
                  >
                    <transition name="fadeInOut">
                      <Icon v-if="isResending" name="loading" spin />
                      <Icon
                        v-else-if="hasResended"
                        name="correct"
                        class="text-green-400"
                      />
                    </transition>
                    <span
                      @click="resendCaptcha"
                      :class="[resendCursor, resendDecration]"
                      >{{ resendText }}</span
                    >
                  </span>
                </transition>
              </p>
              <a-button
                type="primary"
                @click="checkEmail"
                :loading="isChecking"
                class="mt-5"
                :disabled="isResending"
              >
                {{ buttonText }}
              </a-button>
            </section>
            <transition name="slide-fade">
              <div
                v-if="isCaptchaCorrect"
                class="flex flex-col items-center justify-center"
              >
                <a-result
                  status="success"
                  title="验证成功"
                  :subTitle="successTitle"
                >
                </a-result>
                <p
                  v-show="isReset && isCaptchaCorrect"
                  class="my-2 text-green-400 font-thin"
                >
                  请重新登录
                </p>
                <p class="text-gray-600">
                  没反应 ? 点击
                  <router-link
                    class="text-green-400 hover:(underline underline-offset-2)"
                    to="/"
                    >这里</router-link
                  >
                  回到首页
                </p>
              </div>
            </transition>
          </div>
        </div>
      </template>
    </div>
  </transition>
</template>

<script>
import { aesDecrypt } from "../../utils/tool";

export default {
  name: "MailCheck",
  beforeRouteEnter(to, from, next) {
    const id = to.query.id;

    // next(id ? void 0 : "/");
    next();
  },
  data() {
    return {
      isTransiOver: false,
      successTitle: "",
      timer: null,
      currTime: 3,
      captcha: "",
      waitingImg: require("../../assets/img/wait.png"),
      timeTip: "验证码10分钟内有效, 请注意查收",
      isChecking: false,
      isChecked: false,
      isCaptchaCorrect: false,
      errorMsg: "",
      buttonText: "验证",
      isResending: false,
      hasResended: false,
      resendText: "重新发送",
      responseType: -1,
      redirect: "",
    };
  },
  computed: {
    user() {
      return atob(this.$route.params.u);
    },
    decryptedUser() {
      return aesDecrypt(this.$route.query.u);
    },
    isReset() {
      return this.$route.query.reset;
    },
    // userProp() {
    //   return /@/.test(this.user) ? "email" : "username";
    // },
    resendCursor() {
      return this.hasResended ? "cursor-not-allowed" : "cursor-pointer";
    },
    resendDecration() {
      return this.hasResended ? " text-green-400" : "emphasis-text";
    },
  },
  created() {
    this.redirect = this.$route.query.redirect || "";
  },
  mounted() {
    setTimeout(() => {
      this.isTransiOver = true;
    }, 150);

    this.iptFocus();
  },
  methods: {
    iptFocus() {
      this.$refs.ipt.$refs.input.focus();
    },
    countdown() {
      this.timer = setInterval(async () => {
        this.successTitle = this.currTime-- + "s 后跳转至首页";

        if (this.currTime < 0) {
          clearInterval(this.timer);

          await this.$router.replace("/");

          this.$bus.$emit("showLoginModal");
        }
      }, 1000);
    },
    async checkEmail() {
      if (this.captcha === "") {
        this.errorMsg = "验证码不能为空";
        return;
      }

      this.isChecking = true;

      const query = {
        captcha: this.captcha,
        // [this.userProp]: this.user,
        user: this.decryptedUser,
        date: Date.now(),
      };

      // if (this.isReset) {
      //   query.reset = true;

      //   query.newEmail = this.alteredMail;
      // }

      const { status, message: errorMsg } = await this.$api.checkMailCaptcha(
        query
      );
      // console.log("check data", data);

      this.isChecked = true;

      if (status === 4) {
        this.responseType = 4;

        setTimeout(async () => {
          this.isChecking = false;

          const { redirect } = this.$route.query;

          if (redirect) {
            await this.$router.replace({
              name: redirect,
              query: Object.assign(this.$route.query, { redirect: void 0 }),
            });

            return;
          }

          this.isCaptchaCorrect = true;

          await this.$nextTick();

          this.countdown();
        }, 500);

        // 如果是重置邮箱, 则退出登录
        // if (this.isReset) {
        //   await this.$store.dispatch("logout");
        // }

        // 验证码错误
      } else if (status === 2) {
        this.responseType = 2;

        this.errorMsg = errorMsg;

        this.buttonText = "重新验证";

        this.isChecking = false;

        // 验证码过期
      } else if (status === 3) {
        this.responseType = 3;

        this.resendText = "重新发送";

        this.errorMsg = errorMsg;

        this.isChecking = false;
      } else {
        this.responseType = -1;

        this.errorMsg = "网络错误";

        this.isChecking = false;
      }
    },
    async resendCaptcha() {
      this.isResending = true;

      const encryptMail = this.$route.query.m;

      const decryptedMail = aesDecrypt(encryptMail);

      const { status, message } = await this.$api.createMailCaptcha(
        decryptedMail
      );

      this.isResending = false;

      if (status === 1) {
        this.errorMsg = "";

        this.resendText = "已发送";

        this.hasResended = true;

        this.responseType = -1;

        this.captcha = "";

        this.iptFocus();
      } else {
        this.errorMsg = message;
      }
      // console.log(data);

      // if (!(data.code === 200 && data.status === 0)) {
      //   this.$message({
      //     type: "error",
      //     message: data.message || "服务器出错",
      //     center: true,
      //   });
      // } else {
      //   this.errorMsg = "";
      // }

      // this.isResending = false;
      // this.hasResended = true;
      // this.resendText = "已发送";
    },
  },
};
</script>

<style lang="postcss" scoped></style>
