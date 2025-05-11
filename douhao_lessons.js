/*
[rewrite_local]
^https?:\/\/.*\/api\/learn\/camp\/[^/]+\/book\/[^/]+(?:/detail)?$ url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/douhao_lessons.js

[mitm]
hostname = douhao.co
*/

console.log(">>> [douhao_lessons] 脚本已触发，请求URL为: " + $request.url);

let obj = null;
try {
    obj = JSON.parse($response.body);
    console.log(">>> [douhao_lessons] 成功解析JSON响应体。");
} catch (e) {
    console.log("!!! [douhao_lessons] 解析JSON响应体失败: " + e.message);
    $done($response); // 如果JSON解析失败，返回原始响应
    return;
}


// 检查返回数据中是否存在 lessons 数组
if (obj && Array.isArray(obj.lessons)) {
    console.log(">>> [douhao_lessons] 找到 'lessons' 数组，总数: " + obj.lessons.length);

    // 遍历 lessons 数组，修改 isFree 和 isVisible 属性
    for (let i = 0; i < obj.lessons.length; i++) {
        if (obj.lessons[i]) {
            // 修改前记录原始值
            console.log(`>>> [douhao_lessons] 课程索引 ${i}: 原始 isFree=${obj.lessons[i].isFree}, isVisible=${obj.lessons[i].isVisible}`);

            obj.lessons[i].isFree = true;
            obj.lessons[i].isVisible = true;

            // 修改后记录新值
            console.log(`>>> [douhao_lessons] 课程索引 ${i}: 修改后 isFree=${obj.lessons[i].isFree}, isVisible=${obj.lessons[i].isVisible}`);
        } else {
            console.log(`!!! [douhao_lessons] 课程索引 ${i}: 对象为空或未定义。`);
        }
    }
    console.log(">>> [douhao_lessons] 'lessons' 数组修改完成。");

} else {
    // 如果数据结构不符合预期，打印日志
    console.log("!!! [douhao_lessons] 响应体中未找到 'lessons' 数组或结构无效。");
    // 可选：如果对象不太大，可以打印keys来帮助调试
    // console.log(">>> [douhao_lessons] 收到的对象keys: " + Object.keys(obj).join(', '));
}

try {
    $response.body = JSON.stringify(obj);
    console.log(">>> [douhao_lessons] 成功将修改后的对象转为JSON字符串。");
} catch (e) {
    console.log("!!! [douhao_lessons] 将修改后的对象转为JSON字符串失败: " + e.message);
    // 如果转字符串失败，返回原始响应
    $done($response);
    return;
}


// 将修改后的响应返回给 QuanX
console.log(">>> [douhao_lessons] 脚本执行完毕，返回响应。");
$done($response);
