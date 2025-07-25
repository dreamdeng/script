/*
===============================
QuantumultX 配置
===============================

[rewrite_local]
# 统一脚本处理两个接口
^https://mapp-03\.hnheibaidian\.com/user/content/course\?courseId=\d+ url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/unified_script.js
^https://mapp-03\.hnheibaidian\.com/user/content/course/menu/list/condition-course-id\?courseId=\d+ url script-request-header https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/unified_script.js

[mitm]
hostname = mapp-03.hnheibaidian.com

===============================
使用说明
===============================
1. 访问课程列表页面 → 自动缓存所有课程视频数据
2. 点击任意课程 → 立即从缓存匹配并弹窗视频链接  
3. 点击通知 → 浏览器打开视频

===============================
功能特性
===============================
✅ 单脚本处理两个接口
✅ 自动识别接口类型  
✅ 持久化数据缓存
✅ 丰富的视频信息（时长、价格）
✅ 点击通知直接观看
✅ 详细的调试日志

*/

// ===============================
// 统一视频提取脚本 (unified_script.js)
// 根据接口类型自动处理：课程缓存 + 视频提取
// ===============================

const scriptName = "统一视频提取器";
const url = $request.url;

console.log(`=================== ${scriptName} 开始执行 ===================`);
console.log(`${scriptName}: URL = ${url}`);

// 判断接口类型
const isCourseListAPI = url.includes('/user/content/course?courseId=');
const isCourseDetailAPI = url.includes('/user/content/course/menu/list/condition-course-id');

console.log(`${scriptName}: 接口判断 - 课程列表:${isCourseListAPI}, 课程详情:${isCourseDetailAPI}`);

if (isCourseListAPI) {
    // ===============================
    // 处理课程列表接口 - 数据缓存功能
    // ===============================
    
    console.log(`${scriptName}: 执行课程列表缓存逻辑`);
    $notify(`${scriptName}`, "课程列表处理", "开始缓存课程数据...");
    
    let body = $response.body;
    let obj;
    
    try {
        obj = JSON.parse(body);
        console.log(`${scriptName}: 课程列表JSON解析成功`);
    } catch (e) {
        console.log(`${scriptName}: 课程列表JSON解析失败 - ${e}`);
        $notify(`${scriptName}`, "解析失败", "课程列表数据格式错误");
        $done({});
    }
    
    // 检查数据结构
    if (obj && obj.record && obj.record.chapters) {
        let chapters = obj.record.chapters;
        console.log(`${scriptName}: 找到 ${chapters.length} 个章节`);
        
        // 按课程ID分组存储视频数据
        let courseData = {};
        let totalVideos = 0;
        
        chapters.forEach((chapter, index) => {
            let courseId = chapter.courseId;
            
            if (!courseData[courseId]) {
                courseData[courseId] = [];
            }
            
            // 检查视频数据
            if (chapter.knowledge && chapter.knowledge.videoResourceUrl) {
                let videoUrl = chapter.knowledge.videoResourceUrl;
                
                // 验证视频URL
                if (videoUrl && 
                    videoUrl !== "https://oss-resources.hnheibaidian.com/file/video/" &&
                    !videoUrl.endsWith("/file/video/") &&
                    videoUrl.length > 50) {
                    
                    courseData[courseId].push({
                        title: chapter.knowledge.title || `章节${index + 1}`,
                        videoUrl: videoUrl,
                        chapterId: chapter.id,
                        knowledgeId: chapter.knowledgeId,
                        index: index + 1,
                        videoTimeSeconds: chapter.knowledge.videoTimeSeconds || 0,
                        price: chapter.knowledge.price || 0
                    });
                    
                    totalVideos++;
                    console.log(`${scriptName}: 课程${courseId} - ${chapter.knowledge.title}`);
                }
            }
        });
        
        // 清理空课程
        Object.keys(courseData).forEach(courseId => {
            if (courseData[courseId].length === 0) {
                delete courseData[courseId];
            }
        });
        
        // 存储缓存
        $persistentStore.write(JSON.stringify(courseData), "courseVideoCache");
        
        let totalCourses = Object.keys(courseData).length;
        
        console.log(`${scriptName}: 缓存完成 - ${totalCourses}个课程，${totalVideos}个视频`);
        
        $notify(
            `${scriptName} ✅`,
            `缓存完成`,
            `${totalCourses}个课程 | ${totalVideos}个视频`
        );
        
    } else {
        console.log(`${scriptName}: 课程列表数据结构异常`);
        $notify(`${scriptName}`, "数据异常", "未找到预期的课程章节数据");
    }
    
} else if (isCourseDetailAPI) {
    // ===============================
    // 处理课程详情接口 - 视频提取功能
    // ===============================
    
    console.log(`${scriptName}: 执行视频提取逻辑`);
    $notify(`${scriptName}`, "课程详情处理", "开始提取视频链接...");
    
    // 提取courseId
    let courseIdMatch = url.match(/courseId=(\d+)/);
    let targetCourseId = courseIdMatch ? courseIdMatch[1] : null;
    
    console.log(`${scriptName}: 目标课程ID: ${targetCourseId}`);
    
    if (targetCourseId) {
        // 读取缓存
        let cachedData = $persistentStore.read("courseVideoCache");
        
        if (cachedData) {
            try {
                let courseData = JSON.parse(cachedData);
                console.log(`${scriptName}: 缓存读取成功`);
                
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
                                    `课程${targetCourseId} | ${duration}秒 | ¥${price}\n🎬 点击观看`,
                                    video.videoUrl
                                );
                            }, index * 1000);
                        });
                        
                        // 汇总通知
                        setTimeout(() => {
                            let totalDuration = videos.reduce((sum, v) => sum + (v.videoTimeSeconds || 0), 0);
                            let minutes = Math.round(totalDuration / 60);
                            
                            $notify(
                                `📊 课程${targetCourseId}汇总`,
                                `${videos.length}个视频 | ${minutes}分钟`,
                                "点击上方通知观看视频"
                            );
                        }, videos.length * 1000 + 500);
                        
                    } else {
                        $notify(`${scriptName}`, `课程${targetCourseId}`, "该课程暂无视频内容");
                    }
                    
                } else {
                    let availableCourses = Object.keys(courseData);
                    console.log(`${scriptName}: 可用课程: ${availableCourses.join(', ')}`);
                    
                    $notify(
                        `${scriptName}`,
                        `课程${targetCourseId}未找到`,
                        `缓存中有: ${availableCourses.slice(0,2).join(',')}`
                    );
                }
                
            } catch (e) {
                console.log(`${scriptName}: 缓存解析失败 - ${e}`);
                $notify(`${scriptName}`, "缓存错误", "请重新访问课程列表");
            }
        } else {
            console.log(`${scriptName}: 无缓存数据`);
            $notify(`${scriptName}`, "无缓存数据", "请先访问课程列表页面");
        }
    } else {
        console.log(`${scriptName}: 未找到courseId`);
        $notify(`${scriptName}`, "参数错误", "URL中缺少courseId");
    }
    
} else {
    console.log(`${scriptName}: 接口类型未匹配`);
    $notify(`${scriptName}`, "接口未识别", "当前URL不在处理范围内");
}

console.log(`=================== ${scriptName} 执行完成 ===================`);
$done({});
