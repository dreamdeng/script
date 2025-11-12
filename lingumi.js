/*
[rewrite_local]
^https:\/\/learning-api\.lingumi\.com\.cn\/children\/.*\/subject\/.*\/module\/.*$ url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/lingumi.js
^https:\/\/learning-api\.lingumi\.com\.cn\/trial-paywall\/v2\?.*$ url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/lingumi.js
^https:\/\/learning-api\.lingumi\.com\.cn\/freeplay-activities\/.*$ url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/lingumi.js
^https:\/\/learning-api\.lingumi\.com\.cn\/children\/.*\/curriculum\/v2.*$ url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/lingumi.js

[mitm]
hostname = learning-api.lingumi.com.cn
*/

let body = $response.body;
let url = $request.url;

try {
    let obj = JSON.parse(body);
    
    // 接口1: module 解锁
    if (url.includes('/subject/') && url.includes('/module/')) {
        if (obj.module && obj.module.numberOfTrialLessons) {
            obj.module.numberOfTrialLessons = "999";
        }
        if (obj.access) {
            for (let key in obj.access) {
                obj.access[key] = "CAN_PLAY";
            }
        }
        if (obj.hasOwnProperty('canAccessModule')) {
            obj.canAccessModule = true;
        }
        console.log('Lingumi Module 解锁成功');
    }
    
    // 接口2: trial-paywall 试用期修改
    else if (url.includes('/trial-paywall/v2')) {
        if (obj.hasOwnProperty('daysLeftInTrial')) {
            obj.daysLeftInTrial = 999999;
        }
        console.log('Lingumi 试用期延长成功');
    }
    
    // 接口3: freeplay-activities 免费活动解锁
    else if (url.includes('/freeplay-activities/')) {
        if (Array.isArray(obj)) {
            obj.forEach(item => {
                if (item.hasOwnProperty('canAccess')) {
                    item.canAccess = true;
                }
            });
        }
        console.log('Lingumi 免费活动解锁成功');
    }
    
    // 接口4: curriculum 课程体系解锁
    else if (url.includes('/curriculum/v2')) {
        if (Array.isArray(obj)) {
            obj.forEach(subject => {
                if (subject.stages && Array.isArray(subject.stages)) {
                    subject.stages.forEach(stage => {
                        if (stage.modules && Array.isArray(stage.modules)) {
                            stage.modules.forEach(module => {
                                if (module.topics && Array.isArray(module.topics)) {
                                    module.topics.forEach(topic => {
                                        if (topic.hasOwnProperty('canAccess')) {
                                            topic.canAccess = true;
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
        console.log('Lingumi 课程体系解锁成功');
    }
    
    body = JSON.stringify(obj);
    
} catch (e) {
    console.log('Lingumi 脚本执行失败: ' + e);
}

$done({ body });



// /*
// [rewrite_local]
// ^https:\/\/learning-api\.lingumi\.com\.cn\/children\/.*\/subject\/.*\/module\/.*$ url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/lingumi.js
// [mitm]
// hostname = learning-api.lingumi.com.cn
// */


// let body = $response.body;

// try {
//     let obj = JSON.parse(body);
    
//     // 修改 numberOfTrialLessons 为 999
//     if (obj.module && obj.module.numberOfTrialLessons) {
//         obj.module.numberOfTrialLessons = "999";
//     }
    
//     // 修改 access 下的所有值为 CAN_PLAY
//     if (obj.access) {
//         for (let key in obj.access) {
//             obj.access[key] = "CAN_PLAY";
//         }
//     }
    
//     // 修改 canAccessModule 为 true
//     if (obj.hasOwnProperty('canAccessModule')) {
//         obj.canAccessModule = true;
//     }
    
//     body = JSON.stringify(obj);
//     console.log('Lingumi 解锁成功');
    
// } catch (e) {
//     console.log('Lingumi 脚本执行失败: ' + e);
// }

// $done({ body });
