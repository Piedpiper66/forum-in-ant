import request from "../utils/request";

/**
 * @param { string } url 地址
 * @param { object } params 参数
 * @param { "get" | "post" } method 默认 GET
 * @param { boolean } cancel 是否可能会取消该请求
 */
export default async function handleRequest(
  url,
  info,
  method,
  headers,
  cancel = false
) {
  try {
    method = method || "get";
    const {
      data: { code, data, message },
    } = await request({
      method,
      url,
      [method === "get" ? "params" : "data"]: info,
      headers,
      cancel,
    });
    if (code === 200) {
      return data ? data : -1;
    } else {
      console.warn(code, data, message);

      return null;
    }
  } catch (error) {
    console.error(error.message || error);
    return null;
  }
}
