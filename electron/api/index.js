const request = require('../utils/request'); // 导入工具类
const { app} = require('electron');
const Log = require('ee-core/log');
//获取语言列表
async function getLanguages() {
    try {
        // 调用封装好的 get 请求，发送到指定的端点
        return await request.get('/api/languageList/languageList'); // 返回数据以供其他地方使用
    } catch (error) {
        throw error; // 抛出错误以便调用方处理
    }
}
// 实现 translateText 函数
async function translateText(text,localLanguage, targetLanguage) {
    const requestBody = {
        fromLang: localLanguage, // 假设源语言为本地语言
        targetLang: targetLanguage,
        text: text,
        authCode: app.authCode, // 假设 authCode 已定义在 window 中
    };
    try {
        // 使用封装好的 request 模块的 POST 方法发送数据
        const response = await request.post('/api/translate', requestBody);
        Log.info('响应结果：',response)
        // 判断响应状态码
        if (response.code === 200) {
            return response.data; // 返回翻译结果
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}
// 导出业务请求函数
module.exports = {
    translateText,
    getLanguages
};
