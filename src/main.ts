// 命令注册
import * as vscode from "vscode";
import log from "./utils/log";
import fs = require('fs');
import storage from "./storage/storage";
export interface Callback {
    run: Function
}


// 目录注册
export class ReadBook {
    version: string = "2.0.0";

    context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        log.info('init version:' + this.version);
        this.init();
    }
    
    init() {

        // 初始化命令
        this.use(import("./commands"));
        

        

    }

    use(fun: any) {
        if (typeof fun.then === "function") {
            fun.then((res: any) => {
                res.default.run(this);
            });
        } else if (typeof fun.run === "function") {
            fun.run(this);
        }
    }

    /**
         * 销毁方法
         */
    public dispose() {

    }
}