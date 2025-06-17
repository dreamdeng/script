// 视频链接提取脚本
// hostname = ma.qunxiang.club
/*
视频链接提取
[rewrite_local]
^https?://ma\.qunxiang\.club/chapter url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/video-extractor.js
[mitm] 
hostname = ma.qunxiang.club
*/

const url = $request.url;
const body = $response.body;

console.log(`[视频链接提取] 请求URL: ${url}`);

if (url.includes("ma.qunxiang.club/chapter")) {
  try {
    console.log("[视频链接提取] 开始解析响应数据");
    
    // 解析返回的JSON数据
    let obj = JSON.parse(body);
    console.log(`[视频链接提取] 解析成功，errcode: ${obj.errcode}`);
    
    // 检查响应是否成功
    if (obj.errcode === 0 && obj.data && obj.data.lesson && obj.data.lesson.url) {
      const videoUrl = obj.data.lesson.url;
      const lessonName = obj.data.lesson.name || "未知课程";
      const lessonLength = obj.data.lesson.length || "未知时长";
      
      console.log(`[视频链接提取] 提取到视频链接: ${videoUrl}`);
      console.log(`[视频链接提取] 课程名称: ${lessonName}`);
      console.log(`[视频链接提取] 视频时长: ${lessonLength}`);
      
      // 发送通知
      $notify(
        "视频链接提取成功", 
        `课程: ${lessonName}`,
        `时长: ${lessonLength}\n链接: ${videoUrl}`
      );
      
      console.log("[视频链接提取] 通知已发送");
    } else {
      console.log("[视频链接提取] 响应数据中未找到有效的视频链接");
      console.log(`[视频链接提取] 完整响应: ${JSON.stringify(obj, null, 2)}`);
      
      $notify(
        "视频链接提取失败", 
        "未找到有效链接",
        "请检查接口响应数据"
      );
    }
  } catch (error) {
    console.log(`[视频链接提取] 解析JSON失败: ${error.message}`);
    console.log(`[视频链接提取] 原始响应: ${body}`);
    
    $notify(
      "视频链接提取错误", 
      "JSON解析失败",
      `错误信息: ${error.message}`
    );
  }
} else {
  console.log(`[视频链接提取] 非目标URL，跳过处理: ${url}`);
}

$done({});
