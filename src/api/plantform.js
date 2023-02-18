import handleRequest from "./common";

export function getCategories() {
  return handleRequest("/common/category");
}

export function getTags(category) {
  return handleRequest("/common/tags", { category });
}

export function getLatestTopics(params) {
  return handleRequest("/common/topicRange", params);
}

export function getUserInfo(params) {
  return handleRequest("/common/userInfo", params);
}

export async function search(searchObj) {
  const result = await handleRequest("/common/search", searchObj);

  return result ?? { records: [], users: [], total: 0 };
}

export function searchUser(seachVal) {
  return handleRequest("/common/search/user", { key: seachVal });
}
