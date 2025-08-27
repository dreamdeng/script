/*
喜马拉雅课程列表解锁
[rewrite_local]
^https://m\.ximalaya\.com/qqx/lesson/queryLessonListV3.* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/ximalaya_lesson.js
[mitm] 
hostname = m.ximalaya.com
*/

var body = $response.body;

// 发送执行通知
$notify("喜马拉雅", "课程列表脚本", "✅ 脚本已执行", {});

// 处理课程列表数据
body = body.replace(/("unLocked":)false/g, '$1true');
body = body.replace(/("purchased":)false/g, '$1true');
body = body.replace(/("started":)false/g, '$1true');
body = body.replace(/("isVip":)false/g, '$1true');
body = body.replace(/("started":\s*)\d+/g, '$11724741097000');
body = body.replace(/("startDate":\s*)\d+/g, '$11724741097000');

$notify("喜马拉雅", "课程列表", "✅ 已解锁课程和书籍内容", {});

$done({ body: body });
