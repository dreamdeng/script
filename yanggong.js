/**
 Quantumult X 脚本：自动修改接口数据
 
 [rewrite_local]
 ^https?:\/\/wuzuyuan\.com\/zuyuan\/api\/(clazz\/detail|user\/info|clazz\/center) url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/yanggong.js
  
 [mitm]
 hostname = wuzuyuan.com
 */

const url = $request.url;
let body = $response.body;

if (body) {
    try {
        let obj = JSON.parse(body);

        // ==================== 1. wuzuyuan.com 接口处理 ====================

        // A. 课程详情接口：lessonList 中的 needPay 设置为 0
        if (url.includes("/zuyuan/api/clazz/detail")) {
            if (obj && obj.data && Array.isArray(obj.data.lessonList)) {
                obj.data.lessonList.forEach(item => {
                    item.needPay = 0;
                });
            }
        }

        // B. 用户信息接口：buyLuoPan 设置为 true
        else if (url.includes("/zuyuan/api/user/info")) {
            if (obj && obj.data) {
                obj.data.buyLuoPan = true;
            } else if (obj) {
                obj.buyLuoPan = true;
            }
        }

        // C. 课程中心接口：buyStatus 设置为 1
        else if (url.includes("/zuyuan/api/clazz/center")) {
            if (obj && Array.isArray(obj.data)) {
                obj.data.forEach(item => { item.buyStatus = 1; });
            } else if (obj && obj.data && Array.isArray(obj.data.records)) {
                obj.data.records.forEach(item => { item.buyStatus = 1; });
            } else if (obj && obj.data && Array.isArray(obj.data.list)) {
                obj.data.list.forEach(item => { item.buyStatus = 1; });
            } else if (obj && obj.data) {
                obj.data.buyStatus = 1;
            }
        }

        // ==================== 2. lanxinlaoshi.com 接口处理 ====================

        // D. 蓝心老师课程拥有/解锁接口处理
        else if (url.includes("/crmebfront/api/front/app/course/manage/ownCourse/")) {
            if (obj) {
                if (typeof obj.data === 'boolean') {
                    obj.data = true;
                } else if (typeof obj.data === 'number') {
                    obj.data = 1;
                } else if (obj.data && typeof obj.data === 'object') {
                    obj.data.isOwn = true;
                    obj.data.own = true;
                    obj.data.hasCourse = true;
                }
                if (obj.hasOwnProperty('code')) obj.code = 200;
            }
        }

        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        console.log("解析 JSON 失败: " + e);
        $done({});
    }
} else {
    $done({});
}
