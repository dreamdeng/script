/*
[rewrite_local]
^https:\/\/zs\.mifxcx\.com\/public\/index\.php\/api\/app\/courseInfo url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/course_dcrypt.js

[mitm]
hostname = zs.mifxcx.com
*/

const url = $request.url;
const body = $response.body;

// 检查是否为目标API
if (url.includes("/api/app/courseInfo")) {
    try {
        let obj = JSON.parse(body);
        if (obj.data && obj.data.menu && Array.isArray(obj.data.menu)) {
            console.log("成功拦截到课程信息API，开始解密URL...");

            // 遍历课程菜单
            obj.data.menu.forEach((item, index) => {
                // 简单检查一下URL是否是加密格式
                if (item.url && typeof item.url === 'string' && item.url.length > 20) { 
                    console.log(`正在处理第 ${index + 1} 个课程: ${item.title}`);
                    const originalUrl = item.url;
                    // 调用解密函数
                    const decryptedUrl = decrypt_url(originalUrl);

                    if (decryptedUrl !== originalUrl) {
                        console.log(`解密成功: ${decryptedUrl}`);
                        
                        // 为每个解密成功的链接生成一个可点击的通知
                        $notify(
                            "课程链接已解密",
                            `课程: ${item.title}`,
                            "点击此通知可在浏览器中打开视频链接。",
                            { "open-url": decryptedUrl }
                        );

                        // 同时保留App内直接播放的功能
                        item.url = decryptedUrl;
                    } else {
                        console.log(`解密失败或无需解密: ${item.title}`);
                    }
                }
            });
            
            console.log("所有URL处理完成。");
            // 将修改后的对象转换回JSON字符串并返回给App
            $done({ body: JSON.stringify(obj) });

        } else {
            console.log("响应体中未找到 'data.menu' 数组，脚本不执行任何操作。");
            $notify(
                "视频链接提取失败",
                "数据格式错误",
                "请检查接口响应数据，未找到课程列表。"
            );
            $done({});
        }
    } catch (e) {
        console.log("脚本处理出错:", e);
        $notify(
            "视频链接提取失败",
            "脚本执行异常",
            `错误详情: ${e.message}`
        );
        $done({});
    }
} else {
    $done({});
}

/**
 * 主解密函数，执行完整的解密流程
 * @param {string} encryptedStr - 待解密的字符串
 * @returns {string} - 解密后的明文字符串
 */
function decrypt_url(encryptedStr) {
    const key = "fgr23g1rehb1er";
    try {
        // 过程 1: 第一次 Base64 解码
        let step1_result = base64_decode(encryptedStr);
        // 过程 2: XOR 解密
        let step2_result = xor_decrypt(step1_result, key);
        // 过程 3: 第二次 Base64 解码
        let final_result = base64_decode(step2_result);
        return final_result;
    } catch (e) {
        console.log(`解密 '${encryptedStr.substring(0, 20)}...' 时出错:`, e);
        return encryptedStr; // 解密失败时返回原字符串
    }
}

/**
 * XOR 解密函数
 * @param {string} data - 经过Base64解码后的数据
 * @param {string} key - 密钥
 * @returns {string} - XOR解密后的字符串
 */
function xor_decrypt(data, key) {
    let result = "";
    for (let i = 0; i < data.length; i++) {
        const keyChar = key.charCodeAt(i % key.length);
        const dataChar = data.charCodeAt(i);
        result += String.fromCharCode(dataChar ^ keyChar);
    }
    return result;
}

/**
 * 标准 Base64 解码函数
 * @param {string} e - Base64编码的字符串
 * @returns {string} - 解码后的字符串
 */
function base64_decode(e) {
    var t, n, r, o, i, a, s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        c = 0,
        u = 0,
        l = [];
    if (!e) return e;
    e += "";
    do {
        t = (a = s.indexOf(e.charAt(c++)) << 18 | s.indexOf(e.charAt(c++)) << 12 | (o = s.indexOf(e.charAt(c++))) << 6 | (i = s.indexOf(e.charAt(c++)))) >> 16 & 255, n = a >> 8 & 255, r = 255 & a, l[u++] = 64 == o ? String.fromCharCode(t) : 64 == i ? String.fromCharCode(t, n) : String.fromCharCode(t, n, r)
    } while (c < e.length);
    return l.join("");
}
