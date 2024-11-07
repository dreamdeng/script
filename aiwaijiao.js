/*

ai外教

[rewrite_local]
^https?://chatai\.qupeiyin\.com/(user/memberData|member/index|basic/userModule|member/index) url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/aiwaijiao.js

[mitm] 
hostname = chatai.qupeiyin.com
*/

var anye = $response.body
anye = anye.replace(/vip_endtime":".*?"/g,'vip_endtime":"4072302236"')
anye = anye.replace(/is_vip":"0"/g,'is_vip": "1"')
anye = anye.replace(/days":"1"/g,'days":"999"')
anye = anye.replace(/status":"\\d"/g,'status":"999"')
anye = anye.replace(/nickname":".*?"/g,'nickname":"这里是荒远"')
anye = anye.replace(/endtime": ".*?"/g,'endtime":"1863316835"')
anye = anye.replace(/forbid_end_time":0/g,'forbid_end_time":1')
$done({ body: anye });
