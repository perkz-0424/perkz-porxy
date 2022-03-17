declare const createProxyMiddleware: any;
declare const address: any;
declare const chalk: any;
declare const http: any;
declare const express: any;
declare const cookieParser: any;
declare const morgan: any;
declare const go: (method: string) => (callback: any) => any;
declare const request: {
    get: (cb: any) => any;
    post: (cb: any) => any;
    put: (cb: any) => any;
    delete: (cb: any) => any;
};
declare function start(port: number, devService: {
    [p: string]: any;
}): void;
declare function server(port: number, serve: any): void;
