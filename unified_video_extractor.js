// ===============================
// QuantumultX 统一视频提取脚本 (unified_video_extractor.js)
// 处理两个接口：课程列表缓存 + 视频链接提取
// ===============================

// 首先输出基本信息确认脚本运行
const scriptName = "视频提取器";
console.log(`=================== ${scriptName} 开始执行 ===================`);

// 检查环境
if (typeof $request !== 'undefined') {
    console.log(`${scriptName}: $request可用`);
    console.log(`${scriptName}: URL = ${$request.url}`);
} else {
    console.log(`${scriptName}: ERROR - $request不可用`);
}

if (typeof $response !== 'undefined') {
    console.log(`${scriptName}: $response可用`);
} else {
    console.log(`${scriptName}: $response不可用（请求阶段正常）`);
}

// 立即发送测试通知
$notify(`${scriptName} - 测试`, "脚本已触发", `时间: ${new Date().toLocaleTimeString()}`);

const url = $request.url;

// 判断是哪个接口
const isCourseListAPI = url.includes('/user/content/course/page');
const isCourseDetailAPI = url.includes('/user/content/course/menu/list/condition-course-id');

console.log(`${scriptName}: 完整URL: ${url}`);
console.log(`${scriptName}: 接口类型判断 - 课程列表:${isCourseListAPI}, 课程详情:${isCourseDetailAPI}`);

