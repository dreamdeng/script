/*
[script]
^https?:\/\/.*\/api\/learn\/camp\/[^/]+\/book\/[^/]+(?:/detail)?$ url script-response-body douhao_lessons.js
*/

let obj = JSON.parse($response.body);

// 检查返回数据中是否存在 lessons 数组
if (obj && Array.isArray(obj.lessons)) {
    // 遍历 lessons 数组，修改 isFree 和 isVisible 属性
    for (let i = 0; i < obj.lessons.length; i++) {
        if (obj.lessons[i]) {
            obj.lessons[i].isFree = true;
            obj.lessons[i].isVisible = true;
        }
    }
} else {
    // 如果数据结构不符合预期，可以打印一条日志（可选）
    console.log("QuanX Script: Unexpected response structure for douhao_lessons script.");
}

// 将修改后的对象转换回 JSON 字符串
$response.body = JSON.stringify(obj);

// 将修改后的响应返回给 QuanX
$done($response);
