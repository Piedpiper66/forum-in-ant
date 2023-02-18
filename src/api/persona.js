import handleRequest from "./common";

export function getUserSummary(username) {
  return handleRequest("/common/summary.json", { username });
}

export function getActivity(params) {
  return handleRequest("/common/activity", params);
}

export function getBookmarkList(params) {
  return handleRequest("/common/bookmarkList", params);
}

export function getTopicLikes(ids = []) {
  return handleRequest("/common/u/topicLikeList", { ids }, "post");
}

export function getTopicBookmarks(ids = []) {
  return handleRequest("/common/u/topicBookmarks", { ids }, "post");
}

export function getPrivateDetail(id) {
  return handleRequest("/common/interact/getPrivateDetail", { id });
}

export function removePrivate(id, creator) {
  return handleRequest(
    "/common/interact/removePrivate",
    { id, creator },
    "post"
  );
}

export function getPrivateList(data) {
  return handleRequest(
    "/common/interact/getUserPrivateList",
    data,
    "post",
    null,
    true
  );
}

export function getSubscribes(data) {
  return handleRequest("/common/u/getSubscribes", data);
}

export function setThemeLastViewTime(data) {
  return handleRequest("/common/u/setThemeViewTime", data, "post");
}
