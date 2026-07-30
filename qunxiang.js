/*
群响用户信息、会员状态、章节、课程与报名状态修改

[rewrite_local]
^https?:\/\/ma\.qunxiang\.club\/(user\/|member\/membership\/my|chapter\/|lesson\/|member\/section\/) url script-response-body https://raw.githubusercontent.com/dreamdeng/script/main/qunxiang.js

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
            
            // 1. 针对 /member/section/ 接口的处理 (isMember 改为 true)
            if (url.includes("/member/section/")) {
                if (obj.data && typeof obj.data === 'object') {
                    obj.data.isMember = true;
                }
                obj.isMember = true;
                console.log("✅ [群响] /member/section/ (isMember=true) 修改成功");
            }
            // 2. 针对 /chapter/ 和 /lesson/ 接口的处理
            else if (url.includes("/chapter/") || url.includes("/lesson/")) {
                if (obj.data && typeof obj.data === 'object') {
                    obj.data.membership = true;
                    obj.data.authType = 1;

                    if (!obj.data.enroll || typeof obj.data.enroll !== 'object') {
                        obj.data.enroll = {};
                    }
                    obj.data.enroll.status = 2;
                }

                obj.membership = true;
                obj.authType = 1;
                if (!obj.enroll || typeof obj.enroll !== 'object') {
                    obj.enroll = {};
                }
                obj.enroll.status = 2;

                console.log(`✅ [群响] ${url.includes("/chapter/") ? '/chapter/' : '/lesson/'} (membership/authType/enroll.status) 修改成功`);
            } 
            // 3. 针对 /member/membership/my 接口的处理
            else if (url.includes("/member/membership/my")) {
                if (!obj.data || typeof obj.data !== 'object') {
                    obj.data = {};
                }
                obj.data.membership = {
                    level: 2
                };
                console.log("✅ [群响] /member/membership/my 修改成功");
            } 
            // 4. 针对 /user/* 接口的处理
            else if (url.includes("/user/")) {
                if (!obj.data || typeof obj.data !== 'object') {
                    obj.data = {};
                }
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
