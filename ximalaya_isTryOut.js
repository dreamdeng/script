/**
 * QuantumultX 配置文件添加以下内容：
 * 
 * [rewrite_local]
 * ^https://xxm\.ximalaya\.com/.* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/ximalaya_isTryOut.js
 * 
 * [mitm]
 * hostname = xxm.ximalaya.com
 */
// 获取响应体
let body = $response.body;

// 检查响应体是否存在且不为空
if (!body || body.length === 0) {
    console.log("响应体为空，跳过处理");
    $done({});
}

try {
    // 记录原始响应（调试用）
    console.log("原始响应体长度:", body.length);
    console.log("请求URL:", $request.url);
    
    // 使用正则表达式替换 isTryOut 字段
    // 匹配 "isTryOut": false/true/null/数字/"字符串" 等各种情况
    const regex = /("isTryOut"\s*:\s*)(false|true|null|undefined|\d+|"[^"]*")/g;
    
    // 检查是否包含 isTryOut 字段
    if (regex.test(body)) {
        // 重置正则表达式的 lastIndex
        regex.lastIndex = 0;
        
        // 执行替换
        const modifiedBody = body.replace(regex, '$1true');
        
        console.log("成功修改 isTryOut 字段为 true");
        console.log("修改后响应体长度:", modifiedBody.length);
        
        // 返回修改后的响应
        $done({ body: modifiedBody });
    } else {
        console.log("未找到 isTryOut 字段，无需处理");
        $done({});
    }
    
} catch (error) {
    console.log("处理响应时发生错误:", error.message);
    // 发生错误时返回原始响应
    $done({});
}
