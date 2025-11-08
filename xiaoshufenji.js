/*
[rewrite_local]
# 用户信息接口 - 修改会员到期时间
^https:\/\/lvl\.xiaoshufenji\.com\/prod-api\/frontend\/user\/info\?version=.* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/xiaoshufenji.js

# 文章列表接口 - 修改免费和今日状态
^https:\/\/lvl\.xiaoshufenji\.com\/prod-api\/frontend\/article\/* url script-response-body https://raw.githubusercontent.com/dreamdeng/script/refs/heads/main/xiaoshufenji.js

[mitm]
hostname = lvl.xiaoshufenji.com
*/

/**
 * Quantumult X 重写脚本
 * 功能1：修改用户信息 - 会员到期时间
 * 功能2：修改文章列表 - 免费和今日状态
 */

// ==================== SM4 加密算法实现 ====================

const SM4_SBOX = [
    0xd6, 0x90, 0xe9, 0xfe, 0xcc, 0xe1, 0x3d, 0xb7, 0x16, 0xb6, 0x14, 0xc2, 0x28, 0xfb, 0x2c, 0x05,
    0x2b, 0x67, 0x9a, 0x76, 0x2a, 0xbe, 0x04, 0xc3, 0xaa, 0x44, 0x13, 0x26, 0x49, 0x86, 0x06, 0x99,
    0x9c, 0x42, 0x50, 0xf4, 0x91, 0xef, 0x98, 0x7a, 0x33, 0x54, 0x0b, 0x43, 0xed, 0xcf, 0xac, 0x62,
    0xe4, 0xb3, 0x1c, 0xa9, 0xc9, 0x08, 0xe8, 0x95, 0x80, 0xdf, 0x94, 0xfa, 0x75, 0x8f, 0x3f, 0xa6,
    0x47, 0x07, 0xa7, 0xfc, 0xf3, 0x73, 0x17, 0xba, 0x83, 0x59, 0x3c, 0x19, 0xe6, 0x85, 0x4f, 0xa8,
    0x68, 0x6b, 0x81, 0xb2, 0x71, 0x64, 0xda, 0x8b, 0xf8, 0xeb, 0x0f, 0x4b, 0x70, 0x56, 0x9d, 0x35,
    0x1e, 0x24, 0x0e, 0x5e, 0x63, 0x58, 0xd1, 0xa2, 0x25, 0x22, 0x7c, 0x3b, 0x01, 0x21, 0x78, 0x87,
    0xd4, 0x00, 0x46, 0x57, 0x9f, 0xd3, 0x27, 0x52, 0x4c, 0x36, 0x02, 0xe7, 0xa0, 0xc4, 0xc8, 0x9e,
    0xea, 0xbf, 0x8a, 0xd2, 0x40, 0xc7, 0x38, 0xb5, 0xa3, 0xf7, 0xf2, 0xce, 0xf9, 0x61, 0x15, 0xa1,
    0xe0, 0xae, 0x5d, 0xa4, 0x9b, 0x34, 0x1a, 0x55, 0xad, 0x93, 0x32, 0x30, 0xf5, 0x8c, 0xb1, 0xe3,
    0x1d, 0xf6, 0xe2, 0x2e, 0x82, 0x66, 0xca, 0x60, 0xc0, 0x29, 0x23, 0xab, 0x0d, 0x53, 0x4e, 0x6f,
    0xd5, 0xdb, 0x37, 0x45, 0xde, 0xfd, 0x8e, 0x2f, 0x03, 0xff, 0x6a, 0x72, 0x6d, 0x6c, 0x5b, 0x51,
    0x8d, 0x1b, 0xaf, 0x92, 0xbb, 0xdd, 0xbc, 0x7f, 0x11, 0xd9, 0x5c, 0x41, 0x1f, 0x10, 0x5a, 0xd8,
    0x0a, 0xc1, 0x31, 0x88, 0xa5, 0xcd, 0x7b, 0xbd, 0x2d, 0x74, 0xd0, 0x12, 0xb8, 0xe5, 0xb4, 0xb0,
    0x89, 0x69, 0x97, 0x4a, 0x0c, 0x96, 0x77, 0x7e, 0x65, 0xb9, 0xf1, 0x09, 0xc5, 0x6e, 0xc6, 0x84,
    0x18, 0xf0, 0x7d, 0xec, 0x3a, 0xdc, 0x4d, 0x20, 0x79, 0xee, 0x5f, 0x3e, 0xd7, 0xcb, 0x39, 0x48
];

