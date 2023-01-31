import handleRequest from "./common";

export function getTopicDetail(topicId, userId) {
  return handleRequest("/common/topic", { id: topicId, userId });
}

export function getReplyDetail(params) {
  return handleRequest("/common/replyDetail", params);
}
