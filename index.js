"use strict";
const { createProxyMiddleware } = require("http-proxy-middleware");
const address = require("address");
// const net = require("net");
const chalk = require("react-dev-utils/chalk");
const http = require("http");
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const go = (method) => ((callback) => {
    const router = require("express").Router();
    router[method]("/", (incomingMessage, serverResponse) => {
        callback(incomingMessage, serverResponse);
    });
    return router;
});
const request = {
    get: (cb) => go("get")(async (incomingMessage, serverResponse) => {
        const v = await cb(incomingMessage);
        return serverResponse.send(v);
    }),
    post: (cb) => go("post")(async (incomingMessage, serverResponse) => {
        const v = await cb(incomingMessage);
        return serverResponse.send(v);
    }),
    put: (cb) => go("put")(async (incomingMessage, serverResponse) => {
        const v = await cb(incomingMessage);
        return serverResponse.send(v);
    }),
    delete: (cb) => go("delete")(async (incomingMessage, serverResponse) => {
        const v = await cb(incomingMessage);
        return serverResponse.send(v);
    }),
};
// 检测端口被占用
// function portCheck(
//   port: number,
//   callback: (newPort: number) => any
// ) {
//   const server = net.createServer().listen(port);
//   server.on("listening", () => {
//     server.close();
//     callback(port);
//   });
//
//   server.on("error", (err: any) => {
//     err.code === "EADDRINUSE" ? portCheck(port + 1, callback) : callback(port);
//   });
// }
function start(port, devService) {
    const serve = {
        get: [], post: [], delete: [], put: []
    };
    // 分拣服务
    Object.entries(devService).forEach(([key, value]) => {
        const keys = (key.split(":")).filter(Boolean);
        if (keys.length === 2 && ["get", "post", "delete", "put"].includes((keys[0]).toLowerCase())) {
            serve[keys[0]].push({
                path: keys[1],
                value
            });
        }
    });
    server(port, serve);
}
function server(port, serve) {
    const app = express();
    app.set("view engine", "ejs");
    app.use(morgan("dev"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    Object.entries(serve).forEach(([method, array]) => {
        array.forEach((item) => {
            app.use(item.path, request[method](() => JSON.stringify(item.value)));
        });
    });
    app.use((incomingMessage, response) => {
        response.send(JSON.stringify({ message: "not found" }));
    });
    app.use((error, incomingMessage, response) => {
        response.locals.message = error.message;
        response.locals.error = incomingMessage.app.get("env") === "development" ? error : {};
        response.status(error.status || 500);
        response.render("error");
        response.send(JSON.stringify({ message: "error" }));
    });
    app.set("port", port);
    const server = http.createServer(app);
    server.listen(port);
}
module.exports = (proxy, devService, defaultPort = 4001, defaultKeys = "/testApi") => {
    return function (app) {
        if (proxy && typeof proxy === "object") {
            Object.keys(proxy).forEach((key) => {
                const pathRewrite = {};
                pathRewrite[`^${key}`] = "";
                app.use(key, createProxyMiddleware({
                    target: proxy[key],
                    changeOrigin: true,
                    pathRewrite,
                }));
            });
            // 开启测试服务
            if (devService && typeof devService === "object" && (Object.keys(devService)).length) {
                console.log(chalk.cyanBright("正在开启测试服务..."));
                // TODO: 端口被占用
                const pathRewrite = {};
                pathRewrite[`^${defaultKeys}`] = "";
                app.use(defaultKeys, createProxyMiddleware({
                    target: `http://${address.ip()}:${defaultPort}/`,
                    changeOrigin: true,
                    pathRewrite,
                }));
                start(defaultPort, devService);
            }
        }
    };
};
//# sourceMappingURL=index.js.map