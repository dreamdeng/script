// ===============================
// 课程数据缓存脚本 (course_cache.js)
// 用于缓存课程列表接口的数据
// ===============================

const scriptName = "课程数据缓存器";

// 调试信息
console.log(`=================== ${scriptName} 开始执行 ===================`);
console.log(`${scriptName}: URL = ${$request.url}`);

// 立即发送测试通知
$notify(`${scriptName}`, "脚本触发", `开始处理课程列表数据`);

// 获取响应体
let body = $response.body;
let obj;

try {
    obj = JSON.parse(body);
    console.log(`${scriptName}: JSON解析成功`);
} catch (e) {
    console.log(`${scriptName}: JSON解析失败 - ${e}`);
    $notify(`${scriptName}`, "解析失败", "响应数据不是有效的JSON格式");
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
        
        // 检查是否有视频数据
        if (chapter.knowledge && chapter.knowledge.videoResourceUrl) {
            let videoUrl = chapter.knowledge.videoResourceUrl;
            
            // 验证视频URL有效性
            if (videoUrl && 
                videoUrl !== "https://oss-resources.hnheibaidian.com/file/video/" &&
                !videoUrl.endsWith("/file/video/") &&
                videoUrl.length > 50) { // 确保URL不是空路径
                
                courseData[courseId].push({
                    title: chapter.knowledge.title || `章节${index + 1}`,
                    videoUrl: videoUrl,
                    chapterId: chapter.id,
                    knowledgeId: chapter.knowledgeId,
                    index: index + 1,
                    videoTimeSeconds: chapter.knowledge.videoTimeSeconds || 0,
                    price: chapter.knowledge.price || 0,
                    useSorter: chapter.knowledge.useSorter || 0
                });
                
                totalVideos++;
                console.log(`${scriptName}: 课程${courseId} 添加视频 - ${chapter.knowledge.title}`);
            }
        }
    });
    
    // 清理空的课程
    Object.keys(courseData).forEach(courseId => {
        if (courseData[courseId].length === 0) {
            delete courseData[courseId];
        }
    });
    
    // 存储到持久化缓存
    $persistentStore.write(JSON.stringify(courseData), "courseVideoCache");
    
    let totalCourses = Object.keys(courseData).length;
    
    console.log(`${scriptName}: 缓存完成 - ${totalCourses}个课程，${totalVideos}个视频`);
    console.log(`${scriptName}: 缓存的课程ID: ${Object.keys(courseData).join(', ')}`);
    
    // 成功通知
    $notify(
        `${scriptName}`,
        `缓存完成 ✅`,
        `${totalCourses}个课程 | ${totalVideos}个视频`
    );
    
    // 详细日志
    Object.keys(courseData).forEach(courseId => {
        console.log(`课程${courseId}: ${courseData[courseId].length}个视频`);
    });
    
} else {
    console.log(`${scriptName}: 数据结构不匹配`);
    console.log(`${scriptName}: obj存在: ${!!obj}`);
    console.log(`${scriptName}: obj.record存在: ${!!(obj && obj.record)}`);
    console.log(`${scriptName}: obj.record.chapters存在: ${!!(obj && obj.record && obj.record.chapters)}`);
    
    $notify(
        `${scriptName}`,
        "数据结构错误",
        "未找到expected的chapters数据"
    );
}

console.log(`=================== ${scriptName} 执行完成 ===================`);
$done({});
