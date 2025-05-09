/*
[script]
^https?:\/\/.*\/api\/learn\/camp\/[^/]+$ url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/douhao_camp.js
*/

let obj = JSON.parse($response.body);

// 检查解析后的对象是否存在
if (obj) {
    // 将顶层的 canLearn 属性设置为 true
    obj.canLearn = true;
} else {
    // 如果数据结构不符合预期，可以打印一条日志（可选）
    console.log("QuanX Script: Unexpected response structure for douhao_camp script or invalid JSON.");
}


// 将修改后的对象转换回 JSON 字符串
$response.body = JSON.stringify(obj);

// 将修改后的响应返回给 QuanX
$done($response);
