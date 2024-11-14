// request.js
const axios = require('axios');

// 创建 axios 实例
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000', // 可以根据需要修改
    timeout: 10000, // 请求超时时间（毫秒）
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
axiosInstance.interceptors.request.use(
    (config) => {
        // 在这里可以添加请求头或其他自定义逻辑
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
    (response) => {
        return response.data; // 返回响应数据
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 导出请求方法
module.exports = {
    get: (url, config) => axiosInstance.get(url, config),
    post: (url, data, config) => axiosInstance.post(url, data, config),
    put: (url, data, config) => axiosInstance.put(url, data, config),
    delete: (url, config) => axiosInstance.delete(url, config),
    axiosInstance // 如果需要自定义使用实例
};
