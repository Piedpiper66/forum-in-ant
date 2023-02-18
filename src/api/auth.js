// import handleRequest from "./common";
import request from "../utils/request";

export function login(userinfo) {
  return authRequest("/auth/login", { ...userinfo });
}

export function logout(userId, devId) {
  return authRequest("/auth/logout", { userId, devId });
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

// 发送一则普通的验证邮箱
export function sendOneCheckMail(data, cancel = false) {
  return authRequest("/auth/send-checkEmail", data, "post", null, cancel);
}

export function sendActiveMail(data) {
  return authRequest("/auth/send-active-mail", data);
}

// 用户设备出现风险，校验身份
export function copeWithNoRisk(id) {
  return authRequest("/auth/check-with-no-risk", { id });
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

export function sendUserDevice(data) {
  return authRequest("/common/u/sendUserDeviceInfo", data);
}

async function authRequest(url, query, method, headers, cancel) {
  try {
    // ctx.body
    const {
      data: { code, data, message, status, isActive },
    } = await request({
      method: method || "POST",
      url,
      data: query,
      headers,
      cancel,
    });

    // console.log(code, data, message, status);
    if (code === 200) {
      return { data, status, code };
    } else {
      console.warn("auth.js", code, data, message);

      return { message, status, code, isActive };
    }
  } catch (error) {
    const message = error.message || error;
    const status = error.status || -1;

    console.error(message);

    return { message, status };
  }
}
