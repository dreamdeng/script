/**
 * 喜马拉雅 isTryOut 字段修改脚本
 * hostname = xxm.ximalaya.com
 */
/*
[rewrite_local]
^https?://xxm\.ximalaya\.com/mobile/album/v2/trackRecord/queryTrackRecordsByAlbumIdAndUid.* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/ximalaya_isTryOut.js
^https?://mpay\.ximalaya\.com/mobile/album/trackRecord/palyTrack/.* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/ximalaya_isTryOut.js
[mitm] 
hostname = xxm.ximalaya.com, mpay.ximalaya.com
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
        
        // 检查是否包含权限相关字段
        if (body.indexOf('"isTryOut"') !== -1 || 
            body.indexOf('"authorized"') !== -1 || 
            body.indexOf('"paid"') !== -1) {
            
            console.log("[喜马拉雅] 发现权限相关字段，开始修改");
            
            // 执行替换 - 修改所有权限相关参数
            var modifiedBody = body
                .replace(/("isTryOut"\s*:\s*)false/gi, '$1true')           // 改为试听状态
                .replace(/("authorized"\s*:\s*)false/gi, '$1true')        // 改为已授权
                .replace(/("isAuthorized"\s*:\s*)false/gi, '$1true')      // 改为已授权
                .replace(/("paid"\s*:\s*)true/gi, '$1false')              // 改为非付费
                .replace(/("isSubscribe"\s*:\s*)false/gi, '$1true')       // 改为已订阅
                .replace(/("subscribe"\s*:\s*)false/gi, '$1true')         // 改为已订阅
                .replace(/("freePages"\s*:\s*)0/g, '$1999')               // 增加免费页数
                .replace(/("noAuthorizedReason"\s*:\s*)1/g, '$10');       // 移除无权限原因
            
            console.log("[喜马拉雅] 成功修改权限参数");
            console.log(`[喜马拉雅] 修改后响应体长度: ${modifiedBody.length}`);
            
            // 发送通知确认修改成功
            $notify("喜马拉雅", "权限修改成功", "已解锁付费内容访问权限", {});
            
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
