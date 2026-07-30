/*
群响用户信息与会员状态修改

[rewrite_local]
^https?:\/\/ma\.qunxiang\.club\/(user\/|member\/membership\/my) url script-response-body https://raw.githubusercontent.com/dreamdeng/script/main/qunxiang.js

[mitm]
hostname = ma.qunxiang.club
*/

let body = $response.body;
const url = $request.url;

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

            // 针对 /member/membership/my 接口的处理
            if (url.includes("/member/membership/my")) {
                obj.data.membership = {
                    level: 2
                };
                console.log("✅ [群响] /member/membership/my 修改成功");
            } 
            // 针对 /user/* 接口的处理
            else if (url.includes("/user/")) {
                obj.data.memberYear = 3;
                obj.data.userTags = ["投资人", "品牌方"];
                obj.data.blacklist = null;

                if (!obj.data.membership || typeof obj.data.membership !== 'object') {
                    obj.data.membership = {};
                }
                obj.data.membership.level = 2;
                console.log("✅ [群响] /user/* 修改成功");
            }

            body = JSON.stringify(obj);
        } else {
            console.log("⚠️ [群响] 数据非合法 JSON 对象");
        }
    } catch (e) {
        console.log("❌ [群响] JSON 解析失败: " + e);
        console.log("📄 原始响应内容: " + body.substring(0, 200));
    }

    $done({ body });
}
