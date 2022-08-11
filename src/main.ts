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
        log.run(this);
        this.init();
    }
    
    init() {
        // 初始化命令
        this.use(import("./commands"));
        log.info("初始化完成");
    }

    use(fun: any) {
        try{
            if (typeof fun.then === "function") {
                fun.then((res: any) => {
                    res.default.run(this);
                });
            } else if (typeof fun.run === "function") {
                fun.run(this);
            }
        }catch(e){
            log.warn(JSON.stringify(e));
        }
        
    }

    /**
         * 销毁方法
         */
    public dispose() {

    }
}