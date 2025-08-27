/*
[rewrite_local]
^https://m\.ximalaya\.com/qqx/lesson/queryLessonListV3.* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/ximalaya_lesson.js
[mitm] 
hostname = m.ximalaya.com
*/

// 喜马拉雅课程列表接口脚本
console.log('=== 课程列表脚本开始执行 ===');

const url = $request.url;
const body = $response.body;

console.log('请求URL:', url);

// 发送执行通知
$notify("喜马拉雅", "课程列表脚本", "✅ 脚本已执行", {});

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

console.log('完整响应数据:', JSON.stringify(obj, null, 2));

// 处理课程列表数据
if (obj && obj.data && obj.data.groups) {
    console.log('找到groups数据，开始处理...');
    const timestamp = 1724741097000;
    let bookCount = 0;
    let lessonCount = 0;
    
    obj.data.groups.forEach((group, groupIndex) => {
        console.log(`处理第 ${groupIndex + 1} 个group`);
        
        // 处理books
        if (group.books && Array.isArray(group.books)) {
            group.books.forEach((book, bookIndex) => {
                console.log(`修改第 ${bookIndex + 1} 本书`);
                book.unLocked = true;
                book.purchased = true;
                book.started = timestamp;
                book.isVip = true;
                bookCount++;
            });
        }
        
        // 处理lessons
        if (group.lessons && Array.isArray(group.lessons)) {
            group.lessons.forEach((lesson, lessonIndex) => {
                console.log(`修改第 ${lessonIndex + 1} 个课程`);
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
    $notify("喜马拉雅", "课程列表", `✅ 已解锁 ${bookCount} 本书籍，${lessonCount} 个课程`, {});
    
} else {
    console.log('数据结构检查:');
    console.log('- obj存在:', !!obj);
    console.log('- obj.data存在:', !!(obj && obj.data));
    console.log('- obj.data.groups存在:', !!(obj && obj.data && obj.data.groups));
    
    if (obj && obj.data) {
        console.log('data字段内容:', Object.keys(obj.data));
        console.log('完整data数据:', JSON.stringify(obj.data, null, 2));
    }
    
    $notify("喜马拉雅", "课程列表", "⚠️ 数据结构不符合预期", {});
}

console.log('=== 课程列表脚本执行完成 ===');
$done({ body: JSON.stringify(obj) });
