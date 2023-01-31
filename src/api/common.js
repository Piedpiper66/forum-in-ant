import request from "../utils/request";

/**
 * @param { string } url 地址
 * @param { object } params 参数
 * @param { "get" | "post" } method 默认 GET
 */
export default async function handleRequest(url, params, method, headers) {
  try {
    method = method || "get";
    const {
      data: { code, data, message },
    } = await request({
      method,
      url,
      [method === "get" ? "params" : "data"]: params,
      headers,
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
