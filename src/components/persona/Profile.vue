<template>
  <div key="profile" id="profile" class="w-2/3">
    <a-form :model="profile" label-position="top">
      <a-form-item label="个性签名">
        <a-input v-model="profile.introduction"></a-input>
      </a-form-item>
      <a-form-item label="所在地">
        <a-input v-model="profile.location"></a-input>
      </a-form-item>
      <a-form-item label="个人网站">
        <a-input v-model="profile.website"></a-input>
      </a-form-item>
      <a-form-item label="个人信息头部背景">
        <div class="bg-rect rounded-md">
          <RaoImage :src="headerBg" class="w-full h-full" />
          <div
            class="absolute left-0 top-0 flex items-center p-2.5 space-x-2 text-sm w-auto"
          >
            <a-upload
              :showUploadList="false"
              :multiple="false"
              accept=".png,.jpg,.jpeg,.webp"
              :customRequest="headerBgChange"
            >
              <div class="img-upload">
                <Icon name="picture" size="1.08rem" />
              </div>
            </a-upload>
            <div
              class="img-delete"
              v-show="headerBg"
              @click="removeBg('header')"
            >
              <Icon name="delete" size="1.08rem" fill="#fff" />
            </div>
          </div>
        </div>
        <div class="upload-tip">头部背景将居中放置, 且默认宽度是 1110px</div>
      </a-form-item>
      <a-form-item label="用户卡片背景">
        <div class="bg-rect rounded-md">
          <RaoImage :src="cardBg" class="w-full h-full" />
          <div
            class="absolute left-0 top-0 flex items-center p-2.5 space-x-2 text-sm w-auto"
          >
            <a-upload
              :showUploadList="false"
              :multiple="false"
              accept=".png,.jpg,.jpeg,.webp"
              :customRequest="cardBgChange"
            >
              <div class="img-upload outline-none">
                <Icon name="picture" size="1.08rem" />
              </div>
            </a-upload>
            <div class="img-delete" v-show="cardBg" @click="removeBg('card')">
              <Icon name="delete" size="1.08rem" fill="#fff" />
            </div>
          </div>
        </div>
        <div class="upload-tip">背景图片将居中放置, 且默认宽度是 590px</div>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :loading="isSaving" @click="saveChange"
          >保存更改</a-button
        >
        <transition name="aFade">
          <span
            class="ml-3 space-x-1 font-thin text-gray-700"
            v-show="isSavingSuccess"
            ><Icon name="correct" class="font-bold" /><span>已保存</span></span
          >
        </transition>
      </a-form-item>
    </a-form>
  </div>
</template>
<script>
import DataLoading from "../universe/DataLoading.vue";

const formData = new FormData();

export default {
  components: { DataLoading },
  name: "Profile",
  inject: ["appReload"],
  data() {
    return {
      profile: {
        introduction: "",
        location: "",
        website: "",
      },
      headerBg: "",
      hasHeaderBg: false,
      cardBg: "",
      hasCardBg: false,
      isSaving: false,
      isSavingSuccess: false,
    };
  },
  computed: {
    userInfo() {
      return this.$store.getters.userInfo;
    },
  },
  created() {
    Object.keys(this.profile).forEach((key) => {
      this.profile[key] = this.userInfo[key] ?? "";
    });

    this.headerBg = this.userInfo.headerBg ?? "";

    this.cardBg = this.userInfo.cardBg ?? "";

    this.headerBg && (this.hasHeaderBg = true);

    this.cardBg && (this.hasCardBg = true);
  },
  methods: {
    checkImgValid(type) {
      const fileTypes = ["jpg", "jpeg", "png", "webp"];

      const typeList = type.split("/");

      const isImage = typeList[0] === "image";

      const isValidType = fileTypes.includes(typeList[1]);

      return isImage && isValidType;
    },
    headerBgChange({ file: raw }) {
      if (this.checkImgValid(raw.type)) {
        console.log(raw.size);
        formData.set("headerBg", raw);

        // 0 表示不删， 1 表示删除
        formData.set("headerRemove", 0);

        const imgURL = URL.createObjectURL(raw);

        this.headerBg = imgURL;

        // 同步更改 persona 中的头部图片进行预览
        this.$bus.$emit("updateHeaderBg", imgURL);
      }
    },
    cardBgChange({ file: raw }) {
      if (this.checkImgValid(raw.type)) {
        formData.set("cardBg", raw);

        formData.set("cardRemove", 0);

        this.cardBg = URL.createObjectURL(raw);
      }
    },
    removeBg(type) {
      if (type === "header") {
        this.headerBg = "";

        this.hasHeaderBg && formData.set("headerRemove", 1);

        this.$bus.$emit("updateHeaderBg", "");
      } else if (type === "card") {
        this.cardBg = "";

        this.hasCardBg && formData.set("cardRemove", 1);
      }
    },
    mdTextChange(_, html) {
      this.profile.introduction = html;
    },
    async saveChange() {
      this.isSaving = true;

      Object.keys(this.profile).forEach((key) => {
        formData.set(key, this.profile[key]);
      });

      await this.$api.updateProfile(formData);

      setTimeout(() => {
        this.isSaving = false;

        this.isSavingSuccess = true;

        setTimeout(() => {
          this.isSavingSuccess = false;

          location.reload();
        }, 500);
      }, 500);

      // formData = new FormData();

      // ["headerBg", "cardBg", "headerRemove", "cardRemove"].forEach((key) => {
      //   formData.delete(key);
      // });
    },
  },
};
</script>

<style lang="postcss">
#profile >>> .ant-form-item-label > label {
  @apply text-xl font-bold text-gray-600;
}

.bg-rect {
  /* width: 400px; */
  width: 65%;
  height: 180px;
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
}

.img-upload {
  @apply bg-gray-100 transition-colors duration-200 px-2 py-1
   flex text-gray-500 cursor-pointer
  hover:(bg-gray-400 text-white);
}

.img-delete {
  @apply bg-red-400 flex items-center px-2 py-1
  cursor-pointer transition-colors duration-200
  hover:(bg-red-500);
}

.upload-tip {
  @apply text-sm text-gray-400 font-thin tracking-wider;
}
</style>
