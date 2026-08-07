/*
群响用户信息、会员状态、章节、课程、报名状态与申请查看权限修改

[rewrite_local]
^https?:\/\/ma\.qunxiang\.club\/(user\/|member\/membership\/my|chapter\/|lesson\/|member\/section\/|viewApply\/check\/) url script-response-body https://raw.githubusercontent.com/dreamdeng/script/main/qunxiang.js

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
        // 清除不可见字符与首尾空格
        body = body.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
        let obj = JSON.parse(body);

        if (obj && typeof obj === 'object') {
            
            // 1. 处理 /member/section/ 及 /viewApply/check/ 接口
            if (/\/member\/section\/|\/viewApply\/check\//.test(url)) {
                if (obj.data && typeof obj.data === 'object') {
                    obj.data.isMember = true;
                }
                obj.isMember = true;
                console.log(`✅ [群响] ${url.includes('/viewApply/check/') ? '/viewApply/check/' : '/member/section/'} (isMember=true) 修改成功`);
            }
            
            // 2. 处理 /chapter/ 和 /lesson/ 接口
            else if (/\/chapter\/|\/lesson\//.test(url)) {
                if (obj.data && typeof obj.data === 'object') {
                    obj.data.membership = true;
                    obj.data.authType = 1;
                    obj.data.enroll = obj.data.enroll && typeof obj.data.enroll === 'object' ? obj.data.enroll : {};
                    obj.data.enroll.status = 2;
                }

                obj.membership = true;
                obj.authType = 1;
                obj.enroll = obj.enroll && typeof obj.enroll === 'object' ? obj.enroll : {};
                obj.enroll.status = 2;

                console.log(`✅ [群响] ${url.includes("/chapter/") ? '/chapter/' : '/lesson/'} (membership/authType/enroll.status) 修改成功`);
            } 
            
            // 3. 处理 /member/membership/my 接口
            else if (url.includes("/member/membership/my")) {
                if (!obj.data || typeof obj.data !== 'object') obj.data = {};
                obj.data.membership = { level: 2 };
                console.log("✅ [群响] /member/membership/my 修改成功");
            } 
            
            // 4. 处理 /user/* 接口
            else if (url.includes("/user/")) {
                if (!obj.data || typeof obj.data !== 'object') obj.data = {};
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
        console.log(`❌ [群响] JSON 解析失败: ${e.message}`);
        console.log("📄 原始响应内容前段: " + body.substring(0, 150));
    }

    $done({ body });
}
