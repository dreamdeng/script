// 趣配音VIP脚本
// hostname = chatai.qupeiyin.com

/*

ai外教

[rewrite_local]
^https?://chatai\.qupeiyin\.com/(user/memberData|member/index|basic/userModule|member/index) url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/qpyvip.js

[mitm] 
hostname = chatai.qupeiyin.com
*/

const url = $request.url;
const body = $response.body;

if (url.includes("chatai.qupeiyin.com/member/index")) {
  try {
    // 解析返回的JSON数据
    let obj = JSON.parse(body);
    
    if (obj.data) {
      // 修改VIP相关字段
      obj.data.vip_endtime = "2099-12-31"; // 设置VIP到期时间为2099年
      obj.data.is_vip = "1"; // 修改VIP状态为1(开通)
      
      // 修改其他可能与会员相关的字段
      obj.data.free_nums = "99999"; // 免费次数
      obj.data.free_second = "99999"; // 免费秒数
      obj.data.total_free_second = "99999";
      obj.data.unlimit_free_second = "99999";
      obj.data.free_explain_num = "99999"; // 免费解释次数
      obj.data.star_nums = "99999"; // 星星数量
      
      // 修改会员提示文本
      obj.data.vip_text = "VIP会员永久有效";
      obj.data.vip_button_text = "已开通VIP";
      
      // 将修改后的对象转回JSON字符串
      $done({ body: JSON.stringify(obj) });
    } else {
      $done({});
    }
  } catch (e) {
    console.log('趣配音VIP解析错误: ' + e.message);
    $done({});
  }
} else {
  $done({});
}
