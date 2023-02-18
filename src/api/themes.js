import handleRequest from "./common";

export function getTopicDetail(topicId, userId) {
  return handleRequest("/common/topic", { id: topicId, userId });
}

export function getReplyDetail(params) {
  return handleRequest("/common/replyDetail", params);
}

export function toggleSupport(data) {
  return handleRequest("/common/u/support", data, "post");
}

export function toggleBookmark(data) {
  return handleRequest("/common/u/bookmark", data, "post");
}

export function toggleThemeResolve(data) {
  return handleRequest("/common/u/topicResolve", data, "post");
}

export function getUserThemeLikes(ids = []) {
  return handleRequest("/common/u/topicLikeList", { ids }, "post");
}

export function getUserThemeBookmarks(ids = []) {
  return handleRequest("/common/u/topicBookmarks", { ids }, "post");
}

export function toggleSubscribe(themeId, type) {
  return handleRequest("/common/u/subscribe", { themeId, type }, "post");
}
