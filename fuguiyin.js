// 富贵VIP脚本
// hostname = qy.ps7.cc

/*

════════════════════════════════════════════════
请将以下规则添加到 Quantumult X 配置文件中
════════════════════════════════════════════════

[rewrite_local]
^https?://qy\.ps7\.cc/public/index\.php/api/app/isVip url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/fuguiyin.js

[mitm]
hostname = qy.ps7.cc

════════════════════════════════════════════════

*/

const url = $request.url;
const body = $response.body;

if (url.includes("/api/app/isVip")) {
  try {
    let obj = JSON.parse(body);
    
    if (obj.code === 2004) {
      obj.data.vip = true;
      obj.data.time = 4102358400;
      obj.data.over_time = 4102358400;
      obj.msg = "VIP会员永久有效";
      
      console.log('富贵VIP脚本: 修改成功');
    }
    
    $done({ body: JSON.stringify(obj) });
    
  } catch (e) {
    console.log('富贵VIP脚本错误: ' + e.message);
    $done({});
  }
} else {
  $done({});
}
