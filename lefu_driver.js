/*
[rewrite_local]
^https://api\.driving-coach\.com/ddt-course/api/coreCourse/coreCourseList.* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/lefu_driver.js
[mitm] 
hostname = api.driving-coach.com
*/

let body = $response.body;

// 将JSON字符串解析为JavaScript对象
let obj = JSON.parse(body);

// 检查'data'字段是否存在，确保脚本的健壮性
if (obj && obj.data) {
  // 修改'data'对象中的'vipType'和'vipExpireTime'字段
  obj.data.vipType = 1;
  obj.data.vipExpireTime = "2099-11-06T16:08:47.000+00:00";
}

// 将修改后的JavaScript对象转换回JSON字符串
body = JSON.stringify(obj);

// 将修改后的响应体返回给客户端
$done({body});
