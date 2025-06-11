
// ChatGPT 生成代码 https://chat.openai.com/share/de98476e-de2c-4b40-89e6-cd7393401b4b
// 示例用法
// const seconds = 123.456;
// const formattedTime = formatTime(seconds);
// console.log(formattedTime); // 输出: 00:02:03.456

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = (seconds % 3600) % 60;
  const milliseconds = Math.floor((remainingSeconds % 1) * 1000);

  const formattedHours = padNumber(hours);
  const formattedMinutes = padNumber(minutes);
  const formattedSeconds = padNumber(Math.floor(remainingSeconds));
  const formattedMilliseconds = padNumber(milliseconds, 3);

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
}
export function formatTime2(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = (seconds % 3600) % 60;

  const formattedHours = padNumber(hours);
  const formattedMinutes = padNumber(minutes);
  const formattedSeconds = padNumber(Math.floor(remainingSeconds));

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export function padNumber(num: number, length = 2): string {
  return num.toString().padStart(length, "0");
}

export function convertToSeconds(str: string) {
  const parts = str.split(":"); // 用冒号分割字符串
  const hours = parts[parts.length - 3] ? +parts[parts.length - 3] : 0; // 取第一部分作为小时
  const minutes = parts[parts.length - 2] ? +parts[parts.length - 2] : 0; // 取第二部分作为分钟
  const seconds = +parts[parts.length - 1]; // 取第三部分作为秒

  return hours * 3600 + minutes * 60 + seconds; // 计算总秒数
}
