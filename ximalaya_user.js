/*
喜马拉雅用户订单解锁
[rewrite_local]
^https://m\.ximalaya\.com/qqx/user/deduceUserByOrder.* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/ximalaya_user.js
[mitm] 
hostname = m.ximalaya.com
*/

var body = $response.body;

// 发送执行通知
$notify("喜马拉雅", "用户订单脚本", "✅ 脚本已执行", {});

// 处理用户订单数据
body = body.replace(/("hasBuyOldCamp":)false/g, '$1true');
body = body.replace(/("hasBuyNewCamp":)false/g, '$1true');
body = body.replace(/("hasBuyThreeCamp":)false/g, '$1true');
body = body.replace(/("hasBuyFourCamp":)false/g, '$1true');
body = body.replace(/("hasBuyOldLongCamp":)false/g, '$1true');
body = body.replace(/("hasBuyOldNotLongCamp":)false/g, '$1true');
body = body.replace(/("hasBuyNewLongCamp":)false/g, '$1true');
body = body.replace(/("hasBuyNewNotLongCamp":)false/g, '$1true');
body = body.replace(/("hasThreeExperienceCampOrder":)false/g, '$1true');
body = body.replace(/("hasThreeLongCampOrder":)false/g, '$1true');
body = body.replace(/("hasFourExperienceCampOrder":)false/g, '$1true');
body = body.replace(/("hasFourLongCampOrder":)false/g, '$1true');

$notify("喜马拉雅", "用户订单", "✅ 已解锁所有训练营购买状态", {});

$done({ body: body });
