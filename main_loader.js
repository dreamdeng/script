// ===============================
// 主控加载脚本 (main_loader.js)
// 自动加载并执行对应的远程脚本
// ===============================

const scriptName = "主控加载器";
const url = $request.url;

console.log(`=================== ${scriptName} 开始执行 ===================`);
console.log(`${scriptName}: 当前URL = ${url}`);

// 远程脚本URL配置
const REMOTE_SCRIPTS = {
    courseList: "https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/video-extractor.js",
    courseDetail: "https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/course_video_extractor.js"
};

// 判断当前是哪个接口
const isCourseListAPI = url.includes('/user/content/course/page');
const isCourseDetailAPI = url.includes('/user/content/course/menu/list/condition-course-id');

console.log(`${scriptName}: 接口类型 - 课程列表:${isCourseListAPI}, 课程详情:${isCourseDetailAPI}`);

// 动态加载并执行远程脚本的函数
function loadAndExecuteScript(scriptUrl, scriptType) {
    console.log(`${scriptName}: 开始加载远程脚本 - ${scriptType}`);
    console.log(`${scriptName}: 脚本URL = ${scriptUrl}`);
    
    // 发送HTTP请求获取远程脚本内容
    let request = {
        url: scriptUrl,
        method: "GET",
        timeout: 10,
        headers: {
            "User-Agent": "QuantumultX"
        }
    };
    
    $task.fetch(request).then(response => {
        if (response.statusCode === 200 && response.body) {
            console.log(`${scriptName}: 远程脚本加载成功 - ${scriptType}`);
            
            try {
                // 执行远程脚本代码
                eval(response.body);
                console.log(`${scriptName}: 远程脚本执行成功 - ${scriptType}`);
            } catch (e) {
                console.log(`${scriptName}: 远程脚本执行失败 - ${scriptType}: ${e}`);
                $notify(`${scriptName}`, `脚本执行失败`, `${scriptType}: ${e.message}`);
            }
        } else {
            console.log(`${scriptName}: 远程脚本加载失败 - ${scriptType}`);
            console.log(`${scriptName}: 状态码: ${response.statusCode}`);
            $notify(`${scriptName}`, `脚本加载失败`, `${scriptType} - 状态码: ${response.statusCode}`);
        }
    }).catch(error => {
        console.log(`${scriptName}: 网络请求失败 - ${scriptType}: ${error}`);
        $notify(`${scriptName}`, `网络请求失败`, `${scriptType}: ${error.message}`);
    });
}

// 根据接口类型加载对应的脚本
if (isCourseListAPI) {
    console.log(`${scriptName}: 检测到课程列表接口，加载缓存脚本`);
    $notify(`${scriptName}`, "检测到课程列表", "正在加载数据缓存脚本...");
    loadAndExecuteScript(REMOTE_SCRIPTS.courseList, "课程列表缓存器");
    
} else if (isCourseDetailAPI) {
    console.log(`${scriptName}: 检测到课程详情接口，加载提取脚本`);
    $notify(`${scriptName}`, "检测到课程详情", "正在加载视频提取脚本...");
    loadAndExecuteScript(REMOTE_SCRIPTS.courseDetail, "视频链接提取器");
    
} else {
    console.log(`${scriptName}: 未匹配到目标接口`);
    $notify(`${scriptName}`, "接口未匹配", `当前URL不匹配任何目标接口`);
}

console.log(`=================== ${scriptName} 主程序执行完成 ===================`);

// 注意：不要在这里调用 $done({})，让远程脚本来处理