const SM4_FK = [0xa3b1bac6, 0x56aa3350, 0x677d9197, 0xb27022dc];
const SM4_CK = [
    0x00070e15, 0x1c232a31, 0x383f464d, 0x545b6269, 0x70777e85, 0x8c939aa1, 0xa8afb6bd, 0xc4cbd2d9,
    0xe0e7eef5, 0xfc030a11, 0x181f262d, 0x343b4249, 0x50575e65, 0x6c737a81, 0x888f969d, 0xa4abb2b9,
    0xc0c7ced5, 0xdce3eaf1, 0xf8ff060d, 0x141b2229, 0x30373e45, 0x4c535a61, 0x686f767d, 0x848b9299,
    0xa0a7aeb5, 0xbcc3cad1, 0xd8dfe6ed, 0xf4fb0209, 0x10171e25, 0x2c333a41, 0x484f565d, 0x646b7279
];

function rotl(x, n) {
    return ((x << n) | (x >>> (32 - n))) >>> 0;
}

function sm4Tau(a) {
    return ((SM4_SBOX[(a >>> 24) & 0xFF] << 24) |
            (SM4_SBOX[(a >>> 16) & 0xFF] << 16) |
            (SM4_SBOX[(a >>> 8) & 0xFF] << 8) |
            SM4_SBOX[a & 0xFF]) >>> 0;
}

function sm4L(b) {
    return (b ^ rotl(b, 2) ^ rotl(b, 10) ^ rotl(b, 18) ^ rotl(b, 24)) >>> 0;
}

function sm4LPrime(b) {
    return (b ^ rotl(b, 13) ^ rotl(b, 23)) >>> 0;
}

function sm4T(x) {
    return sm4L(sm4Tau(x));
}

function sm4TPrime(x) {
    return sm4LPrime(sm4Tau(x));
}

function sm4KeySchedule(key) {
    const MK = [];
    for (let i = 0; i < 4; i++) {
        MK[i] = (key[i * 4] << 24) | (key[i * 4 + 1] << 16) | 
                (key[i * 4 + 2] << 8) | key[i * 4 + 3];
    }
    
    const K = new Array(36);
    const rk = new Array(32);
    
    for (let i = 0; i < 4; i++) {
        K[i] = (MK[i] ^ SM4_FK[i]) >>> 0;
    }
    
    for (let i = 0; i < 32; i++) {
        K[i + 4] = (K[i] ^ sm4TPrime((K[i + 1] ^ K[i + 2] ^ K[i + 3] ^ SM4_CK[i]) >>> 0)) >>> 0;
        rk[i] = K[i + 4];
    }
    
    return rk;
}

function sm4EncryptBlock(input, output, rk) {
    const X = new Array(36);
    
    for (let i = 0; i < 4; i++) {
        X[i] = (input[i * 4] << 24) | (input[i * 4 + 1] << 16) | 
               (input[i * 4 + 2] << 8) | input[i * 4 + 3];
    }
    
    for (let i = 0; i < 32; i++) {
        X[i + 4] = (X[i] ^ sm4T((X[i + 1] ^ X[i + 2] ^ X[i + 3] ^ rk[i]) >>> 0)) >>> 0;
    }
    
    for (let i = 0; i < 4; i++) {
        const val = X[35 - i];
        output[i * 4] = (val >>> 24) & 0xFF;
        output[i * 4 + 1] = (val >>> 16) & 0xFF;
        output[i * 4 + 2] = (val >>> 8) & 0xFF;
        output[i * 4 + 3] = val & 0xFF;
    }
}

function hexToBytes(hex) {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
}

function bytesToHex(bytes) {
    return bytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function stringToBytes(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        bytes.push(code & 0xFF);
    }
    return bytes;
}

function bytesToString(bytes) {
    return bytes.map(b => String.fromCharCode(b)).join('');
}

function addPadding(data) {
    const padding = 16 - (data.length % 16);
    return [...data, ...new Array(padding).fill(padding)];
}

function removePadding(data) {
    const padding = data[data.length - 1];
    if (padding < 1 || padding > 16) return data;
    
    for (let i = 0; i < padding; i++) {
        if (data[data.length - 1 - i] !== padding) return data;
    }
    
    return data.slice(0, -padding);
}

function sm4Encrypt(plaintext, keyHex) {
    const key = hexToBytes(keyHex);
    const plaintextBytes = typeof plaintext === 'string' ? stringToBytes(plaintext) : plaintext;
    const paddedData = addPadding(plaintextBytes);
    
    const rk = sm4KeySchedule(key);
    const ciphertext = [];
    
    for (let i = 0; i < paddedData.length; i += 16) {
        const block = paddedData.slice(i, i + 16);
        const encrypted = new Array(16);
        sm4EncryptBlock(block, encrypted, rk);
        ciphertext.push(...encrypted);
    }
    
    return bytesToHex(ciphertext);
}

