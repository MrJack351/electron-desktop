import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建一个 axios 实例
const service = axios.create({
    baseURL: import.meta.env.VITE_BASE_API, // 使用 import.meta.env 访问 Vite 环境变量
    timeout: 5000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        // 在发送请求之前做些什么，比如添加 token
        // const token = localStorage.getItem('token');
        // if (token) {
        //     config.headers['Authorization'] = `Bearer ${token}`; // 将 token 添加到请求头
        // }
        return config;
    },
    (error) => {
        // 对请求错误做些什么
        ElMessage.error('请求发送失败，请检查网络或重试');
        console.error('请求错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (response) => {
        // 对响应数据做点什么
        const res = response.data;
        // 可以根据返回状态码处理逻辑，比如判断是否请求成功
        if (res.code !== 200) {
            ElMessage.error(res.msg || '请求失败'); // 使用 Element Plus 显示错误信息
            console.error('请求失败:', res.msg);
            return Promise.reject(new Error(res.msg || 'Error'));
        }
        return res;
    },
    (error) => {
        // 对响应错误做点什么
        if (error.response) {
            // 根据响应状态码自定义错误提示
            const { status, data } = error.response;
            const errorMessage = data.message || `请求失败，状态码: ${status}`;
            ElMessage.error(errorMessage);
        } else {
            ElMessage.error('网络错误，请检查您的网络连接');
        }
        console.error('响应错误:', error);
        return Promise.reject(error);
    }
);

// 导出请求方法
export function get(url, params = {}) {
    return service.get(url, { params });
}

export function post(url, data = {}) {
    return service.post(url, data);
}

export function put(url, data = {}) {
    return service.put(url, data);
}

export function del(url, params = {}) {
    return service.delete(url, { params });
}
