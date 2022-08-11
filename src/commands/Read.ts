import { ReadBook } from "../main";
import { commands, window, StatusBarAlignment, StatusBarItem, workspace } from "vscode";
import Request from "../https/request";
import statusview from "../previews/statusview";
import editcontent from "../previews/editcontent";
import content, { ContentItem } from "../providers/content";
import _import from "./Import";
import storage from "../storage/storage";
import book from "../providers/book";
import log from "../utils/log";
var handler: ReadBook, nextStatusBarItem, stopStatusBarItem: StatusBarItem, startStatusBarItem: StatusBarItem;

var navIndex: number = 0, contentIndex: number = 0;
function getContents() {
    return content.getItems();
}
var domain: any;
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
        storage.setStorage('last_nav', e.element);
        view = statusview;
        isHide = false;
        editcontent.hide();
        contentIndex = 0;
        statusview.write("$(loading~spin) 加载书籍中");
        if (e.element.type === "file") {
            loadContents = await _import.getContent(e.element);
            isLoadNext = false;

        } else {
            let loadContent = await Request.getInstance(e.element.parent.domain).content(e.element);
            loadContents = loadContent.replace(/[(\r\n)\r\n]+/, '。').split(/[(。|！|\!|\.|？|\?)]/);
            isLoadNext = false;
        }
        formatContents();
        statusview.write("$(check) 加载书籍成功");
        commands.executeCommand('read-book-status-bar.start');
        content.setActive(e.element);
    });
}
function readEdit() {
    let command = "read-book-status-bar.read-edit";
    commands.registerCommand(command, async (e: ContentItem) => {
        storage.setStorage('last_nav', e.element);
        contentIndex = 0;
        view = editcontent;
        editcontent.show();
        isHide = false;
        statusview.write("$(loading~spin) 加载书籍中");
        if (e.element.type === "file") {
            loadContents = await _import.getContent(e.element);
        } else {
            let loadContent = await Request.getInstance(domain).content(e.element);
            loadContents = loadContent.replace(/[(\r\n)\r\n]+/, '。').split(/[(。|！|\!|\.|？|\?)]/);
        }
        
        formatContents();
        statusview.write("$(check) 加载书籍成功");
        commands.executeCommand('read-book-status-bar.start');
        content.setActive(e.element);
    });
}
var showContents: any[] = [];
function formatContents() {
    let newContents: any[] = [];
    let config = workspace.getConfiguration('read-book-status-bar');
    let rowLength: number = config.get('rowLength') || 40;
    let pre = "";
    loadContents.forEach(element => {
        element = pre + element;
        while (true) {
            if (element) {
                if (element.length > rowLength) {
                    let line = element.slice(0, rowLength);
                    pre = element.slice(rowLength, element.length);
                    newContents.push(line.trim());
                    if (pre.length > rowLength) {
                        element = pre;
                    } else {
                        break;
                    }
                } else {
                    newContents.push(element.trim());
                    break;
                }
            }
        }

    });
    showContents = newContents;
}
var time: NodeJS.Timeout;
var isLoadNext = false;
var speed: number = 5000;
function run() {
    if (isLoadNext) {
        return;
    }
    if (autoReadRow) {
        clearTimeout(time);
    }
    view.write(showContents[contentIndex]);
    if (contentIndex >= showContents.length) {
        statusview.write('$(loading~spin) 正在加载下一章');
        isLoadNext = true;
        commands.executeCommand('read-book-status-bar.stop');
        commands.executeCommand('read-book-status-bar.next');
        return;
    }
    if (autoReadRow) {
        time = setTimeout(() => {
            commands.executeCommand('read-book-status-bar.next-line');
        }, speed);
    }
}

function list() {
    let command = "read-book-status-bar.list";
    log.info("注册列表命令");
    commands.registerCommand(command, async (e) => {
        // console.log(e);
        try {

            log.info("列表命令激活 " + JSON.stringify(e));
            statusview.write('$(loading~spin) 正在加载书籍《' + (e.title || e.label) + '》...');
            if (e.type === "file") {
                await _import.loadFile(e.url, e.rule);
            } else {
                let list: any[] = storage.getStorage('nav_' + (e.title || e.label));
                if (!list) {
                    list = await Request.getInstance(e.domain || domain).catalog(e.url || e.detail);
                }
                // 获取当前网站
                let books: any[] = storage.getStorage("books")||[];

                if (books.map(item => item.url).indexOf(e.url || e.detail) === -1) {
                    log.info("书架不存在,开始加入书架");
                    let bookItem = {
                        title: (e.title || e.label),
                        url: (e.detail||e.url),
                        type: (e.domain || domain).name,
                        domain:(e.domain || domain)
                    };
                    books.push(bookItem);
                    book.setItems(books);
                    storage.setStorage('books', books);
                    storage.setStorage('nav_' + (e.title || e.label), list);
                    log.info("书架不存在,加入书架成功");
                    storage.setStorage('select-book', bookItem);

                }

                content.setItems(list.map((item) => {
                    return {
                        title: (item.title||item.content),
                        url: item.url,
                        parent: e
                    };
                }));

                statusview.write('$(check) 目录加载成功《' + (e.title || e.label) + '》');
            }
            auto();
        }
        catch (e) {
            log.error(JSON.stringify(e));
        }
    });
}

function selectBook() {
    let command = "read-book-status-bar.select-book";
    commands.registerCommand(command, async (e: ContentItem) => {
        if (e.label) {
            storage.getStorage('nav_' + (e.label));
        }

        commands.executeCommand('read-book-status-bar.list', e.element);

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
        let select = storage.getStorage('select-book');
        if (select.title == e.element.title) {
            storage.rmStorage('last_nav');
            storage.rmStorage('select-book');
        }
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

var autoReadRow: boolean;

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
    workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration("read-book-status-bar.speed")) {
            speed = workspace.getConfiguration('read-book-status-bar').get('speed') || 5000;
            run();
        }
        if (e.affectsConfiguration("read-book-status-bar.rowLength")) {
            formatContents();
        }
        if (e.affectsConfiguration("read-book-status-bar.autoReadRow")) {
            autoReadRow = workspace.getConfiguration('read-book-status-bar').get('autoReadRow') || false;
            if (!autoReadRow) {
                clearTimeout(time);
            } else {
                if (loadContents.length) {
                    run();
                }
            }
        }
    });
}
var isFirst = false;
function auto() {
    if (isFirst) {
        return false;
    }
    isFirst = true;
    let autoRead = workspace.getConfiguration('read-book-status-bar').get('autoRead');
    autoReadRow = workspace.getConfiguration('read-book-status-bar').get('autoReadRow') || false;

    if (autoRead) {
        let item = storage.getStorage('last_nav');
        if (item) {
            content.getItems().forEach((element: any, index: number) => {
                if ((item.title||item.label) == element.title) {
                    navIndex = index;
                    return false;
                }
            });
            commands.executeCommand('read-book-status-bar.read', { element: item });
        }
    }
}

export default {
    run(app: ReadBook) {
        handler = app;
        init();
    }
};