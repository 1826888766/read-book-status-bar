import { ReadBook } from "../main";
import { commands, window, StatusBarAlignment, StatusBarItem } from "vscode";
import content from "../providers/content";
const os = require("node:os");
const path = require("path");
const fs = require("fs");
var handler: ReadBook, importStatusBarItem: StatusBarItem;

function _import() {
    let command = "read-book-status-bar.import";
    importStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 60);
    importStatusBarItem.text = '$(add) 导入';
    importStatusBarItem.tooltip = '导入';
    importStatusBarItem.command = command;
    importStatusBarItem.show();
    handler.context.subscriptions.push(importStatusBarItem);
    commands.registerCommand(command, () => {
        window.showOpenDialog({
            title: "选择书籍txt",
            filters: {
                'file': ['txt']
            },

        }).then(file => {
            if (file && file.length > 0) {
                loadFile(file[0].path);
            }
        });
    });
}
var rule = /(第)([\u4e00-\u9fa5a-zA-Z0-9]{1,7})[章][^\n]{1,35}(|\n)/g;
var navList: any[] = [];
async function loadFile(file: string) {
    if (!file) {
        return false;
    }
    var platform = os.platform();
    if (platform.search("win") !== false) {
        file = file.replace('\/', '');
    }
    navList = await praseNav(file);
    content.setItems(navList);
    return navList;
}
const readline = require('linebyline');

async function praseNav(file: string): Promise<any[]> {

    // read all lines
    let rl = readline(file);
    let list: any[] = [];
    return new Promise((resolve, reject) => {
        // listen for `line` event
        let i = 0;
        rl.on('line', (line: any, lineCount: any, byteCount: any) => {
            if (rule.test(line)) {
                list.push({
                    title: line,
                    type: "file",
                    file: file,
                    url: lineCount,
                    start: lineCount,
                    end: lineCount + i,
                });
                i = 0;
            }
            i++;
        }).on('error', (err: any) => {
            reject();
        });
        rl.on("end", function () {
            console.log("加载完成");
            resolve(list);
        });
    });
}
function praseContent(item: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
        // listen for `line` event
        let i = 0;
        let rl = readline(item.file);
        let list: any[] = [];
        rl.on('line', (line: any, lineCount: any, byteCount: any) => {
            if (lineCount >= item.start && lineCount < item.end) {
                line && list.push(line);
            }
        }).on('error', (err: any) => {
            reject();
        });
        rl.on("end", function () {
            console.log("加载完成");
            resolve(list);
        });
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
    },
    getContent(item: any): Promise<any[]> {
        return praseContent(item);
    }
};