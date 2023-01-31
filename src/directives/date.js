import { timeParser, timeMap } from "../utils/format";

const date = {
  bind: (el, binding) => {
    const { arg, modifiers, value } = binding;

    if (!value) {
      el.innerText = "暂无";

      return false;
    }

    const { time, CN, noTimeCN, live, suffix } = modifiers;

    let dateFormat = arg || "yyyy-MM-dd";

    let diff = +new Date() - +value;

    if (live && diff <= timeMap.DAY3) {
      let result = "";

      if (diff < timeMap.MINUTE) result = "刚刚";
      else if (diff < timeMap.HOUR)
        result = `${Math.floor(diff / timeMap.MINUTE)} 分钟`;
      else if (diff < timeMap.DAY)
        result = `${Math.floor(diff / timeMap.HOUR)} 小时`;
      else if (diff < timeMap.DAY3)
        result = `${Math.floor(diff / timeMap.DAY)} 天`;

      el.innerText = suffix && result !== "刚刚" ? result + "前" : result;
    } else {
      if (time) {
        dateFormat += " hh:mm:ss";
      }

      if (CN) {
        let [date, time] = dateFormat.split(" ");

        /**
         * @param { string[] } pair
         * @param { string[][] } fixTuples
         */
        function copeSuffix(pair, fixTuples) {
          fixTuples.forEach(([flag, replace]) => {
            const flagIndex = pair.findIndex((v) => v.includes(flag));
            flagIndex >= 0 && pair.splice(flagIndex + 1, 0, replace);
          });
        }

        if (date) {
          const noDash = date.split("-");

          copeSuffix(noDash, [
            ["y", "年"],
            ["M", "月"],
            ["d", "日"],
          ]);

          date = noDash.join("");
        }

        if (time && !noTimeCN) {
          const noColons = time.split(":");

          copeSuffix(noColons, [
            ["h", "时"],
            ["m", "分"],
            ["s", "秒"],
          ]);

          time = noColons.join("");
        }

        dateFormat = `${date} ${time ?? ""}`.trim();
      }

      el.innerText = timeParser(value, dateFormat);
    }
  },
};

export { date };
