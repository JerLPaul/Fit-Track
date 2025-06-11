const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/',
        createProxyMiddleware({
            target: 'https://fit-track-backend.onrender.com/',
            changeOrigin: true,
        })
    );
};