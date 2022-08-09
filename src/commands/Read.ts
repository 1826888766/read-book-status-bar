import { ReadBook } from "../main";
import { commands, window, StatusBarAlignment, StatusBarItem, QuickPick, QuickPickItem, ThemeIcon, workspace } from "vscode";
import Request from "../https/request";
import statusview from "../previews/statusview";
import editcontent from "../previews/editcontent";
import content, { ContentItem } from "../providers/content";
import _import from "./import";
import storage from "../storage/storage";
import book from "../providers/book";
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
    nextStatusBarItem.text = `$(chevron-right)`;
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
    nextStatusBarItem.text = `$(chevron-left)`;
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
    stopStatusBarItem.text = `$(debug-stop)`;
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
    startStatusBarItem.text = `$(run)`;
    startStatusBarItem.tooltip = '开始';
    startStatusBarItem.show();
    commands.registerCommand(command, () => {
        stopStatusBarItem.show();
        startStatusBarItem.hide();
        if (loadContents.length > 0) {
            run();
        } else {
            if (view == editcontent) {
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
let view: any = statusview;
function read() {
    let command = "read-book-status-bar.read";
    commands.registerCommand(command, async (e: ContentItem) => {
        view = statusview;
        isHide = false;
        contentIndex = 0;
        if (e.element.type === "file") {
            loadContents = await _import.getContent(e.element);
            isLoadNext = false;
            
        } else {
            let loadContent = await Request.getInstance(e.element.domain || domain).content(e.element);
            loadContents = loadContent.replace(/[(\r\n)\r\n]+/, '。').split(/[(。|！|\!|\.|？|\?)]/);
            isLoadNext = false;
        }
        commands.executeCommand('read-book-status-bar.start');
    });
}
function readEdit() {
    let command = "read-book-status-bar.read-edit";
    commands.registerCommand(command, async (e: ContentItem) => {
        contentIndex = 0;
        view = editcontent;
        isHide = false;
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
var time: NodeJS.Timeout;
var isLoadNext = false;
var speed:number = 5000;
function run() {
    if (isLoadNext) {
        return;
    }
    clearTimeout(time);
    view.write(loadContents[contentIndex]);
    if (contentIndex >= loadContents.length) {
        statusview.write('$(loading~spin) 正在加载下一章');
        isLoadNext = true;
        commands.executeCommand('read-book-status-bar.stop');
        commands.executeCommand('read-book-status-bar.next');
        return;
    }
    time = setTimeout(() => {
        contentIndex++;
        run();
    }, speed);
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
        statusview.write('$(loading~spin) 正在加载书籍《' + (e.title || e.label) + '》...');
        let list: any[] = storage.getStorage('nav_' + (e.title || e.label));
        if (!list) {
            list = await Request.getInstance(e.domain || domain).catalog(e.url || e.detail);
        }
        // 获取当前网站
        let books: any[] = book.getItems();

        if (books.map(item => item.url).indexOf(e.url || e.detail) === -1) {
            books.push({
                title: e.label,
                url: e.detail,
                type: domain.name,
                domain
            });
            book.setItems(books);
            storage.setStorage('books', books);
            storage.setStorage('nav_' + e.label, list);
        }

        content.setItems(list.map((item) => {
            return {
                title: item.content,
                url: item.url,
                parent: e
            };
        }));

        statusview.write('$(check) 目录加载成功《' + (e.title || e.label) + '》');
    });
}

function selectBook() {

    let command = "read-book-status-bar.select-book";
    commands.registerCommand(command, async (e: ContentItem) => {
        if (e.element.type === "file") {
            _import.loadFile(e.element.url,e.element.rule);
        } else {
            commands.executeCommand('read-book-status-bar.list', e.element);
        }
        storage.setStorage('select-book', e.element);
    });
}
function delBook() {
    let command = "read-book-status-bar.del-book";
    commands.registerCommand(command, async (e: ContentItem) => {
        view = editcontent;
        var books: any[] = storage.getStorage('books');
        books = books.filter(item => {
            return item.url != e.element.url;
        });
        storage.setStorage('books', books);
        book.setItems(books);
        content.setItems([]);
        storage.rmStorage('nav_' + e.element.title);
    });
}
let isHide = false;
function bossKey() {
    let command = "read-book-status-bar.bosskey";
    commands.registerCommand(command, async () => {
        if (isHide) {
            isHide = false;
            if (loadContents.length > 0) {
                commands.executeCommand('read-book-status-bar.start');
            } else {
                view.write("$(loading~spin) 等待选择章节");
            }
        } else {
            isHide = true;
            let config = workspace.getConfiguration('read-book-status-bar');
            let text: string = config.get('bosstext') || "";
            commands.executeCommand('read-book-status-bar.stop');
            view.write(text);
        }
    });
}
function write() {
    let command = "read-book-status-bar.write";
    commands.registerCommand(command, async (e: string) => {
        view.write(e);
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
    selectBook();
    delBook();
    bossKey();
    write();
    workspace.onDidChangeConfiguration(e=>{
        if(e.affectsConfiguration("read-book-status-bar.speed")){
            speed = workspace.getConfiguration('read-book-status-bar').get('speed') || 5000;
            run();
        }
    });
}

export default {
    run(app: ReadBook) {
        handler = app;
        init();
    }
};