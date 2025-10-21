/*
[rewrite_local]
^https:\/\/api\.transyncai\.com\/api\/user_time_credit\/statistics url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/fanyi.js

[mitm]
hostname = api.transyncai.com
*/

let body = $response.body;
let obj = JSON.parse(body);

// 修改为VIP无限制数据
if (obj.data) {
    obj.data.active = true;
    obj.data.premiumUser = true;
    obj.data.subscriptionUser = true;
    obj.data.subscriptionSource = "alipay";
    obj.data.availableTime = 999999999;
    obj.data.currentMonthTotalTime = 999999999;
    obj.data.monthlyAvailableTime = 999999999;
    obj.data.monthlyTotalTime = 999999999;
    obj.data.pointAvailableTime = 0;
    obj.data.pointTotalTime = 0;
    obj.data.currentMonthUsedTime = 0;
    obj.data.totalUsedTime = 0;
    obj.data.currentPackageStartTime = 1729484581157;
    obj.data.currentPackageEndTime = 4096244989000; // 2099年
    obj.data.finalPackageEndTime = 1792470181157;
    obj.data.remainingCreditMonth = 9999;
}

body = JSON.stringify(obj);
$done({ body });
