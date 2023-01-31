<template>
  <a-modal
    :visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    :zIndex="2499"
    :keyboard="false"
    :dialogStyle="{
      top: '20vh',
      minWidth: '430px',
    }"
  >
    <span slot="title" class="text-gray-600 tracking-wider text-lg font-bold">
      注册
    </span>

    <a-form
      :form="registerForm"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 18 }"
      @submit="handleRegister"
    >
      <a-form-item label="邮箱" name="email">
        <a-input
          v-decorator="[
            'email',
            {
              rules: [
                {
                  required: true,
                  validator: checkMail,
                },
              ],
              validateTrigger: 'blur',
            },
          ]"
          placeholder="xxx@xx.xx"
        />
      </a-form-item>
      <a-form-item label="用户名">
        <a-input
          v-decorator="[
            'username',
            {
              rules: [{ required: true, validator: checkUsername }],
              validateTrigger: 'blur',
            },
          ]"
          placeholder="长度不能小于3个字符"
          loading
        />
      </a-form-item>
      <a-form-item label="姓名">
        <a-input
          v-decorator="[
            'fullname',
            {
              rules: [
                {
                  pattern: /\S{2,}/,
                  message: '长度不能小于2',
                  trigger: 'change',
                },
              ],
            },
          ]"
          placeholder="长度不能小于2个字符"
        />
      </a-form-item>
      <a-form-item label="密码">
        <a-input-password
          v-decorator="[
            'password',
            {
              rules: [{ required: true, validator: checkPwd, trigger: 'blur' }],
            },
          ]"
          placeholder="长度在8-16个字符之间，必须同时包含数字和字母"
        />
      </a-form-item>
      <a-form-item label="确认密码">
        <a-input
          type="password"
          v-decorator="[
            'password2',
            {
              rules: [
                { required: true, validator: reCheckPwd, trigger: 'blur' },
              ],
            },
          ]"
        />
      </a-form-item>
      <a-form-item @pressEnter="handleRegister"></a-form-item>
    </a-form>

    <div
      slot="footer"
      class="flex justify-end items-center space-x-3 mb-3 mr-5 select-none"
    >
      <span class="emphasis-text" @click="switchToLogin">去登录</span>
      <a-button type="primary" @click="handleRegister" :loading="isRegistering">
        创建账号
      </a-button>
    </div>
  </a-modal>
</template>

<script>
import { aesEncrypt } from "../../utils/tool";

export default {
  name: "Register",
  props: {
    registerVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      visible: false,
      registerForm: this.$form.createForm(this),
      isRegistering: false,
    };
  },
  watch: {
    registerVisible(status) {
      this.visible = status;
    },
  },
  methods: {
    handleOk() {
      this.visible = false;
      this.callForDialogToClose();
    },
    handleCancel() {
      this.visible = false;
      this.callForDialogToClose();
    },
    switchToLogin() {
      this.callForDialogToClose();

      this.$bus.$emit("showLoginModal");
    },
    callForDialogToClose() {
      this.$emit("switchToClose");
    },
    async checkMail(_, email, callback) {
      const mailReg =
        /^[A-Za-z0-9-._]+@[A-Za-z0-9-]+(.[A-Za-z0-9]+)*(.[A-Za-z]{2,6})$/;

      if (!email) {
        callback(new Error("请输入邮箱!"));
      } else if (!mailReg.test(email)) {
        callback("请检查邮箱格式是否正确");
      } else {
        const { status } = await this.$api.checkmail(email);

        // 1 => 存在
        callback(status ? "该邮箱已被注册" : undefined);
      }
    },
    async checkUsername(_, username, callback) {
      if (!username) {
        callback(new Error("请输入用户名!"));
      } else if (username.trim().length !== username.length) {
        callback("用户名不可包含空格");
      } else if (username.length < 6) {
        callback("用户名长度不可小于6");
      } else {
        const { status } = await this.$api.checkusername(username);

        // 1 => 存在
        callback(status ? "用户名已存在" : undefined);
      }
    },
    checkPwd(_, value, callback) {
      if (!value) {
        callback(new Error("请输入密码"));
      } else if (value.length < 8 || value.length > 16) {
        callback(new Error("密码长度在8-16位之间"));
      } else if (!/[^\d]/.test(value) || !/[^a-z]/.test(value)) {
        callback(new Error("请使用字母加数字的组合"));
      } else {
        callback();
      }
    },
    reCheckPwd(_, reconfirm, callback) {
      const password = this.registerForm.getFieldValue("password");

      if (!reconfirm) {
        callback(new Error("请再次输入密码"));
      } else if (reconfirm !== password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    },
    handleRegister() {
      this.registerForm.validateFields(async (err, values) => {
        if (!err) {
          this.isRegistering = true;

          const { success, message } = await this.$store.dispatch(
            "register",
            values
          );

          this.isRegistering = false;

          if (success) {
            this.callForDialogToClose();

            await this.$nextTick();

            this.registerForm.resetFields();

            this.$router.push({
              name: "mailcheck",
              query: { m: aesEncrypt(values.email) },
            });
          } else {
            this.$message.error(message || "未知错误");
          }
        }
      });
    },
  },
};
</script>
