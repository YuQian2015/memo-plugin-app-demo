export function convertToSeconds(str: string) {
  const parts = str.split(":"); // 用冒号分割字符串
  const hours = parts[parts.length - 3] ? +parts[parts.length - 3] : 0; // 取第一部分作为小时
  const minutes = parts[parts.length - 2] ? +parts[parts.length - 2] : 0; // 取第二部分作为分钟
  const seconds = +parts[parts.length - 1]; // 取第三部分作为秒

  return hours * 3600 + minutes * 60 + seconds; // 计算总秒数
}
