/*
[rewrite_local]
^https://m\.ximalaya\.com/qqx/lesson/queryLessonListV3.* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/ximalaya_lesson.js
[mitm] 
hostname = m.ximalaya.com
*/

// 喜马拉雅课程列表接口脚本
console.log('=== 课程列表脚本开始执行 ===');

// 获取URL参数信息（如果可用）
let urlInfo = "未知";
try {
    if ($request && $request.url) {
        urlInfo = $request.url.split('?')[1] || "无参数";
    }
} catch (e) {
    urlInfo = "获取失败";
}

// 先发送通知确认脚本被调用
$notify("喜马拉雅", "课程脚本执行", `✅ 参数: ${urlInfo}`, {});
console.log('URL参数:', urlInfo);

const body = $response.body;
console.log('响应体长度:', body ? body.length : 0);

if (!body) {
    console.log('响应体为空');
    $notify("喜马拉雅", "错误", "❌ 响应体为空", {});
    $done({});
    return;
}

let obj;
try {
    obj = JSON.parse(body);
    console.log('JSON解析成功');
    $notify("喜马拉雅", "解析", "✅ JSON解析成功", {});
} catch (e) {
    console.log('JSON解析失败:', e.message);
    $notify("喜马拉雅", "错误", `❌ JSON解析失败: ${e.message}`, {});
    $done({ body: body });
    return;
}

// 显示数据结构概览
console.log('响应数据概览:');
if (obj) {
    console.log('- 根字段:', Object.keys(obj));
    if (obj.data) {
        console.log('- data字段:', Object.keys(obj.data));
        if (obj.data.groups) {
            console.log('- groups数量:', obj.data.groups.length);
        }
    }
}

// 处理课程列表数据
if (obj && obj.data && obj.data.groups && Array.isArray(obj.data.groups)) {
    console.log('找到groups数据，开始处理...');
    $notify("喜马拉雅", "处理", `🔍 找到${obj.data.groups.length}个组`, {});
    
    const timestamp = 1724741097000;
    let bookCount = 0;
    let lessonCount = 0;
    let totalGroups = obj.data.groups.length;
    
    obj.data.groups.forEach((group, groupIndex) => {
        console.log(`处理第 ${groupIndex + 1}/${totalGroups} 个group`);
        
        // 处理books
        if (group.books && Array.isArray(group.books)) {
            console.log(`- 找到 ${group.books.length} 本书`);
            group.books.forEach((book, bookIndex) => {
                book.unLocked = true;
                book.purchased = true;
                book.started = timestamp;
                book.isVip = true;
                bookCount++;
            });
        }
        
        // 处理lessons
        if (group.lessons && Array.isArray(group.lessons)) {
            console.log(`- 找到 ${group.lessons.length} 个课程`);
            group.lessons.forEach((lesson, lessonIndex) => {
                lesson.unLocked = true;
                lesson.purchased = true;
                lesson.semesterId = obj.data.semesterId || 0;
                lesson.campId = obj.data.campId || 0;
                lesson.startDate = timestamp;
                lesson.started = true;
                lessonCount++;
            });
        }
    });
    
    console.log(`课程列表处理完成: ${bookCount} 本书, ${lessonCount} 个课程`);
    $notify("喜马拉雅", "完成", `✅ 解锁 ${bookCount} 书籍 + ${lessonCount} 课程`, {});
    
} else {
    console.log('数据结构异常，详细检查:');
    console.log('- obj存在:', !!obj);
    console.log('- obj.data存在:', !!(obj && obj.data));
    console.log('- obj.data.groups存在:', !!(obj && obj.data && obj.data.groups));
    console.log('- groups是数组:', !!(obj && obj.data && obj.data.groups && Array.isArray(obj.data.groups)));
    
    if (obj && obj.data) {
        $notify("喜马拉雅", "调试", `📋 data字段: ${Object.keys(obj.data).join(', ')}`, {});
        console.log('完整data内容:', JSON.stringify(obj.data, null, 2));
    } else if (obj) {
        $notify("喜马拉雅", "调试", `📋 根字段: ${Object.keys(obj).join(', ')}`, {});
        console.log('完整响应:', JSON.stringify(obj, null, 2));
    } else {
        $notify("喜马拉雅", "错误", "❌ 对象解析为null", {});
    }
}

console.log('=== 课程列表脚本执行完成 ===');
$done({ body: JSON.stringify(obj) });
