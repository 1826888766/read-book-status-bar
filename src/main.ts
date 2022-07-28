// 命令注册
import * as vscode from "vscode";
export interface Callback {
    run: Function
}


// 目录注册
export class ReadBook {
    version: string = "2.0.0";

    context:vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext){
        this.context = context;
        this.init();
    }

    init() {
        // 初始化命令
        this.use(() => import("./commands"));
        this.use(() => import("./providers"));
    }

    use(fun: any) {
        if (typeof fun.then === "function") {
            fun.then((res: Callback) => {
                res.run();
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