import { ReadBook } from "../main";
import { commands, window, StatusBarAlignment, StatusBarItem, QuickPick, QuickPickItem, ThemeIcon } from "vscode";
import Request from "../https/request";
import statusview from "../previews/statusview";
import editcontent from "../previews/editcontent";
import content, { ContentItem } from "../providers/content";
import _import from "./import";
const format = require("string-format");
var handler: ReadBook, nextStatusBarItem, stopStatusBarItem: StatusBarItem, startStatusBarItem: StatusBarItem;

var navIndex: number = 0, contentIndex: number = 0;
function getContents() {
    return content.getItems();
}
var domain = require('../domain/biquge.json');
function next() {
    let command = "read-book-status-bar.next";
    nextStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 70);
    nextStatusBarItem.command = command;
    handler.context.subscriptions.push(nextStatusBarItem);
    nextStatusBarItem.text = `$(chevron-right) 下一章`;
    nextStatusBarItem.tooltip = '下一章';
    nextStatusBarItem.show();
    commands.registerCommand(command, () => {
        navIndex++;
        if (view === editcontent) {
            commands.executeCommand('read-book-status-bar.read-edit', {
                element: getContents()[navIndex]
            });
        } else {
            commands.executeCommand('read-book-status-bar.read', {
                element: getContents()[navIndex]
            });
        }
    });
}

function prev() {
    let command = "read-book-status-bar.prev";
    nextStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 90);
    nextStatusBarItem.command = command;
    handler.context.subscriptions.push(nextStatusBarItem);
    nextStatusBarItem.text = `$(chevron-left) 上一章`;
    nextStatusBarItem.tooltip = '上一章';
    nextStatusBarItem.show();
    commands.registerCommand(command, () => {
        navIndex--;
        if (view === editcontent) {
            commands.executeCommand('read-book-status-bar.read-edit', {
                element: getContents()[navIndex]
            });
        } else {
            commands.executeCommand('read-book-status-bar.read', {
                element: getContents()[navIndex]
            });
        }
    });
}
function stop() {
    let command = "read-book-status-bar.stop";
    stopStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 80);
    handler.context.subscriptions.push(stopStatusBarItem);
    stopStatusBarItem.command = command;
    stopStatusBarItem.text = `$(debug-stop) 停止`;
    stopStatusBarItem.tooltip = '停止';
    commands.registerCommand(command, () => {
        startStatusBarItem.show();
        stopStatusBarItem.hide();

        clearTimeout(time);
    });
}


function start() {
    let command = "read-book-status-bar.start";
    startStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 81);
    handler.context.subscriptions.push(startStatusBarItem);
    startStatusBarItem.command = command;
    startStatusBarItem.text = `$(run) 开始`;
    startStatusBarItem.tooltip = '开始';
    startStatusBarItem.show();
    commands.registerCommand(command, () => {
        stopStatusBarItem.show();
        startStatusBarItem.hide();
        if (loadContents.length > 0) {
            run();
        } else {
            if (view === editcontent) {
                commands.executeCommand('read-book-status-bar.read-edit', {
                    element: getContents()[navIndex]
                });
            } else {
                view = statusview;
                commands.executeCommand('read-book-status-bar.read', {
                    element: getContents()[navIndex]
                });
            }
        }
    });
}


function nextLine() {
    let command = "read-book-status-bar.next-line";
    commands.registerCommand(command, () => {
        contentIndex++;
        run();
    });
}


function prevLine() {
    let command = "read-book-status-bar.prev-line";
    commands.registerCommand(command, () => {
        contentIndex--;
        run();
    });
}
let loadContents: string[] = [];
let view: any;
function read() {
    let command = "read-book-status-bar.read";
    commands.registerCommand(command, async (e: ContentItem) => {
        view = statusview;
        contentIndex = 0;
        if (e.element.type === "file") {
            loadContents = await _import.getContent(e.element);
            run();
        } else {
            let loadContent = await Request.getInstance(domain).content(e.element);
            loadContents = loadContent.replace(/[(\r\n)\r\n]+/, '。').split(/[(。|！|\!|\.|？|\?)]/);
            run();
        }
    });
}
function readEdit() {
    contentIndex = 0;
    let command = "read-book-status-bar.read-edit";
    commands.registerCommand(command, async (e: ContentItem) => {
        view = editcontent;
        if (e.element.type === "file") {
            loadContents = await _import.getContent(e.element);
            run();
        } else {
            let loadContent = await Request.getInstance(domain).content(e.element);
            loadContents = loadContent.replace(/[(\r\n)\r\n]+/, '。').split(/[(。|！|\!|\.|？|\?)]/);
            run();
        }
    });
}
let time: NodeJS.Timeout;
function run() {
    clearTimeout(time);
    view.write(loadContents[contentIndex]);
    time = setTimeout(() => {
        if (contentIndex >= loadContents.length) {
            commands.executeCommand('read-book-status-bar.next');
            return;
        }
        contentIndex++;
        run();
    }, 5000);
}

var quickPick: QuickPick<QuickPickItem>;
function list() {
    let command = "read-book-status-bar.list";
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
    commands.registerCommand(command, async (e) => {
        // console.log(e);
        statusview.write('$(loading) 正在加载书籍《' + e.label + '》...');
        quickPick.title = e.label;
        quickPick.placeholder = "正在加载目录请稍后";
        quickPick.show();
        let list: any[] = await Request.getInstance(domain).catalog(e.detail);
        // 获取当前网站
        content.setItems(list.map((item) => {
            return {
                title: item.content,
                url: item.url,
                parent: e
            };
        }));
    });
}
// 初始化阅读控制
function init() {
    prev();
    stop();
    start();
    next();
    nextLine();
    prevLine();
    list();
    read();
    readEdit();
}

export default {
    run(app: ReadBook) {
        handler = app;
        init();
    }
};