function sm4Decrypt(ciphertextHex, keyHex) {
    const key = hexToBytes(keyHex);
    const ciphertext = hexToBytes(ciphertextHex);
    
    const rk = sm4KeySchedule(key);
    const rkRev = rk.slice().reverse();
    
    const plaintext = [];
    
    for (let i = 0; i < ciphertext.length; i += 16) {
        const block = ciphertext.slice(i, i + 16);
        const decrypted = new Array(16);
        sm4EncryptBlock(block, decrypted, rkRev);
        plaintext.push(...decrypted);
    }
    
    const unpaddedData = removePadding(plaintext);
    return bytesToString(unpaddedData);
}

// ==================== 工具函数 ====================

const KEY = "e49a515a1cec7a1cf2340f3abe8f7001";

function modifyArticlesFreeStatus(articles) {
    if (!Array.isArray(articles)) return articles;
    
    let modifiedCount = 0;
    articles.forEach(article => {
        if (article.free !== true) {
            article.free = true;
            modifiedCount++;
        }
        if (article.today !== true) {
            article.today = true;
        }
    });
    
    console.log(`✅ 修改了 ${modifiedCount} 篇文章为免费状态`);
    return articles;
}

function deepModifyArticles(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
        return obj.map(item => deepModifyArticles(item));
    }
    
    // 如果对象有 free 或 today 字段，修改它们
    if ('free' in obj || 'today' in obj) {
        obj.free = true;
        obj.today = true;
    }
    
    // 递归处理所有属性
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            obj[key] = deepModifyArticles(obj[key]);
        }
    }
    
    return obj;
}

// ==================== 主处理逻辑 ====================

function handleResponse() {
    try {
        const url = $request.url;
        const body = $response.body;
        
        console.log("="*50);
        console.log("🔗 请求URL:", url);
        
        // 判断是哪个接口
        if (url.includes('/user/info')) {
            handleUserInfo(body);
        } else if (url.includes('/article/home')) {
            handleArticleHome(body);
        } else {
            console.log("⚠️ 未匹配的接口");
            $done({});
        }
        
    } catch (error) {
        console.log("❌ 处理失败:", error.message);
        console.log("错误堆栈:", error.stack);
        $done({});
    }
}

function handleUserInfo(body) {
    console.log("📝 处理用户信息接口");
    
    try {
        const response = JSON.parse(body);
        
        if (response.code !== 200 || !response.data) {
            console.log("⚠️ 响应异常，跳过处理");
            $done({});
            return;
        }
        
        console.log("🔓 解密用户数据...");
        const decrypted = sm4Decrypt(response.data, KEY);
        const userData = JSON.parse(decrypted);
        
        console.log("📝 原始会员到期时间:", userData.memberExpireTime);
        
        userData.memberExpireTime = "2099-11-15";
        userData.memberStatus = 2;
        
        console.log("✅ 修改后会员到期时间:", userData.memberExpireTime);
        
        const modifiedJson = JSON.stringify(userData);
        const encrypted = sm4Encrypt(modifiedJson, KEY);
        
        response.data = encrypted;
        const newBody = JSON.stringify(response);
        
        console.log("🎉 用户信息处理完成");
        $done({ body: newBody });
        
    } catch (error) {
        console.log("❌ 用户信息处理失败:", error.message);
        $done({});
    }
}

function handleArticleHome(body) {
    console.log("📚 处理文章列表接口");
    
    try {
        const response = JSON.parse(body);
        
        if (response.code !== 200 || !response.data) {
            console.log("⚠️ 响应异常，跳过处理");
            $done({});
            return;
        }
        
        console.log("🔓 解密文章数据...");
        const decrypted = sm4Decrypt(response.data, KEY);
        const articleData = JSON.parse(decrypted);
        
        console.log("📊 原始数据结构:", JSON.stringify(articleData, null, 2).substring(0, 500));
        
        // 深度修改所有文章的 free 和 today 状态
        const modifiedData = deepModifyArticles(articleData);
        
        console.log("✅ 已将所有文章设置为免费和今日推荐");
        
        const modifiedJson = JSON.stringify(modifiedData);
        const encrypted = sm4Encrypt(modifiedJson, KEY);
        
        response.data = encrypted;
        const newBody = JSON.stringify(response);
        
        console.log("🎉 文章列表处理完成");
        $done({ body: newBody });
        
    } catch (error) {
        console.log("❌ 文章列表处理失败:", error.message);
        console.log("错误堆栈:", error.stack);
        $done({});
    }
}

// 执行
handleResponse();
