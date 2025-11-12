/*
[rewrite_local]
^https:\/\/learning-api\.lingumi\.com\.cn\/children\/.*\/subject\/.*\/module\/.*$ url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/lingumi.js
[mitm]
hostname = learning-api.lingumi.com.cn
*/


let body = $response.body;

try {
    let obj = JSON.parse(body);
    
    // 修改 numberOfTrialLessons 为 999
    if (obj.module && obj.module.numberOfTrialLessons) {
        obj.module.numberOfTrialLessons = "999";
    }
    
    // 修改 access 下的所有值为 CAN_PLAY
    if (obj.access) {
        for (let key in obj.access) {
            obj.access[key] = "CAN_PLAY";
        }
    }
    
    // 修改 canAccessModule 为 true
    if (obj.hasOwnProperty('canAccessModule')) {
        obj.canAccessModule = true;
    }
    
    body = JSON.stringify(obj);
    console.log('Lingumi 解锁成功');
    
} catch (e) {
    console.log('Lingumi 脚本执行失败: ' + e);
}

$done({ body });
