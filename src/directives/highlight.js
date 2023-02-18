const toolDiv = document.createElement("div");

const hightlight = {
  bind: (el, binding) => {
    const { arg: currQuery, modifiers, value } = binding;

    const { content, title, name } = modifiers;

    let text = value;
    let type;

    content && (type = "content");
    title && (type = "title");
    (!type || name) && (type = "name");

    if (text) {
      toolDiv.innerHTML = text;

      // 目标关键字所在文本的起始序号
      const startIndex = text.indexOf(currQuery);

      // 如果文本不包含关键字，直接返回所有文字内容
      if (startIndex === -1) {
        el.innerHTML = toolDiv.textContent;
        return false;
      }

      const reg = new RegExp(currQuery, "g");
      const replaceNode = `<span class='emphasis-${type} font-bold text-shadow-sm'>${currQuery}</span>`;

      if (content) {
        // 截取从关键字开始的 100 字符
        text = text.slice(startIndex, startIndex + 100);
      }

      // 转换为文本，防止<>被解析, 并去除换行
      text = text
        .replace(/[<>\n]/g, (str) => {
          if (str === "<") return "&lt;";
          else if (str === ">") return "&gt;";
          else return "\t";
        })
        .replace(reg, () => replaceNode);

      el.innerHTML = text;
    }
  },
};

export { hightlight };
