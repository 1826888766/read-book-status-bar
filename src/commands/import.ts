import { ReadBook } from "../main";
import { commands, window, StatusBarAlignment, StatusBarItem } from "vscode";
var handler: ReadBook,importStatusBarItem: StatusBarItem;

function _import() {
    let command = "read-book-status-bar.import";
    importStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right,60);
    importStatusBarItem.text = '$(add) 导入';
    importStatusBarItem.tooltip = '导入';
    importStatusBarItem.command = command;
    importStatusBarItem.show();
    handler.context.subscriptions.push(importStatusBarItem);
    commands.registerCommand(command, () => {
       
    });
}
// 初始化阅读控制
function init() {
    _import();
}

export default {
    run(app: ReadBook) {
        handler = app;
        init();
    }
};