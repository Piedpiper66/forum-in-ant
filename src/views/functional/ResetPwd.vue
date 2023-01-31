<template>
  <div class="pt-30 main-h">
    <div
      v-if="!isSessionExpired"
      class="w-2/3 relative left-1/8 flex flex-col space-y-8"
    >
      <h1 class="text-3xl text-gray-700 tracking-wider font-bold">
        <span>重设你的密码</span>
      </h1>
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
    <div v-else>
      <a-result>
        <div slot="title" class="text-2xl text-gray-600">该链接已过期</div>
        <div slot="extra" class="text-gray-600">
          如果有需要, 请回到<b class="mx-2">账户页</b>重新发送邮件进行重置
        </div>
      </a-result>
    </div>
  </div>
</template>

<script>
import { checkIdValid } from "../../api/auth";
import { aesEncrypt } from "../../utils/tool";
import { message as Message } from "ant-design-vue";

export default {
  name: "ResetPwd",
  // async beforeRouteEnter(to, from, next) {
  //   const sessionid = to.params.id;

  //   if (!sessionid || sessionid.length !== 24) next("/");

  //   const { code, status, message } = await checkIdValid(
  //     +new Date(),
  //     sessionid
  //   );
  //   console.log(code, status, message);

  //   if (code === 200 && status === 0) {
  //     // 验证成功
  //     next();
  //   } else if (status === 1) {
  //     // 过期
  //     next((vm) => (vm.isSessionExpired = true));
  //   } else if (status === 3) {
  //     // 无权限
  //     Message.info("无权访问");

  //     next("/");
  //   } else {
  //     next("/");
  //   }
  // },
  data() {
    const checkPwd = (rule, value, callback) => {
      if (value === "") {
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
    };

    const reCheckPwd = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.pwdForm.newPassword) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };

    return {
      pwdForm: {
        newPassword: "",
        checkedPassword: "",
      },
      formRules: {
        newPassword: [{ required: true, validator: checkPwd, trigger: "blur" }],
        checkedPassword: [
          { required: true, validator: reCheckPwd, trigger: "change" },
        ],
      },
      isResetting: false,
      isResetSuccess: false,
      isSessionExpired: false,
      errorInvoke: false,
    };
  },
  methods: {
    sendReset() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.isResetting = true;
          const encryptPwd = encrypt(this.pwdForm.newPassword);
          const sessionid = this.$route.params.id;
          const { data } = await this.$api.resetPwd(
            encryptPwd,
            sessionid,
            this.$store.getters.userInfo.email
          );

          if (data.code === 200 && data.status === 0) {
            this.isResetSuccess = true;
            this.$store.dispatch("logout");
            setTimeout(() => {
              this.$router.replace("/");
              this.$store.commit("SET_SHOWLOGIN", true);
            }, 1000);
          } else {
            this.errorInvoke = true;
            this.$message({
              type: "error",
              message: "出了些小问题, 请稍后重试",
              center: true,
            });
            console.error(data);
          }
          this.isResetting = false;
        } else {
          this.$message({
            type: "warning",
            message: "请确认输入",
            center: true,
          });
          return false;
        }
      });
    },
  },
};
</script>
