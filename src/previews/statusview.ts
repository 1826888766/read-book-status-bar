import { ReadBook } from "../main";
import { StatusBarAlignment, StatusBarItem, window } from "vscode";
var handler: ReadBook, previewStatusBarItem: StatusBarItem;
function init() {
    previewStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 0);
    previewStatusBarItem.text = '等待加载书籍...';
    previewStatusBarItem.show();
    handler.context.subscriptions.push(previewStatusBarItem);
}
export default {
    run(app: ReadBook) {
        handler = app;
        init();
    },
    hide(){
        previewStatusBarItem.hide();
    },
    show(){
        previewStatusBarItem.show();
    },
    tip(msg:string){
        previewStatusBarItem.tooltip = msg;
    },
    async write(msg: string) {
        previewStatusBarItem.text = msg;
    }
};