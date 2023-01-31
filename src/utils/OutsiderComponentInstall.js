import Vue from "vue";
import {
  Button,
  Popover,
  Input,
  Row,
  Col,
  Select,
  Avatar,
  Badge,
  Spin,
  BackTop,
  Alert,
  message,
  Empty,
  Result,
  Modal,
  Form,
  Tabs,
  Divider,
  Popconfirm,
  Upload,
  Steps,
} from "ant-design-vue";

import { Skeleton as Ske, SkeletonItem } from "element-ui";

//  注册 mavon-editor
import mavonEditor from "mavon-editor";
import "mavon-editor/dist/css/index.css";

// prettier-ignore
Vue
  .use(Button).use(Popover).use(Input).use(Row).use(Col)
  .use(Select).use(Avatar).use(Badge).use(Modal).use(Form)
  .use(Spin).use(BackTop).use(Alert).use(message).use(Empty)
  .use(Result).use(Tabs).use(Divider).use(Popconfirm).use(Upload)
  .use(Steps)

message.config({
  duration: 2.5,
  top: "80px",
  maxCount: 3,
});

Vue.prototype.$message = message;

Vue.use(Ske).use(SkeletonItem);

Vue.use(mavonEditor);
