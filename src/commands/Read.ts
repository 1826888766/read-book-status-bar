import { ReadBook } from "../main";
import { commands, StatusBarAlignment, StatusBarItem, ViewColumn, window } from "vscode";

var handler: ReadBook;

// 初始化阅读控制
function init() {
    // {
    //     text: "$(chevron-right)",
    //     align: StatusBarAlignment.Left,
    //     tooltip: "下一章",
    //     command: "read-book-status-bar.next",
    //     click() {

    //     }
    // },
    commands.registerCommand("read-book-status-bar.next",()=>{

    });
    // {
    //     text: "$(chevron-left)",
    //     align: StatusBarAlignment.Left,
    //     tooltip: "上一章",
    //     command: "read-book-status-bar.pre",
    //     click() {

    //     }
    // }
    commands.registerCommand("read-book-status-bar.pre",()=>{
        
    });
}

export default {
    run(app: ReadBook) {
        handler = app;
        init();
    }
};