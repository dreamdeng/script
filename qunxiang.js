/**
 * @name 群响用户信息修改
 * @description 修改 ma.qunxiang.club/user/* 接口返回数据
 * 
 * [rewrite_local]
 * ^https?:\/\/ma\.qunxiang\.club\/user\/\d+ url script-response-body https://raw.githubusercontent.com/YourUsername/YourRepo/main/qunxiang.js
 * 
 * [mitm]
 * hostname = ma.qunxiang.club
 */

let body = $response.body;

if (body) {
    try {
        let obj = JSON.parse(body);

        if (!obj.data) {
            obj.data = {};
        }

        // 修改目标字段
        obj.data.memberYear = 3;
        obj.data.userTags = ["投资人", "品牌方"];
        obj.data.blacklist = null;
        
        if (!obj.data.membership || typeof obj.data.membership !== 'object') {
            obj.data.membership = {};
        }
        obj.data.membership.level = 2;

        body = JSON.stringify(obj);
    } catch (e) {
        console.log("群响脚本解析失败: " + e);
    }
}

$done({ body });
