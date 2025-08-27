/*
测试用的简化脚本
[rewrite_local]
^https://.*queryLessonListV3.* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/ximalaya_lesson_test.js
[mitm] 
hostname = *.ximalaya.com
*/

// 超简单测试脚本
$notify("测试", "课程脚本被调用了", $request.url, {});
console.log("课程脚本执行，URL:", $request.url);
$done({});
