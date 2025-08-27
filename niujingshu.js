/*
[rewrite_local]
^https://m\.ximalaya\.com/qqx/user/deduceUserByOrder.* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/niujingshu.js
^https://m\.ximalaya\.com/qqx/lesson/queryLessonListV3.* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/niujingshu.js
[mitm] 
hostname = m.ximalaya.com
*/

let body = $response.body;
let obj = JSON.parse(body);

// 获取当前请求的URL
const url = $request.url;

// 处理用户订单接口
if (url.includes('/user/deduceUserByOrder')) {
    if (obj.data) {
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
    }
    console.log('修改用户订单接口响应完成');
    $notify("喜马拉雅", "用户订单接口", "✅ 已解锁所有训练营购买状态", {});
}

// 处理课程列表接口
if (url.includes('/lesson/queryLessonListV3')) {
    if (obj.data && obj.data.groups) {
        const timestamp = 1724741097000;
        let bookCount = 0;
        let lessonCount = 0;
        
        obj.data.groups.forEach(group => {
            // 修改books字段
            if (group.books) {
                group.books.forEach(book => {
                    book.unLocked = true;
                    book.purchased = true;
                    book.started = timestamp;
                    book.isVip = true;
                    bookCount++;
                });
            }
            
            // 修改lessons字段
            if (group.lessons) {
                group.lessons.forEach(lesson => {
                    lesson.unLocked = true;
                    lesson.purchased = true;
                    lesson.semesterId = obj.data.semesterId;
                    lesson.campId = obj.data.campId;
                    lesson.startDate = timestamp;
                    lesson.started = true;
                    lessonCount++;
                });
            }
        });
        
        $notify("喜马拉雅", "课程列表接口", `✅ 已解锁 ${bookCount} 本书籍，${lessonCount} 个课程`, {});
    }
    console.log('修改课程列表接口响应完成');
}

// 返回修改后的响应
$done({ body: JSON.stringify(obj) });
