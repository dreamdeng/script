/*
使用说明：
1. 将此脚本保存为 .js 文件
2. 在 QuantumultX 配置中添加以下重写规则：

[rewrite_local]
^https://mapp-03\.hnheibaidian\.com/.*chapters.* url script-response-body video_extractor.js

[mitm]
hostname = mapp-03.hnheibaidian.com

3. 重启 QuantumultX 并访问对应页面
4. 点击章节时会自动提取视频链接并通过通知显示
5. 详细信息可在 QuantumultX 日志中查看

注意事项：
- 请确保已开启 MITM 和重写功能
- 根据实际API响应调整匹配规则
- 视频链接格式可能需要根据实际情况调整
*/

const scriptName = "视频链接提取器";

// 获取响应体
let body = $response.body;
let obj;

try {
    obj = JSON.parse(body);
} catch (e) {
    console.log(`${scriptName}: JSON解析失败`);
    $done({});
}

// 检查是否包含chapters数据
if (obj && obj.record && obj.record.chapters) {
    let chapters = obj.record.chapters;
    let videoLinks = [];
    let chapterTitles = [];
    
    // 遍历所有章节，提取视频链接
    chapters.forEach((chapter, index) => {
        if (chapter.knowledge && chapter.knowledge.videoResourceUrl) {
            let title = chapter.knowledge.title || `章节${index + 1}`;
            let videoUrl = chapter.knowledge.videoResourceUrl;
            
            // 如果视频URL不完整，可能需要拼接完整路径
            if (videoUrl && !videoUrl.startsWith('http')) {
                // 根据实际情况调整URL拼接逻辑
                videoUrl = `https://oss-resources.hnheibaidian.com${videoUrl}`;
            }
            
            if (videoUrl && videoUrl !== "https://oss-resources.hnheibaidian.com/file/video/") {
                videoLinks.push(videoUrl);
                chapterTitles.push(title);
            }
        }
    });
    
    // 如果找到视频链接，显示通知
    if (videoLinks.length > 0) {
        let message = "";
        let allLinks = [];
        
        videoLinks.forEach((link, index) => {
            let title = chapterTitles[index];
            message += `${title}: ${link}\n`;
            allLinks.push(link);
        });
        
        // 显示QuantumultX通知
        $notify(
            scriptName, 
            `找到 ${videoLinks.length} 个视频链接`, 
            message.substring(0, 100) + (message.length > 100 ? "..." : "")
        );
        
        // 将链接复制到剪贴板（如果只有一个链接）
        if (videoLinks.length === 1) {
            // 注意：QuantumultX可能不支持直接复制到剪贴板
            console.log(`视频链接: ${videoLinks[0]}`);
        }
        
        // 在控制台输出所有链接，方便查看
        console.log(`${scriptName}: 提取到的视频链接:`);
        allLinks.forEach((link, index) => {
            console.log(`${chapterTitles[index]}: ${link}`);
        });
    } else {
        $notify(scriptName, "未找到视频链接", "当前章节可能没有视频内容");
    }
}

// 返回原始响应
$done({});

