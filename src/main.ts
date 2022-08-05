// 命令注册
import * as vscode from "vscode";
import log from "./utils/log";
import fs = require('fs');
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
        vscode.workspace.workspaceFolders?.map((item,index) => {
            vscode.workspace.workspaceFile;
            let uri = vscode.Uri.parse(item.uri.path + '/.domain');
            vscode.workspace.findFiles('.domain/*.json').then(res => {
                if (res.length !== 0) {

                    fs.mkdir(uri.path.replace('/',''),(res)=>{
                        fs.writeFileSync(uri.path.replace('/','')+'/test.json','{\n'+
                            '"name": "笔趣阁",'+
                            '"url": "https://www.xbiquge.so",'+
                            '"searchUrlChartSet":"gbk",'+
                            '"searchUrl": "/modules/article/search.php?searchkey={name}",'+
                            '"parseSearch": {'+
                              '"list": "#main li",'+
                              '"url": ".s2 a:href",'+
                              '"content": ".s2"'+
                            '},'+
                            '"parseCatalog": {'+
                            '  "list": "dd a",'+
                            '  "url": ":href",'+
                            '  "content": ""'+
                            '},'+
                            '"parseContent": {'+
                            '  "content": "#content"'+
                            '}'+
                          '}');
                    });
                }

            });
        });
        vscode.workspace.onDidChangeWorkspaceFolders(e => {

            console.log(e.added);
            console.log(e.removed);
            // TODO
        });
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