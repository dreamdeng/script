/*
[rewrite_local]
^https://m\.ximalaya\.com/qqx/user/deduceUserByOrder.* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/ximalaya_user.js
[mitm] 
hostname = m.ximalaya.com
*/

// 喜马拉雅用户订单接口脚本
console.log('=== 用户订单脚本开始执行 ===');

const url = $request.url;
const body = $response.body;

console.log('请求URL:', url);

// 发送执行通知
$notify("喜马拉雅", "用户订单脚本", "✅ 脚本已执行", {});

if (!body) {
    console.log('响应体为空');
    $done({});
    return;
}

let obj;
try {
    obj = JSON.parse(body);
    console.log('JSON解析成功');
} catch (e) {
    console.log('JSON解析失败:', e.message);
    $done({ body: body });
    return;
}

// 处理用户订单数据
if (obj && obj.data) {
    console.log('开始修改用户订单数据...');
    
    obj.data.hasBuyOldCamp = true;
    obj.data.hasBuyNewCamp = true;
    obj.data.hasBuyThreeCamp = true;
    obj.data.hasBuyFourCamp = true;
    obj.data.hasBuyOldLongCamp = true;
    obj.data.hasBuyOldNotLongCamp = true;
    obj.data.hasBuyNewLongCamp = true;
    obj.data.hasBuyNewNotLongCamp = true;
    obj.data.hasThreeExperienceCampOrder = true;
    obj.data.hasThreeLongCampOrder = true;
    obj.data.hasFourExperienceCampOrder = true;
    obj.data.hasFourLongCampOrder = true;
    
    console.log('用户订单数据修改完成');
    $notify("喜马拉雅", "用户订单", "✅ 已解锁所有训练营购买状态", {});
} else {
    console.log('数据结构异常:', JSON.stringify(obj, null, 2));
    $notify("喜马拉雅", "用户订单", "❌ 数据结构异常", {});
}

console.log('=== 用户订单脚本执行完成 ===');
$done({ body: JSON.stringify(obj) });
