/**
 * 喜马拉雅 isTryOut 字段修改脚本
 * hostname = xxm.ximalaya.com
 */
/*
[rewrite_local]
^https?://.*ximalaya.*\.com/.* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/ximalaya_isTryOut.js
[mitm] 
hostname = xxm.ximalaya.com
*/

const url = $request.url;
var body = $response.body;

console.log(`[喜马拉雅] 请求URL: ${url}`);

// 检查响应体是否存在且不为空
if (!body || body.length === 0) {
    console.log("[喜马拉雅] 响应体为空，跳过处理");
    $done({});
} else {
    try {
        console.log(`[喜马拉雅] 原始响应体长度: ${body.length}`);
        
        // 检查是否包含 isTryOut 字段
        if (body.indexOf('"isTryOut"') !== -1) {
            console.log("[喜马拉雅] 发现 isTryOut 字段，开始修改");
            
            // 执行替换 - 将各种可能的值都改为 true
            var modifiedBody = body.replace(/("isTryOut"\s*:\s*)false/g, '$1true')
                                  .replace(/("isTryOut"\s*:\s*)null/g, '$1true')
                                  .replace(/("isTryOut"\s*:\s*)\d+/g, '$1true')
                                  .replace(/("isTryOut"\s*:\s*)"[^"]*"/g, '$1true');
            
            console.log("[喜马拉雅] 成功修改 isTryOut 字段为 true");
            console.log(`[喜马拉雅] 修改后响应体长度: ${modifiedBody.length}`);
            
            // 发送通知确认修改成功
            $notify("喜马拉雅", "isTryOut修改成功", "已将试听限制修改为true", {});
            
            // 返回修改后的响应
            $done({ body: modifiedBody });
        } else {
            console.log("[喜马拉雅] 未找到 isTryOut 字段，无需处理");
            $done({});
        }
        
    } catch (error) {
        console.log(`[喜马拉雅] 处理响应时发生错误: ${error.message}`);
        
        $notify("喜马拉雅错误", "脚本执行失败", `错误信息: ${error.message}`, {});
        
        // 发生错误时返回原始响应
        $done({});
    }
}
