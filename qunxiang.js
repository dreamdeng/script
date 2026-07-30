/**
 * Quantumult X 单文件重写脚本 - 群响用户信息修改
 *
 * [rewrite_local]
 * ^https?:\/\/ma\.qunxiang\.club\/user\/ url script-response-body https://raw.githubusercontent.com/dreamdeng/script/main/qunxiang.js
 *
 * [mitm]
 * hostname = ma.qunxiang.club
 */

let body = $response.body;

if (!body) {
    console.log("⚠️ [群响] 响应体为空，跳过处理");
    $done({});
} else {
    try {
        body = body.trim();
        let obj = JSON.parse(body);

        if (obj && typeof obj === 'object') {
            if (!obj.data || typeof obj.data !== 'object') {
                obj.data = {};
            }

            // 修改目标字段
            obj.data.memberYear = 3;
            obj.data.userTags = ["投资人", "品牌方"];
            obj.data.blacklist = null;

            // 构造/更新 membership 对象
            if (!obj.data.membership || typeof obj.data.membership !== 'object') {
                obj.data.membership = {};
            }
            obj.data.membership.level = 2;

            body = JSON.stringify(obj);
            console.log("✅ [群响] 用户数据修改成功");
        } else {
            console.log("⚠️ [群响] 数据非合法 JSON 对象");
        }
    } catch (e) {
        console.log("❌ [群响] JSON 解析失败: " + e);
        console.log("📄 原始响应内容: " + body.substring(0, 200));
    }

    $done({ body });
}
