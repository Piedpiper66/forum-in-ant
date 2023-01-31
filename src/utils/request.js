import Axios from "axios";
import { Cookie } from "./tool";

const http = Axios.create({
  baseURL: process.env.VUE_APP_URL,
  withCredentials: true,
  timeout: 5000,
  timeoutErrorMessage: "网络出了些小问题",
});

http.interceptors.request.use(
  (config) => {
    config.headers.Authorization = Cookie.get("FORUM_t");

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  ({ data, status }) => {
    return { data, status };
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

export default http;
