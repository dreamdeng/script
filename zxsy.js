/*
 *
 *
脚本功能：解锁vip电子书,付费电子书
软件版本：++
下载地址：苹果商店下载
脚本作者：
更新时间：2024年2月9日 01:09
问题反馈：
使用声明：此脚本仅供学习与交流，请在下载使用24小时内删除！请勿在中国大陆转载与贩卖！作者TG频道 : https://t.me/GieGie777
*******************************
[rewrite_local]
# > 中信书院 解锁vip电子书,付费电子书
^https?:\/\/napi.yunpub.cn\/api\/(product/getBookContent|user/login\/getUserInfo|cms\/index\/getMyPage).*$ url script-response-body https://raw.githubusercontent.com/WeiGiegie/666/main/zxsy.js

[mitm] 
hostname = napi.yunpub.cn
*
*
*/
