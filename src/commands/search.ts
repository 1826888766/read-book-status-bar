import { ReadBook } from "../main";
import { commands, window, StatusBarAlignment, ThemeIcon, StatusBarItem, QuickPick, QuickPickItem } from "vscode";
import log from "../utils/log";
import Request from "../https/request";
import  domains, { DomainItem } from "../providers/domain";
var handler: ReadBook, searchStatusBarItem: StatusBarItem, quickPick: QuickPick<QuickPickItem>;
var domain:any;
function search() {
    let command = "read-book-status-bar.search";
    searchStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 91);
    searchStatusBarItem.text = '$(search)';
    searchStatusBarItem.tooltip = '搜索';
    searchStatusBarItem.command = command;
    searchStatusBarItem.show();
    handler.context.subscriptions.push(searchStatusBarItem);
    quickPick = window.createQuickPick();
    quickPick.title = "搜索选择书籍";
    quickPick.placeholder = "请输入书籍名称";
    quickPick.buttons = [{
        tooltip: "上一页",
        iconPath: new ThemeIcon("arrow-left"),
    },
    {
        tooltip: "下一页",
        iconPath: new ThemeIcon("arrow-right"),
    }];
    quickPick.onDidTriggerButton((e)=>{
        log.info(e.tooltip||""); 
    });
    quickPick.onDidTriggerItemButton((e) => {
        // 监听按钮
        log.info("加入书架"+e.item.label);
        quickPick.hide();
        commands.executeCommand("read-book-status-bar.list",e.item).then(res=>{
        });
    });
    let time: NodeJS.Timeout;
    quickPick.onDidChangeValue(e => {
        // 监听输入
        clearTimeout(time);
        time = setTimeout(async () => {
            let list: any[] =await Request.getInstance(domain).search(e);
            // 获取当前网站
            quickPick.items = list.map((item) => {
                return {
                    label: item.content,
                    detail: item.url,
                    domain,
                    buttons:[{
                        iconPath:new ThemeIcon('add'),
                        tooltip:"加入书架",
                    }]
                };
            });
        }, 300);
    });

    commands.registerCommand(command, (e) => {
        if (e instanceof DomainItem){
            domain = e.element;
        }else{
            domain = domains.getItems()[0];
        }
        if(domain){
            quickPick.title = "搜索："+ domain.name;
            showSearch();
        }else{
            window.showInformationMessage('没有网站可供搜索','去添加','取消').then(res=>{
                if(res == "去添加"){
                    commands.executeCommand("read-book-status-bar.domain-add");
                }
            });
        }
    });
}

function showSearch() {
    quickPick.show();
}
// 初始化阅读控制
function init() {
    search();
}

export default {
    run(app: ReadBook) {
        handler = app;
        init();
    }
};