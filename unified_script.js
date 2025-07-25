/*
===============================
QuantumultX 配置
===============================

[rewrite_local]
# 课程视频直接提取
^https://mapp-03\.hnheibaidian\.com/user/content/course\?courseId=\d+ url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/unified_script.js

[mitm]
hostname = mapp-03.hnheibaidian.com

===============================
使用说明
===============================
1. 访问任意课程页面（带courseId参数）
2. 自动解析并弹出该课程的所有视频链接
3. 点击通知直接观看视频

===============================
功能特性
===============================
✅ 单接口处理，无需缓存
✅ 自动解析课程视频
✅ 列表式通知展示
✅ 点击通知直接观看
✅ 显示视频详情（时长、价格）
✅ 简化的调试日志

*/

// ===============================
// 课程视频直接提取脚本 (unified_script.js)
// 直接解析课程接口并弹出所有视频
// ===============================

const scriptName = "课程视频提取器";
const url = $request.url;

console.log(`=================== ${scriptName} 开始执行 ===================`);
console.log(`${scriptName}: URL = ${url}`);

// 立即发送测试通知
$notify(`${scriptName}`, "脚本触发", "开始解析课程视频...");

// 从URL提取courseId
let courseIdMatch = url.match(/courseId=(\d+)/);
let courseId = courseIdMatch ? courseIdMatch[1] : "未知";

console.log(`${scriptName}: 课程ID: ${courseId}`);

// 获取并解析响应数据
let body = $response.body;
let obj;

try {
    obj = JSON.parse(body);
    console.log(`${scriptName}: JSON解析成功`);
} catch (e) {
    console.log(`${scriptName}: JSON解析失败 - ${e}`);
    $notify(`${scriptName}`, "解析失败 ❌", "响应数据不是有效的JSON格式");
    $done({});
}

// 检查数据结构并提取视频
if (obj && obj.record && obj.record.chapters) {
    let chapters = obj.record.chapters;
    console.log(`${scriptName}: 找到 ${chapters.length} 个章节`);
    
    let videoList = [];
    
    // 遍历所有章节，提取视频信息
    chapters.forEach((chapter, index) => {
        if (chapter.knowledge && chapter.knowledge.videoResourceUrl) {
            let videoUrl = chapter.knowledge.videoResourceUrl;
            
            // 验证视频URL有效性
            if (videoUrl && 
                videoUrl !== "https://oss-resources.hnheibaidian.com/file/video/" &&
                !videoUrl.endsWith("/file/video/") &&
                videoUrl.length > 50) {
                
                videoList.push({
                    title: chapter.knowledge.title || `章节${index + 1}`,
                    videoUrl: videoUrl,
                    chapterId: chapter.id,
                    knowledgeId: chapter.knowledgeId,
                    videoTimeSeconds: chapter.knowledge.videoTimeSeconds || 0,
                    price: chapter.knowledge.price || 0,
                    index: index + 1
                });
                
                console.log(`${scriptName}: 找到视频 - ${chapter.knowledge.title}`);
            }
        }
    });
    
    console.log(`${scriptName}: 总共提取到 ${videoList.length} 个视频`);
    
    if (videoList.length > 0) {
        // 发送视频列表通知
        videoList.forEach((video, index) => {
            setTimeout(() => {
                let duration = Math.round(video.videoTimeSeconds);
                let price = (video.price / 100).toFixed(2);
                let minutes = Math.floor(duration / 60);
                let seconds = duration % 60;
                let timeDisplay = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
                
                $notify(
                    `📺 [${index + 1}/${videoList.length}] ${video.title}`,
                    `课程${courseId} | ${timeDisplay} | ¥${price}\n🎬 点击观看视频`,
                    video.videoUrl
                );
                
                console.log(`${scriptName}: 发送通知 [${index + 1}] ${video.title} - ${video.videoUrl}`);
            }, index * 800); // 每个通知间隔800ms
        });
        
        // 发送汇总通知
        setTimeout(() => {
            let totalDuration = videoList.reduce((sum, v) => sum + (v.videoTimeSeconds || 0), 0);
            let totalPrice = videoList.reduce((sum, v) => sum + (v.price || 0), 0);
            let totalMinutes = Math.round(totalDuration / 60);
            
            $notify(
                `📊 课程${courseId} 视频汇总`,
                `共${videoList.length}个视频 | ${totalMinutes}分钟`,
                `总价值: ¥${(totalPrice/100).toFixed(2)} | 已全部展示完毕`
            );
            
            console.log(`${scriptName}: 汇总信息 - ${videoList.length}个视频，${totalMinutes}分钟，¥${(totalPrice/100).toFixed(2)}`);
        }, videoList.length * 800 + 1000);
        
        // 详细控制台输出
        console.log(`${scriptName}: ========== 视频列表详情 ==========`);
        videoList.forEach((video, index) => {
            console.log(`[${index + 1}] ${video.title}`);
            console.log(`    🔗 链接: ${video.videoUrl}`);
            console.log(`    ⏱️ 时长: ${Math.round(video.videoTimeSeconds)}秒`);
            console.log(`    💰 价格: ¥${(video.price/100).toFixed(2)}`);
            console.log(`    📋 章节ID: ${video.chapterId}`);
            console.log(`    🔍 知识点ID: ${video.knowledgeId}`);
        });
        
    } else {
        console.log(`${scriptName}: 课程${courseId}中没有找到有效视频`);
        $notify(
            `${scriptName}`,
            `课程${courseId} 无视频 📭`,
            "该课程没有可播放的视频内容"
        );
    }
    
} else {
    console.log(`${scriptName}: 数据结构异常`);
    console.log(`${scriptName}: obj存在: ${!!obj}`);
    console.log(`${scriptName}: obj.record存在: ${!!(obj && obj.record)}`);
    console.log(`${scriptName}: obj.record.chapters存在: ${!!(obj && obj.record && obj.record.chapters)}`);
    
    $notify(
        `${scriptName}`,
        "数据结构错误 ⚠️",
        "响应中未找到预期的chapters数据"
    );
}

console.log(`=================== ${scriptName} 执行完成 ===================`);
$done({});
