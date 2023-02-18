<script>
export default {
  // beforeRouteEnter(to, from, next) {
  //   const { u_ide, c } = to.query;

  //   // const { code } = await this.$api...({ user: u_ide, id: c })
  //   nex``
  // },
  data() {
    return {
      isSuccess: false,
    };
  },
  async created() {
    const { c } = this.$route.query;

    const { data: userInfo } = await this.$api.copeWithNoRisk(c);

    if (userInfo) {
      this.$store.commit("SET_USERINFO", userInfo);
      this.$store.commit("SET_ISLOGIN", true);
      this.$store.commit("SET_DEVID");

      await this.$router.replace("/");

      this.$message.success("已登录!");
    }
  },
};
</script>

<template>
  <page-loading title="正在处理请稍后" :loading="!isSuccess"></page-loading>
</template>
