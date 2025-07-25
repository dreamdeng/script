// ===============================
// 视频链接提取脚本 (course_video_extractor.js)
// 从缓存中根据courseId提取视频链接
// ===============================

const scriptName = "视频链接提取器";

// 调试信息
console.log(`=================== ${scriptName} 开始执行 ===================`);
console.log(`${scriptName}: URL = ${$request.url}`);

// 立即发送测试通知
$notify(`${scriptName}`, "脚本触发", `开始提取视频链接`);

// 从URL中提取courseId
let url = $request.url;
let courseIdMatch = url.match(/courseId=(\d+)/);
let targetCourseId = courseIdMatch ? courseIdMatch[1] : null;

console.log(`${scriptName}: 提取到的课程ID: ${targetCourseId}`);

if (targetCourseId) {
    // 从缓存读取数据
    let cachedData = $persistentStore.read("courseVideoCache");
    
    console.log(`${scriptName}: 缓存数据存在: ${!!cachedData}`);
    
    if (cachedData) {
        try {
            let courseData = JSON.parse(cachedData);
            console.log(`${scriptName}: 缓存解析成功`);
            console.log(`${scriptName}: 缓存中的课程: ${Object.keys(courseData).join(', ')}`);
            
            if (courseData[targetCourseId]) {
                let videos = courseData[targetCourseId];
                
                console.log(`${scriptName}: 找到课程${targetCourseId}的${videos.length}个视频`);
                
                if (videos.length > 0) {
                    // 发送视频通知
                    videos.forEach((video, index) => {
                        setTimeout(() => {
                            let duration = Math.round(video.videoTimeSeconds);
                            let price = (video.price / 100).toFixed(2);
                            
                            $notify(
                                `📺 ${video.title}`,
                                `课程${targetCourseId} | ${duration}秒 | ¥${price}\n🎬 点击观看视频`,
                                video.videoUrl
                            );
                            
                            console.log(`${scriptName}: 发送通知 [${index + 1}] ${video.title}`);
                        }, index * 800); // 增加延迟避免通知被合并
                    });
                    
                    // 汇总通知
                    setTimeout(() => {
                        let totalDuration = videos.reduce((sum, v) => sum + (v.videoTimeSeconds || 0), 0);
                        let totalPrice = videos.reduce((sum, v) => sum + (v.price || 0), 0);
                        let minutes = Math.round(totalDuration / 60);
                        
                        $notify(
                            `📊 课程${targetCourseId} 汇总`,
                            `${videos.length}个视频 | ${minutes}分钟`,
                            `总价值: ¥${(totalPrice/100).toFixed(2)}`
                        );
                    }, videos.length * 800 + 500);
                    
                    // 详细控制台输出
                    console.log(`${scriptName}: ========== 视频详情 ==========`);
                    videos.forEach((video, index) => {
                        console.log(`[${index + 1}] ${video.title}`);
                        console.log(`    🔗 ${video.videoUrl}`);
                        console.log(`    ⏱️ ${Math.round(video.videoTimeSeconds)}秒`);
                        console.log(`    💰 ¥${(video.price/100).toFixed(2)}`);
                        console.log(`    📋 章节ID: ${video.chapterId}`);
                    });
                    
                } else {
                    $notify(
                        `${scriptName}`,
                        `课程${targetCourseId}无视频`,
                        "该课程没有有效的视频内容"
                    );
                }
                
            } else {
                console.log(`${scriptName}: 课程${targetCourseId}不在缓存中`);
                
                // 显示可用的课程
                let availableCourses = Object.keys(courseData);
                console.log(`${scriptName}: 可用课程: ${availableCourses.join(', ')}`);
                
                $notify(
                    `${scriptName}`,
                    `课程${targetCourseId}未找到`,
                    `缓存中有: ${availableCourses.slice(0,3).join(',')}${availableCourses.length > 3 ? '等' : ''}`
                );
            }
            
        } catch (e) {
            console.log(`${scriptName}: 缓存数据解析失败 - ${e}`);
            $notify(
                `${scriptName}`,
                "缓存数据损坏",
                "请重新访问课程列表页面"
            );
        }
    } else {
        console.log(`${scriptName}: 没有找到缓存数据`);
        $notify(
            `${scriptName}`,
            "无缓存数据 ⚠️",
            "请先访问课程列表页面加载数据"
        );
    }
} else {
    console.log(`${scriptName}: URL中没有找到courseId参数`);
    $notify(
        `${scriptName}`,
        "参数错误",
        "URL中未找到courseId"
    );
}

console.log(`=================== ${scriptName} 执行完成 ===================`);
$done({});
