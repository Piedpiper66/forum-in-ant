import handleRequest from "./common";

export function saveDraft(draft) {
  return handleRequest("/common/u/saveUserDraft", { ...draft }, "post");
}

export function removeDraft() {
  return handleRequest("/common/u/removeUserDraft", null, "post");
}

export function postImg(data) {
  return handleRequest("/common/u/contentImage", data, "post", {
    "Content-Type": "multipart/form-data",
  });
}

export function removeImg(filename) {
  return handleRequest("/common/u/rmContentImage", { filename }, "post");
}

export function postTheme(form) {
  return handleRequest(
    "/common/u/sendTopic",
    { ...form, date: Date.now() },
    "post"
  );
}

export function postReplyToTheme(form) {
  return handleRequest(
    "/common/u/reply",
    { ...form, date: Date.now() },
    "post"
  );
}

export function postReplyToUser(form) {
  return handleRequest("/common/u/replyPost", form, "post");
}

// 发送私信
export const postPrivate = (form) => {
  return handleRequest(
    "/common/interact/sendPrivate",
    { ...form, date: Date.now() },
    "post"
  );
};
