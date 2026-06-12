// 富贵VIP脚本
// hostname = qy.ps7.cc

/*

════════════════════════════════════════════════
请将以下规则添加到 Quantumult X 配置文件中
════════════════════════════════════════════════

[rewrite_local]
^https?://qy\.ps7\.cc/public/index\.php/api/app/isVip url script-response-body fuguiyin.js

[mitm]
hostname = qy.ps7.cc

════════════════════════════════════════════════
脚本代码开始
════════════════════════════════════════════════

*/

const url = $request.url;
const body = $response.body;

if (url.includes("/api/app/isVip")) {
  try {
    // 解析原始的JSON响应
    let obj = JSON.parse(body);
    
    // 检查响应是否成功，并修改数据
    if (obj.code === 2004) {
      // 修改VIP状态和时间
      obj.data.vip = true;                 // 改为VIP true
      obj.data.time = 4102358400;          // 2099-12-31 00:00:00 UTC的时间戳
      obj.data.over_time = 4102358400;     // 同样改为2099年
      obj.msg = "VIP会员永久有效";          // 修改提示信息
      
      console.log('富贵VIP脚本: 成功修改VIP状态');
    } else {
      console.log('富贵VIP脚本: 响应码异常，原始code = ' + obj.code);
    }
    
    // 将修改后的对象转回JSON字符串并返回
    $done({ body: JSON.stringify(obj) });
    
  } catch (e) {
    console.log('富贵VIP脚本解析错误: ' + e.message);
    $done({});
  }
} else {
  // 如果不是目标URL，直接返回原始响应
  $done({});
}
