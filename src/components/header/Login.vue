<template>
  <a-modal
    :visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    :zIndex="2499"
    :keyboard="false"
    :maskClosable="false"
    :dialogStyle="{
      top: '15vh',
      minWidth: '430px',
    }"
  >
    <span slot="title" class="text-gray-600 tracking-wider text-lg font-bold">
      登录
    </span>

    <a-form
      :form="form"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 18 }"
      @submit="handleLogin"
    >
      <a-form-item label="账号">
        <a-input
          v-decorator="[
            'userIdentity',
            {
              rules: [{ required: true, message: '请输入您的账号!' }],
            },
          ]"
          placeholder="邮箱或用户名"
        />
      </a-form-item>
      <a-form-item label="密码">
        <a-input-password
          type="password"
          v-decorator="[
            'password',
            {
              rules: [{ required: true, message: '请输入密码!' }],
            },
          ]"
          @pressEnter="handleLogin"
        />
      </a-form-item>
    </a-form>
    <div>
      <span
        class="emphasis-text relative left-1/6 text-gray-400"
        @click="linkToResetpwd"
      >
        忘记密码
      </span>
    </div>

    <div
      slot="footer"
      class="flex justify-end items-center space-x-3 mb-3 mr-3 select-none"
    >
      <span class="emphasis-text" @click="switchToRegister">创建新账户</span>
      <a-button
        type="primary"
        icon="unlock"
        @click="handleLogin"
        :loading="isLoging"
      >
        登录
      </a-button>
    </div>
  </a-modal>
</template>

<script>
import { Modal } from "ant-design-vue";

export default {
  name: "Login",
  props: {
    loginVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      visible: false,
      ModalText: "Login",
      titleJSX: "",
      footerJSX: "",
      formLayout: "horizontal",
      form: this.$form.createForm(this, { name: "" }),
      isLoging: false,
    };
  },
  watch: {
    loginVisible(status) {
      this.visible = status;
    },
  },
  created() {
    this.$bus.$on("closeLogin", () => this.handleCancel());
  },
  methods: {
    handleLogin(e) {
      e.preventDefault();

      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.isLoging = true;

          const { message } = await this.$store.dispatch("login", values);

          setTimeout(() => {
            if (message) {
              this.$message.error(message);
              return false;
            } else {
              this.form.resetFields();
              this.handleOk();
            }

            this.isLoging = false;
          }, 100);
        }
      });
    },
    handleOk() {
      this.visible = false;
      this.callForDialogToClose();
    },
    handleCancel() {
      this.visible = false;
      this.callForDialogToClose();
    },
    linkToResetpwd() {
      if (this.$route.name === "forgetpwd") {
        this.callForDialogToClose();

        return false;
      }

      // const userIdentity = this.form.getForm().getFieldValue("userIdentity");

      this.$router.push({
        name: "forgetpwd",
      });

      this.callForDialogToClose();
    },
    switchToRegister() {
      this.callForDialogToClose();

      this.$bus.$emit("showRegisterModal");
    },
    callForDialogToClose() {
      this.$emit("switchToClose");
    },
  },
};
</script>
