import * as vscode from "vscode";
import { ReadBook } from "../main";
var handler :ReadBook;
var output:vscode.OutputChannel;
export default {
    run(app:ReadBook){
        handler = app;
        output = vscode.window.createOutputChannel("状态栏读书");
    },
    info(msg: string) {
        this.write('info', msg);
    },

    write(type: string, msg: string, ...params: any[]) {
        output.appendLine(`[read-book][${type}] : ${msg} `+JSON.stringify(params));
    },
    
    error(msg: string) {
        this.write('error', msg);
    },
    warn(msg: string) {
        this.write('warn', msg);
    }
};