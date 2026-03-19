/*
[rewrite_local]
# 匹配课程解锁/拥有接口，将响应体交给 lanxin.js 处理
^https:\/\/app\.lanxinlaoshi\.com:8088\/crmebfront\/api\/front\/app\/course\/manage\/ownCourse\/\d+ url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/lanxin.js

[mitm] 
hostname = app.lanxinlaoshi.com
*/

let body = $response.body;

try {
  // 将JSON字符串解析为JavaScript对象
  let obj = JSON.parse(body);

  // 检查对象是否存在，直接将外层的 data 字段修改为 true
  if (obj) {
    obj.data = true;
    
    // 如果需要确保 code 也是 200，可以去掉下面这行的注释
    // obj.code = 200; 
  }

  // 将修改后的JavaScript对象转换回JSON字符串
  body = JSON.stringify(obj);
} catch (e) {
  // 捕获异常，防止非 JSON 数据导致脚本运行错误
  console.log("兰心老师脚本解析响应体失败: " + e);
}

// 将修改后的响应体返回给客户端
$done({ body });