if (isCourseListAPI) {
    // ===============================
    // 处理课程列表接口 - 缓存数据
    // ===============================
    
    let body = $response.body;
    let obj;
    
    try {
        obj = JSON.parse(body);
    } catch (e) {
        console.log(`${scriptName}: 课程列表JSON解析失败`);
        $done({});
    }
    
    // 检查是否包含课程数据
    if (obj && obj.record && obj.record.chapters) {
        let chapters = obj.record.chapters;
        
        // 按课程ID分组存储视频数据
        let courseData = {};
        
        chapters.forEach((chapter, index) => {
            let courseId = chapter.courseId;
            
            if (!courseData[courseId]) {
                courseData[courseId] = [];
            }
            
            // 只存储有效的视频章节
            if (chapter.knowledge && chapter.knowledge.videoResourceUrl) {
                let videoUrl = chapter.knowledge.videoResourceUrl;
                
                // 验证视频URL有效性
                if (videoUrl && 
                    videoUrl !== "https://oss-resources.hnheibaidian.com/file/video/" &&
                    !videoUrl.endsWith("/file/video/")) {
                    
                    courseData[courseId].push({
                        title: chapter.knowledge.title || `章节${index + 1}`,
                        videoUrl: videoUrl,
                        chapterId: chapter.id,
                        knowledgeId: chapter.knowledgeId,
                        index: index + 1,
                        videoTimeSeconds: chapter.knowledge.videoTimeSeconds || 0,
                        price: chapter.knowledge.price || 0
                    });
                }
            }
        });
        
        // 存储到持久化缓存
        $persistentStore.write(JSON.stringify(courseData), "courseVideoCache");
        
        let totalCourses = Object.keys(courseData).length;
        let totalVideos = Object.values(courseData).reduce((sum, videos) => sum + videos.length, 0);
        
        console.log(`${scriptName}: 缓存完成 - ${totalCourses}个课程，${totalVideos}个视频`);
        
        $notify(
            `${scriptName} - 数据缓存`,
            `课程列表加载完成`,
            `${totalCourses}个课程，${totalVideos}个视频已缓存`
        );
        
        // 可选：显示缓存的课程ID列表
        console.log(`${scriptName}: 缓存的课程ID: ${Object.keys(courseData).join(', ')}`);
    } else {
        console.log(`${scriptName}: 课程列表中未找到有效数据`);
    }
    
} else if (isCourseDetailAPI) {
    // ===============================
    // 处理课程详情接口 - 提取视频
    // ===============================
    
    // 从URL提取courseId
    let courseIdMatch = url.match(/courseId=(\d+)/);
    let targetCourseId = courseIdMatch ? courseIdMatch[1] : null;
    
    console.log(`${scriptName}: 请求的课程ID: ${targetCourseId}`);
    
    if (targetCourseId) {
        // 从缓存读取数据
        let cachedData = $persistentStore.read("courseVideoCache");
        
        if (cachedData) {
            try {
                let courseData = JSON.parse(cachedData);
                
                if (courseData[targetCourseId]) {
                    let videos = courseData[targetCourseId];
                    
                    console.log(`${scriptName}: 从缓存找到课程${targetCourseId}的${videos.length}个视频`);
                    
                    // 发送视频通知
                    videos.forEach((video, index) => {
                        setTimeout(() => {
                            $notify(
                                `${scriptName} - ${video.title}`,
                                `课程${targetCourseId} | 时长${Math.round(video.videoTimeSeconds)}秒\n💰 ¥${(video.price/100).toFixed(2)} | 点击观看`,
                                video.videoUrl
                            );
                        }, index * 600);
                    });
                    
                    // 汇总通知
                    setTimeout(() => {
                        let totalDuration = videos.reduce((sum, v) => sum + v.videoTimeSeconds, 0);
                        let totalPrice = videos.reduce((sum, v) => sum + v.price, 0);
                        
                        $notify(
                            `${scriptName} - 课程汇总`,
                            `课程${targetCourseId} 完整信息`,
                            `${videos.length}个视频 | ${Math.round(totalDuration/60)}分钟 | ¥${(totalPrice/100).toFixed(2)}`
                        );
                    }, videos.length * 600 + 200);
                    
                    // 详细日志输出
                    videos.forEach((video, index) => {
                        console.log(`[${index + 1}] ${video.title}`);
                        console.log(`    链接: ${video.videoUrl}`);
                        console.log(`    时长: ${Math.round(video.videoTimeSeconds)}秒`);
                        console.log(`    价格: ¥${(video.price/100).toFixed(2)}`);
                    });
                    
                } else {
                    console.log(`${scriptName}: 缓存中未找到课程${targetCourseId}`);
                    
                    // 显示缓存中有哪些课程
                    let courseData = JSON.parse(cachedData);
                    let availableCourses = Object.keys(courseData);
                    
                    $notify(
                        scriptName,
                        `课程${targetCourseId}未缓存`,
                        `可用课程: ${availableCourses.slice(0,3).join(',')}${availableCourses.length > 3 ? '...' : ''}`
                    );
                }
                
            } catch (e) {
                console.log(`${scriptName}: 缓存数据解析失败 - ${e}`);
                $notify(scriptName, "缓存数据错误", "请重新访问课程列表页面");
            }
        } else {
            console.log(`${scriptName}: 未找到缓存数据`);
            $notify(
                scriptName,
                "无缓存数据",
                "请先访问课程列表页面进行数据加载"
            );
        }
    } else {
        console.log(`${scriptName}: URL中未找到courseId`);
    }
}

// 返回原始响应（对于详情接口，我们不需要修改响应）
$done({});

/*
===============================
使用配置
===============================

1. 保存脚本为: unified_video_extractor.js

2. QuantumultX 配置：
[rewrite_local]
# 统一处理两个接口
^https://mapp-03\.hnheibaidian\.com/user/content/course/page\?.*$ url script-response-body unified_video_extractor.js
^https://mapp-03\.hnheibaidian\.com/user/content/course/menu/list/condition-course-id\?courseId=\d+ url script-request-header unified_video_extractor.js

[mitm]
hostname = mapp-03.hnheibaidian.com

3. 使用流程：
   第一步：访问课程列表页面 → 自动缓存所有课程视频数据
   第二步：点击任意课程 → 立即从缓存匹配并弹窗视频链接
   第三步：点击通知 → 浏览器打开视频

4. 功能特性：
   ✅ 单脚本处理两个接口
   ✅ 自动识别接口类型
   ✅ 持久化数据缓存
   ✅ 丰富的视频信息（时长、价格）
   ✅ 点击通知直接观看
   ✅ 详细的调试日志

5. 调试方法：
   - 查看QuantumultX日志了解缓存状态
   - 通知会显示处理结果
   - 支持多课程并行缓存
*/
