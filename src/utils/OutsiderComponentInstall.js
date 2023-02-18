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
  Empty,
  Result,
  Modal,
  Form,
  Tabs,
  Divider,
  Popconfirm,
  Upload,
  Steps,
  Checkbox,
  Radio,
  message,
  InputNumber,
  DatePicker,
} from "ant-design-vue";

// prettier-ignore
Vue
  .use(Button).use(Popover).use(Input).use(Row).use(Col)
  .use(Select).use(Avatar).use(Badge).use(Modal).use(Form)
  .use(Spin).use(BackTop).use(Empty)
  .use(Result).use(Tabs).use(Divider).use(Popconfirm).use(Upload)
  .use(Steps).use(Checkbox).use(Radio).use(InputNumber).use(DatePicker)

message.config({
  top: "80px",
  maxCount: 3,
});

Vue.prototype.$message = message;

import { Skeleton as Ske, SkeletonItem } from "element-ui";
Vue.use(Ske).use(SkeletonItem);

//  注册 mavon-editor
import "mavon-editor/dist/css/index.css";
import MavonEditor from "mavon-editor";
Vue.use(MavonEditor);
