/*
===============================
QuantumultX 配置
===============================

[rewrite_local]
# 课程视频直接提取
^https://mapp-02\.hnheibaidian\.com/user/content/course\?courseId=\d+ url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/unified_script.js

[mitm]
hostname = mapp-02.hnheibaidian.com

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

// 立即输出调试信息
console.log("========== 脚本开始执行 ==========");
console.log("当前时间: " + new Date().toLocaleString());

// 检查环境变量
console.log("$request 可用: " + (typeof $request !== 'undefined'));
console.log("$response 可用: " + (typeof $response !== 'undefined'));
console.log("$notify 可用: " + (typeof $notify !== 'undefined'));

// 立即发送测试通知确认脚本运行
$notify("脚本启动测试", "QuantumultX脚本", "如果看到这个通知，说明脚本已触发");

const scriptName = "课程视频提取器";

// 检查$request是否可用
if (typeof $request === 'undefined') {
    console.log("错误: $request 未定义");
    $notify("脚本错误", "$request未定义", "请检查QuantumultX配置");
    $done({});
}

const url = $request.url;
console.log(`${scriptName}: 请求URL = ${url}`);

// 检查URL是否匹配
const urlMatch = url.includes('/user/content/course?courseId=');
console.log(`${scriptName}: URL匹配结果 = ${urlMatch}`);

if (!urlMatch) {
    console.log(`${scriptName}: URL不匹配，退出执行`);
    $notify(`${scriptName}`, "URL不匹配", `当前URL: ${url.substring(0, 50)}...`);
    $done({});
}

// 检查$response是否可用
if (typeof $response === 'undefined') {
    console.log("错误: $response 未定义");
    $notify("脚本错误", "$response未定义", "请检查重写规则类型");
    $done({});
}

console.log(`${scriptName}: 开始处理响应数据`);

// 从URL提取courseId
let courseIdMatch = url.match(/courseId=(\d+)/);
let courseId = courseIdMatch ? courseIdMatch[1] : "未知";

console.log(`${scriptName}: 课程ID: ${courseId}`);

// 获取并解析响应数据
let body = $response.body;
console.log(`${scriptName}: 响应体长度: ${body ? body.length : 0}`);
console.log(`${scriptName}: 响应体前200字符: ${body ? body.substring(0, 200) : 'null'}`);

let obj;

try {
    obj = JSON.parse(body);
    console.log(`${scriptName}: JSON解析成功`);
    $notify(`${scriptName}`, "JSON解析成功", "开始检查数据结构...");
} catch (e) {
    console.log(`${scriptName}: JSON解析失败 - ${e}`);
    $notify(`${scriptName}`, "解析失败 ❌", `JSON错误: ${e.message}`);
    $done({});
}

// 检查数据结构
console.log(`${scriptName}: obj存在: ${!!obj}`);
if (obj) {
    console.log(`${scriptName}: obj.record存在: ${!!obj.record}`);
    if (obj.record) {
        console.log(`${scriptName}: obj.record.chapters存在: ${!!obj.record.chapters}`);
        if (obj.record.chapters) {
            console.log(`${scriptName}: chapters数组长度: ${obj.record.chapters.length}`);
        } else {
            console.log(`${scriptName}: obj.record的键: ${Object.keys(obj.record)}`);
        }
    } else {
        console.log(`${scriptName}: obj的键: ${Object.keys(obj)}`);
    }
}

// 发送数据结构检查通知
$notify(
    `${scriptName} - 数据检查`,
    `obj: ${!!obj} | record: ${!!(obj && obj.record)} | chapters: ${!!(obj && obj.record && obj.record.chapters)}`,
    obj && obj.record && obj.record.chapters ? `找到${obj.record.chapters.length}个章节` : "数据结构异常"
);

// 检查数据结构并提取视频
if (obj && obj.record && obj.record.chapters) {
    let chapters = obj.record.chapters;
    console.log(`${scriptName}: 开始遍历 ${chapters.length} 个章节`);
    
    $notify(`${scriptName}`, "开始解析章节", `共${chapters.length}个章节数据`);
    
    let videoList = [];
    
    // 遍历所有章节，提取视频信息
    chapters.forEach((chapter, index) => {
        console.log(`${scriptName}: 检查章节${index + 1}: ${JSON.stringify(chapter).substring(0, 100)}...`);
        
        if (chapter.knowledge) {
            console.log(`${scriptName}: 章节${index + 1}有knowledge数据`);
            if (chapter.knowledge.videoResourceUrl) {
                console.log(`${scriptName}: 章节${index + 1}有videoResourceUrl: ${chapter.knowledge.videoResourceUrl}`);
                
                let videoUrl = chapter.knowledge.videoResourceUrl;
                
                // 验证视频URL有效性
                if (videoUrl && 
                    videoUrl !== "https://oss-resources.hnheibaidian.com/file/video/" &&
                    !videoUrl.endsWith("/file/video/") &&
                    videoUrl.length > 50) {
                    
                    console.log(`${scriptName}: 章节${index + 1}视频URL有效，添加到列表`);
                    
                    videoList.push({
                        title: chapter.knowledge.title || `章节${index + 1}`,
                        videoUrl: videoUrl,
                        chapterId: chapter.id,
                        knowledgeId: chapter.knowledgeId,
                        videoTimeSeconds: chapter.knowledge.videoTimeSeconds || 0,
                        price: chapter.knowledge.price || 0,
                        index: index + 1
                    });
                    
                    console.log(`${scriptName}: 添加视频 - ${chapter.knowledge.title}`);
                } else {
                    console.log(`${scriptName}: 章节${index + 1}视频URL无效: 长度${videoUrl ? videoUrl.length : 0}, 内容: ${videoUrl}`);
                }
            } else {
                console.log(`${scriptName}: 章节${index + 1}没有videoResourceUrl`);
            }
        } else {
            console.log(`${scriptName}: 章节${index + 1}没有knowledge数据`);
        }
    });
    
    console.log(`${scriptName}: 遍历完成，总共提取到 ${videoList.length} 个有效视频`);
    
    // 发送视频提取结果通知
    $notify(
        `${scriptName} - 提取结果`, 
        `从${chapters.length}个章节中提取到${videoList.length}个视频`,
        videoList.length > 0 ? "准备发送视频通知..." : "未找到有效视频"
    );
    
    if (videoList.length > 0) {
        // 简化的视频通知 - 直接发送，不用延迟
        videoList.forEach((video, index) => {
            $notify(
                `📺 ${video.title}`,
                `课程${courseId} - 视频${index + 1}`,
                "点击观看",
                { "open-url": video.videoUrl }
            );
            
            console.log(`${scriptName}: 发送通知 [${index + 1}] ${video.title}`);
        });
        
        // 简化的汇总通知
        $notify(
            `📊 课程${courseId}`,
            `共找到${videoList.length}个视频`,
            "所有视频通知已发送"
        );
        
        console.log(`${scriptName}: 汇总 - 共${videoList.length}个视频`);
        
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
            `课程${courseId} 无视频`,
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
