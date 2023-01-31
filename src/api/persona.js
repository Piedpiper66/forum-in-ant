import handleRequest from "./common";

export function getUserSummary(username) {
  return handleRequest("/common/summary.json", { username });
}

export function getActivity(
  params = {
    username: "",
    type: "",
    page: 0,
    pageSize: 0,
  }
) {
  return handleRequest("/common/activity", params);
}

export function getBookmarkList(
  params = {
    username: "",
    type: "",
    page: 1,
    pageSize: 10,
  }
) {
  return handleRequest("/common/bookmarkList", params);
}

export function getTopicLikes(ids = []) {
  return handleRequest("/common/u/topicLikeList", { ids }, "post");
}

export function getTopicBookmarks(ids = []) {
  return handleRequest("/common/u/topicBookmarks", { ids }, "post");
}
