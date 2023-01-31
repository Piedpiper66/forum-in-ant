<template>
  <div class="main-h flex flex-col top-1/3">
    <section class="w-full mt-10">
      <a-steps :current="active" finish-status="success">
        <a-step title="确认邮箱" :status="step0"></a-step>
        <a-step title="验证你的账号" :status="step1"></a-step>
        <a-step title="重设密码" :status="step2"></a-step>
      </a-steps>
    </section>
    <section class="step-container flex justify-center px-1/8 mt-1/10">
      <transition name="slide-fade">
        <!-- 输入邮箱 -->
        <section v-if="active === 0">
          <h1>请输入你的邮箱</h1>
          <div class="h-10">
            <a-input v-model="initEmail" placeholder="example@xx.com"></a-input>
            <transition name="slide-fade">
              <div v-show="errorTip" class="mt-1 text-red-400 text-sm">
                {{ errorTip }}
              </div>
            </transition>
          </div>
          <a-button
            type="primary"
            @click="stepToNext(checkMailValid)"
            :loading="isChecking"
          >
            下一步
          </a-button>
        </section>
        <!-- 填写验证码 -->
        <section v-else-if="active === 1">
          <h1>验证码已发送至你的邮箱</h1>
          <div class="h-10">
            <a-input
              v-model="emailCaptcha"
              placeholder="请输入收到的验证码"
            ></a-input>
            <transition name="slide-fade">
              <div v-show="errorTip" class="mt-1 text-red-400 text-sm">
                {{ errorTip }}
              </div>
            </transition>
          </div>
          <div class="flex items-end space-x-3">
            <a-button
              type="primary"
              @click="stepToNext(checkCaptcha)"
              :loading="isChecking"
            >
              下一步
            </a-button>
            <transition name="fadeInOut">
              <span class="space-x-2" v-show="resendBtnShow">
                <Icon
                  v-show="isResending || isResendSuccess"
                  :name="!isResendSuccess ? 'loading' : 'correct'"
                  :spin="isResending && !isResendSuccess"
                />
                <span class="emphasis-text" @click="resendCheckMail"
                  >重新发送</span
                >
              </span>
            </transition>
          </div>
        </section>
        <!-- 重置验证码 -->
        <section v-else>
          <h1>重置你的密码</h1>
          <div>
            <a-form
              ref="form"
              :form="passResetForm"
              :label-col="{ span: 3 }"
              :wrapper-col="{ span: 21 }"
            >
              <a-form-item label="新的密码：">
                <a-input-password
                  v-decorator="[
                    'newPass',
                    {
                      rules: [
                        { require: true, validator: checkPwd, trigger: 'blur' },
                      ],
                    },
                  ]"
                  placeholder="8-16位由数字与字母组成"
                />
              </a-form-item>
              <a-form-item label="确认密码：">
                <a-input
                  v-decorator="[
                    'newPass2',
                    {
                      rules: [
                        {
                          require: true,
                          validator: reCheckPwd,
                          trigger: 'blur',
                        },
                      ],
                    },
                  ]"
                  type="password"
                  clearable
                ></a-input>
              </a-form-item>
              <a-form-item :wrapper-col="{ span: 21, offset: 3 }">
                <a-button
                  type="primary"
                  class="w-full tracking-wider"
                  @click="stepToNext(resetPwd)"
                  :loading="isChecking"
                >
                  <span style="font-size: 1rem"
                    >{{ !isResetSuccess ? "" : "已" }}重置</span
                  >
                </a-button>
              </a-form-item>
            </a-form>
          </div>
        </section>
      </transition>
    </section>
  </div>
</template>

<script>
import { aesEncrypt, aesDecrypt } from "../../utils/tool";

