/*
[rewrite_local]
^https?:\/\/.*\/api\/learn\/camp\/[^/]+$ url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/douhao_camp.js

[mitm]
hostname = douhao.co
*/

console.log(">>> [douhao_camp] 脚本已触发，请求URL为: " + $request.url);

let obj = null;
try {
    obj = JSON.parse($response.body);
    console.log(">>> [douhao_camp] 成功解析JSON响应体。");
} catch (e) {
    console.log("!!! [douhao_camp] 解析JSON响应体失败: " + e.message);
    $done($response); // 如果JSON解析失败，返回原始响应
    return;
}


// 检查解析后的对象是否存在
if (obj) {
    // 修改前记录原始值
    console.log(">>> [douhao_camp] 原始 canLearn 值为: " + obj.canLearn);

    // 将顶层的 canLearn 属性设置为 true
    obj.canLearn = true;

    // 修改后记录新值
    console.log(">>> [douhao_camp] 修改后 canLearn 值为: " + obj.canLearn);

    obj.isFree = true;
    console.log(">>> [douhao_camp] 修改后 isFree 值为: " + obj.isFree);
} else {
    // 如果数据结构不符合预期，打印日志
    console.log("!!! [douhao_camp] 解析后的对象为空或未定义。");
}


try {
    $response.body = JSON.stringify(obj);
    console.log(">>> [douhao_camp] 成功将修改后的对象转为JSON字符串。");
} catch (e) {
    console.log("!!! [douhao_camp] 将修改后的对象转为JSON字符串失败: " + e.message);
     // 如果转字符串失败，返回原始响应
    $done($response);
    return;
}


// 将修改后的响应返回给 QuanX
console.log(">>> [douhao_camp] 脚本执行完毕，返回响应。");
$done($response);
