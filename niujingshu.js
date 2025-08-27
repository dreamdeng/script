/*
[rewrite_local]
^https://m\.ximalaya\.com/qqx/user/deduceUserByOrder.* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/niujingshu.js
^https://m\.ximalaya\.com/qqx/lesson/queryLessonListV3.* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/niujingshu.js
[mitm] 
hostname = m.ximalaya.com
*/

// 喜马拉雅权限解锁脚本
console.log('=== 喜马拉雅脚本开始执行 ===');

const url = $request.url;
const body = $response.body;

console.log('请求URL:', url);
console.log('响应体大小:', body ? body.length : 0);

// 无论如何都先发送通知，确认脚本被调用
$notify("喜马拉雅脚本", "脚本已执行", `URL: ${url.split('?')[0]}`, {});

if (!body) {
    console.log('响应体为空，退出处理');
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

// 处理用户订单接口
if (url.includes('deduceUserByOrder')) {
    console.log('=== 处理用户订单接口 ===');
    
    if (obj && obj.data) {
        obj.data.hasBuyOldCamp = true;
        obj.data.hasBuyNewCamp = true;
        obj.data.hasBuyThreeCamp = true;
        obj.data.hasBuyFourCamp = true;
        obj.data.hasBuyOldLongCamp = true;
        obj.data.hasBuyOldNotLongCamp = true;
        obj.data.hasBuyNewLongCamp = true;
        obj.data.hasBuyNewNotLongCamp = true;
        obj.data.hasThreeExperienceCampOrder = true;
        obj.data.hasThreeLongCampOrder = true;
        obj.data.hasFourExperienceCampOrder = true;
        obj.data.hasFourLongCampOrder = true;
        
        console.log('用户订单数据修改完成');
        $notify("喜马拉雅", "用户订单", "✅ 已解锁所有训练营", {});
    } else {
        console.log('用户订单接口数据结构异常');
        $notify("喜马拉雅", "用户订单", "❌ 数据结构异常", {});
    }
}

// 处理课程列表接口
if (url.includes('queryLessonListV3')) {
    console.log('=== 处理课程列表接口 ===');
    console.log('完整响应数据:', JSON.stringify(obj, null, 2));
    
    if (obj && obj.data && obj.data.groups) {
        console.log('找到groups，开始处理...');
        const timestamp = 1724741097000;
        let totalModified = 0;
        
        obj.data.groups.forEach((group, groupIndex) => {
            console.log(`处理group ${groupIndex}`);
            
            if (group.books && Array.isArray(group.books)) {
                group.books.forEach(book => {
                    book.unLocked = true;
                    book.purchased = true;
                    book.started = timestamp;
                    book.isVip = true;
                    totalModified++;
                });
                console.log(`修改了${group.books.length}本书`);
            }
            
            if (group.lessons && Array.isArray(group.lessons)) {
                group.lessons.forEach(lesson => {
                    lesson.unLocked = true;
                    lesson.purchased = true;
                    lesson.semesterId = obj.data.semesterId || 0;
                    lesson.campId = obj.data.campId || 0;
                    lesson.startDate = timestamp;
                    lesson.started = true;
                    totalModified++;
                });
                console.log(`修改了${group.lessons.length}个课程`);
            }
        });
        
        console.log(`课程列表处理完成，总共修改 ${totalModified} 项`);
        $notify("喜马拉雅", "课程列表", `✅ 已解锁 ${totalModified} 项内容`, {});
        
    } else {
        console.log('课程列表数据结构检查:');
        console.log('- obj存在:', !!obj);
        console.log('- obj.data存在:', !!(obj && obj.data));
        console.log('- obj.data.groups存在:', !!(obj && obj.data && obj.data.groups));
        
        if (obj && obj.data) {
            console.log('data字段内容:', Object.keys(obj.data));
        }
        
        $notify("喜马拉雅", "课程列表", "⚠️ 数据结构不符合预期", {});
    }
}

console.log('=== 喜马拉雅脚本执行完成 ===');
$done({ body: JSON.stringify(obj) });
