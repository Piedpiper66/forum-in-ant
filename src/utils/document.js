/**
 * 查询 node 是否是 parent 的子元素
 * @param { Node } node 目标元素
 * @param { Node } parent 目标父元素
 */
export function isNodeInParent(node, parent) {
  if (!node || typeof node !== "object" || !(node instanceof Node))
    return false;

  if (!parent || typeof parent !== "object" || !(parent instanceof Node))
    return false;

  let currentParent = node.parentElement;

  while (currentParent) {
    if (currentParent === parent) return true;

    currentParent = currentParent.parentElement;
  }

  return false;
}
