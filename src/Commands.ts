import { commands, StatusBarAlignment, StatusBarItem, ViewColumn, window } from "vscode";
import { BookProvider } from "./provider/BookProvider";
import { CatalogProvider } from "./provider/CatalogProvider";
const configs = [
    {
        text: "$(add)",
        align: StatusBarAlignment.Left,
        tooltip: "导入本地书籍",
        command: "read-book-status-bar.import",
        click() {
            var res = window.showOpenDialog({
                title:"请选择小说文本txt",
                filters:{
                  "file":['txt']
                }
              });
              res.then((file:any)=>{
                // this.import(file[0].path);
              });
        }
    },
    {
        text: "$(book)",
        align: StatusBarAlignment.Left,
        tooltip: "正在初始化...",
        command: "read-book-status-bar.list",
        click() {

        }
    },
    {
        text: "$(chevron-right)",
        align: StatusBarAlignment.Left,
        tooltip: "下一章",
        command: "read-book-status-bar.next",
        click() {

        }
    },
    {
        text: "$(chevron-left)",
        align: StatusBarAlignment.Left,
        tooltip: "上一章",
        command: "read-book-status-bar.pre",
        click() {

        }
    },
    {
        text: "$(search)",
        align: StatusBarAlignment.Right,
        tooltip: "搜索",
        command: "read-book-status-bar.search",
        click() {

        }
    }, {
        text: "$(debug-start)",
        align: StatusBarAlignment.Right,
        tooltip: "开始",
        command: "read-book-status-bar.start",
        click() {

        }
    }, {
        text: "$(debug-pause)",
        align: StatusBarAlignment.Left,
        tooltip: "停止",
        command: "read-book-status-bar.stop",
        click() {

        }
    },{
        command:"read-book-status-bar.refresh",
        click() {

        }
    },{
        command:"read-book-status-bar.bosskey",
        click() {

        }
    },{
        command:"read-book-status-bar.up",
        click() {

        }
    },{
        command:"read-book-status-bar.down",
        click() {

        }
    },{
        command:"read-book-status-bar.webview",
        click(e:any) {
            var webViewPanel =  window.createWebviewPanel("read-book-status-bar",e.label,ViewColumn.Two,{
                enableScripts:true,
                retainContextWhenHidden:false,
                
            });
            webViewPanel.webview.html = `<html><head><style>iframe{position:absolute;border: none;width: 100%;height: 100%}::-webkit-scrollbar{display: none;}</style></head><body><iframe width="100%" height="100%" src="${e.element.url}" border="0"></iframe></body></html>`;
        }
    },{
        command:"read-book-status-bar.select-book",
        click() {

        }
    },{
        command:"read-book-status-bar.select-catalog",
        click() {

        }
    }
];

export default {
    registerCommand() {
        for (var key in configs) {
            commands.registerCommand(configs[key].command,(e:any)=> {configs[key].click(e);});
        }

        var bookProvider = new BookProvider();
        var catalogProvider = new CatalogProvider("");
        window.registerTreeDataProvider('books', bookProvider);
        window.registerTreeDataProvider('catalog', catalogProvider);
    }
};