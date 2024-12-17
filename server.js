const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 详细的错误日志
function logError(location, error) {
    console.error('='.repeat(50));
    console.error(`Error at ${location}:`, error);
    console.error('Stack:', error.stack);
    console.error('='.repeat(50));
}

// CORS 配置
app.use(cors());

// 请求日志
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] ${req.method} ${req.url}`);
    console.log('Request Headers:', req.headers);
    next();
});

// 代理中间件
const proxyMiddleware = createProxyMiddleware({
    target: 'https://ark.cn-beijing.volces.com',
    changeOrigin: true,
    pathRewrite: {
        '^/api/ark': '/api/v3'
    },
    onProxyReq: (proxyReq, req) => {
        try {
            // 使用与 curl 相同的认证格式
            const apiKey = '992f74c0-d04e-4e7c-bc3c-cacb7b3834de';
            proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
            proxyReq.setHeader('Content-Type', 'application/json');

            // 移除不必要的头部
            proxyReq.removeHeader('X-Ark-Project');

            // 打印请求信息
            console.log('\nProxy Request:', {
                url: req.url,
                method: req.method,
                headers: proxyReq.getHeaders()
            });
        } catch (error) {
            logError('onProxyReq', error);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        try {
            console.log('\nProxy Response:', {
                status: proxyRes.statusCode,
                headers: proxyRes.headers
            });
        } catch (error) {
            logError('onProxyRes', error);
        }
    }
});

// 应用代理中间件
app.use('/api/ark', proxyMiddleware);

// 静态文件服务
app.use(express.static('.'));

// 全局错误处理
app.use((err, req, res, next) => {
    logError('Global Error', err);
    res.status(500).json({
        error: 'Server Error',
        message: err.message,
        details: err.stack
    });
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
    console.log('\n='.repeat(50));
    console.log(`Server running at http://lxhapi.peking.show`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('='.repeat(50), '\n');
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
    logError('Uncaught Exception', err);
});

process.on('unhandledRejection', (err) => {
    logError('Unhandled Rejection', err);
}); 