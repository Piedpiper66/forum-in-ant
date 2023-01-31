// prettier-ignore
export const timeMap = {
  MINUTE: 1000 * 60,
  HOUR:   1000 * 60 * 60,
  DAY:    1000 * 60 * 60 * 24,
  DAY3:   1000 * 60 * 60 * 24 * 3,
  MONTH:  1000 * 60 * 60 * 24 * 30,
  YEAR:   1000 * 60 * 60 * 24 * 365,
};

export function timeFormat(time = new Date(), needSuffix = false) {
  const diff = new Date() - new Date(+time);

  let type = "";
  // console.log(time);
  // prettier-ignore
  if (diff < timeMap.MINUTE) return "刚刚";
  else if (diff < timeMap.HOUR) type = `${Math.floor(diff / timeMap.MINUTE)} 分钟`;
  else if (diff < timeMap.DAY) type = `${Math.floor(diff / timeMap.HOUR)} 小时`;
  else if (diff < timeMap.MONTH) type = `${Math.floor(diff / timeMap.DAY)} 天`;
  else return timeParser(time, "yyyy-MM-dd");

  return needSuffix ? type + "前" : type;
}

/**
 * 日期格式化
 */
export function timeParser(time, fmt = "yyyy-MM-dd hh:mm:ss") {
  const date = new Date(time);
  var o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds(), //毫秒
  };

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }

  return fmt;
}

export function countToK(count = 0) {
  return (count < 1000 ? count : (count / 1000).toFixed(1) + " k") + "";
}

export function timeToHour(time) {
  return Math.floor(+time / timeMap.HOUR);
}
export function timeToMHTY(time = 0) {
  time = +time;
  return time < timeMap.MINUTE
    ? "刚刚"
    : time < timeMap.HOUR
    ? `${Math.floor(time / timeMap.MINUTE)} 分钟`
    : time < timeMap.DAY
    ? `${Math.floor(time / timeMap.HOUR)} 小时`
    : time < timeMap.YEAR
    ? `${Math.floor(time / timeMap.DAY)} 天`
    : /* else */ `${(time / timeMap.YEAR).toFixed(1)} 年`;
}

export function timeDiffRange(a, b) {
  const diff = Math.abs(+new Date(a) - +new Date(b));
  const range =
    diff < timeMap.MINUTE
      ? "刚刚"
      : diff < timeMap.HOUR
      ? `${Math.floor(diff / timeMap.MINUTE)} 分钟`
      : diff < timeMap.DAY
      ? `${Math.floor(diff / timeMap.HOUR)} 小时`
      : diff < timeMap.MONTH
      ? `${Math.floor(diff / timeMap.DAY)} 天`
      : diff < timeMap.YEAR
      ? `${Math.floor(diff / timeMap.MONTH)} 月`
      : /* else */ `${(diff / timeMap.YEAR).toFixed(1)} 年`;
  return range + " 后";
}

export function convertDateToYMD(time = new Date()) {
  const date = new Date(+time);
  const y = date.getFullYear() % 100;
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y < 9 ? "0" + y : y}年${m}月${d}日`;
}
