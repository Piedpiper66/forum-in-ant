function countToK(count = 0) {
  return (count < 1000 ? count : (count / 1000).toFixed(1) + " k") + "";
}

const number = {
  bind: (el, { value, modifiers }) => {
    const { ignore, duration, toK } = modifiers;

    value = value ?? 0;

    if (ignore) {
      el.innerText = value;
    } else if (duration) {
      el.innerText =
        "约 " +
        (value < 60
          ? "1分钟"
          : value < 3600
          ? Math.round(value / 60) + "分钟"
          : (value / 3600).toFixed(1) + "小时");
    } else if (toK) {
      el.innerText = countToK(value);
    }
  },
};

export { number };
