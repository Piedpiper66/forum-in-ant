const toolbars = {
  bold: true, // 粗体
  italic: true, // 斜体
  header: true, // 标题
  underline: false, // 下划线
  strikethrough: false, // 中划线
  mark: false, // 标记
  superscript: false, // 上角标
  subscript: false, // 下角标
  quote: true, // 引用
  ol: true, // 有序列表
  ul: true, // 无序列表
  link: false, // 链接
  imagelink: true, // 图片链接
  code: true, // code
  table: false, // 表格
  fullscreen: true, // 全屏编辑
  readmodel: false, // 沉浸式阅读
  htmlcode: false, // 展示html源码
  help: false, // 帮助
  /* 1.3.5 */
  undo: false, // 上一步
  redo: false, // 下一步
  trash: true, // 清空
  save: false, // 保存（触发events中的save事件）
  /* 1.4.2 */
  navigation: true, // 导航目录
  /* 2.1.8 */
  alignleft: true, // 左对齐
  aligncenter: true, // 居中
  alignright: true, // 右对齐
  /* 2.2.1 */
  subfield: true, // 单双栏模式
  preview: true, // 预览
};

export default toolbars;
