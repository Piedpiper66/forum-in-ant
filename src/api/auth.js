// import handleRequest from "./common";
import request from "../utils/request";

export function login(userinfo) {
  return authRequest("/auth/login", { ...userinfo });
}

export function logout(userId) {
  return authRequest("/auth/logout", { userId });
}

// export function register(userinfo) {
//   return authRequest("/auth/register", { ...userinfo });
// }
export function register(encryptInfo) {
  return authRequest("/auth/register", { info: encryptInfo });
}

export function vertify() {
  return authRequest("/auth/current", undefined, "GET");
}

export function checkSendMail(email) {
  return authRequest("/auth/check-send-email", { email });
}

export function checkusername(username) {
  return authRequest("/auth/checkusername", { username });
}

export function checkmail(email, reset) {
  return authRequest("/auth/checkmail", { email, reset });
}

export function createMailCaptcha(email, newEmail) {
  return authRequest("/auth/sendMailCaptcha", { email, newEmail });
}

export function resendCaptcha(data = { username: "", date }) {
  return authRequest("/auth/resendMail", data);
}

export function checkMailCaptcha(data = { username, date, captcha }) {
  return authRequest("/auth/mailCaptchaCheck", data);
}

// check-reset-email
export function checkResetEmail(data = { email, newEmail, captcha }) {
  return authRequest("/auth/check-reset-email", data);
}

// export function resendCaptcha(data = { username: "", date }) {
//   return authRequest("/auth/resendMail", data);
// }
export function resetPwd(data) {
  return authRequest("/auth/reset-pwd", data);
}

export function resetFullname(fullname) {
  return authRequest("/common/u/reset-fullname", { fullname });
}

export function updateProfile(formdata) {
  return authRequest("/common/u/uploadProfile", formdata, "POST", {
    "Content-Type": "multipart/form-data",
  });
}

export function checkIdValid(date, sessionid) {
  return authRequest("/auth/check-pwd-reset-valid", { date, sessionid });
}

export function removeAccount(userId) {
  return authRequest("/common/u/removeAccount", { userId });
}

async function authRequest(url, query, method, headers) {
  try {
    const {
      data: { code, data, message, status },
    } = await request({
      method: method || "POST",
      url,
      data: query,
      headers,
    });
    if (code === 200) {
      return { data, status };
    } else {
      console.warn("auth.js", code, data, message);

      return { message, status };
    }
  } catch (error) {
    const message = error.message || error;

    console.error(message);

    return { message: "未知错误" };
  }
}