export default {
  name: "ForgetPwd",
  beforeRouteEnter(to, from, next) {
    // 如果没有验证邮箱正确后的 sessionid 则回到该页面的初始状态
    if (!sessionStorage.getItem("sessionid")) {
      next((vm) => {
        vm.active = 0;
      });
    } else {
      // 否则根据 sessionStorage 中的数据重新设置当前位置的各状态
      const currActive = sessionStorage.getItem("active");
      next((vm) => {
        vm.active = (currActive && +currActive) || 0;

        [0, 1, 2].forEach(
          (i) => (vm[`step${i}`] = sessionStorage.getItem(`step${i}`))
        );
      });
    }
  },
  data() {
    /**
     *  // passResetRules: {
      //   newPass: [{ required: true, validator: checkPwd }],
      //   newPass2: [{ required: true, validator: reCheckPwd }],
      // },*/
    return {
      active: 0,
      isChecking: false,
      // 输入邮箱
      step0: "process",
      initEmail: "",
      errorTip: "",
      // errorInvoke: false,
      // 输入验证码
      step1: "",
      emailCaptcha: "",
      resendBtnShow: false,
      isResending: false,
      isResendSuccess: false,
      // 输入新密码
      step2: "",
      passResetForm: this.$form.createForm(this),
      isResetSuccess: false,
    };
  },
  watch: {
    step0(newValue) {
      sessionStorage.setItem("step0", newValue);
    },
    step1(newValue) {
      sessionStorage.setItem("step1", newValue);
    },
    step2(newValue) {
      sessionStorage.setItem("step2", newValue);
    },
    active(newValue) {
      sessionStorage.setItem("active", newValue);
    },
  },
  destroyed() {
    sessionStorage.clear();
  },
  methods: {
    async stepToNext(callback) {
      const result = await callback();

      if (result) {
        this.errorTip = "";

        this[`step${this.active}`] = "finish";

        if (this.active <= 1) {
          this[`step${this.active + 1}`] = "process";

          this.active++;
        }

        this.errorTip = "";
      } else if (result === false) {
        this[`step${this.active}`] = "error";
      }

      this.isChecking = false;
    },
    // step 1
    async checkMailValid() {
      // prettier-ignore
      const mailReg = /^[A-Za-z0-9-._]+@[A-Za-z0-9-]+(.[A-Za-z0-9]+)*(.[A-Za-z]{2,6})$/;

      if (!this.initEmail) {
        // this.errorInvoke = true;

        this.errorTip = "邮箱不能为空";
      } else if (!mailReg.test(this.initEmail)) {
        // this.errorInvoke = true;

        this.errorTip = "请先确认邮箱格式是否正确";
      } else {
        this.isChecking = true;

        const mail = this.initEmail;

        // 邮箱是否存在
        const { data: sessionId, message: errorMsg } =
          await this.$api.checkSendMail(mail);

        if (sessionId) {
          sessionStorage.setItem("sessionid", sessionId);

          sessionStorage.setItem("userCheckingMail", aesEncrypt(mail));

          return true;
        } else {
          this.errorTip = errorMsg || "邮箱不存在";

          return false;
        }
      }
    },
    // step 2
    async checkCaptcha() {
      if (!this.emailCaptcha) {
        this.errorTip = "请输入验证码";

        return false;
      } else {
        this.isChecking = true;

        const decryptedMail = aesDecrypt(
          sessionStorage.getItem("userCheckingMail")
        );

        const { message: errorMsg, status } = await this.$api.checkMailCaptcha({
          captcha: this.emailCaptcha,
          email: decryptedMail,
          date: +new Date(),
        });

        if (!errorMsg) {
          return true;
        } else {
          this.errorTip = errorMsg;

          this.resendBtnShow = status === 3;

          return false;
        }
      }
    },
    async resendCheckMail() {
      const resendEmail = aesDecrypt(
        sessionStorage.getItem("userCheckingMail")
      );

      this.isResending = true;

      const { data: sessionId, message: errorMsg } =
        await this.$api.checkSendMail(resendEmail);

      if (errorMsg) {
        this.$message.error(errorMsg);
      } else {
        sessionStorage.setItem("sessionid", sessionId);

        this.isResetSuccess = true;
      }

      this.isResending = false;
    },
    // step 3
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
      // .getForm()
      const newPass = this.passResetForm.getFieldValue("newPass");

      if (!value) {
        callback(new Error("请再次输入密码"));
      } else if (value !== newPass) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    },
    async resetPwd() {
      this.passResetForm.validateFields(async (err, { newPass }) => {
        if (!err) {
          this.isChecking = true;

          const encryptPwd = aesEncrypt(newPass);

          const sessionid = sessionStorage.getItem("sessionid");

          const email = sessionStorage.getItem("userCheckingMail");

          this.isChecking = true;

          const { message: errorMsg } = await this.$api.resetPwd({
            password: encryptPwd,
            sessionid,
            email: aesDecrypt(email),
          });

          if (!errorMsg) {
            this.isResetSuccess = true;

            this.$message.success("修改成功");

            setTimeout(() => {
              this.$router.replace("/");

              this.$bus.$emit("showLoginModal");
            }, 1000);

            return true;
          } else {
            this.$message.error(errorMsg);

            return false;
          }
        }
      });
    },
  },
};
</script>

<style lang="postcss" scoped>
.step-container > section {
  @apply w-full space-y-8;

  h1 {
    @apply text-gray-600 text-2xl font-bold tracking-wider;
  }
}
</style>
