import { ReadBook } from "../main";
import * as vscode from "vscode";
import fs = require("fs");
import storage from "../storage/storage";
import domain from "../providers/domain";
import os = require("os");
import path = require("path");
import log from "../utils/log";
var handler: ReadBook;
var domains: any[] = [];
var domainPath: string;
function load() {
    domainPath = storage.getStorage("domainPath") || "";
    log.info('网站存储路径：domainPath='+domainPath);
    if (domainPath) {
        fs.readdir(domainPath, (err, files) => {
            if (err) {
                vscode.window.showInformationMessage("文件目录获取失败", '重新选择', '我不想用').then(res=>{
                    if(res==="重新选择"){
                        storage.rmStorage("domainPath");
                        vscode.window.showOpenDialog({
                            title: "选择网站保存的目录",
                            canSelectFiles: false,
                            canSelectFolders: true,
                            filters: {},
                            openLabel: "确定"
                        }).then(res => {
                            if (res) {
                                domainPath = res[0].path;
                                if (os.platform().indexOf("win") != -1) {
                                    if (domainPath.startsWith('/')) {
                                        domainPath = domainPath.replace('/', '');
                                    }
                                }
        
                                // 初始化一些文件
                                import(path.join(__dirname,"../domain/biquge")).then(res => {
                                    let content = JSON.stringify(res.default).replaceAll(',', ',\n');
                                    content = content.replaceAll('{"', '{\n"').replaceAll('":"', '" : "').replaceAll('"}', '"\n}');
                                    fs.writeFileSync(domainPath + '/biquge.json', content, {
                                        flag: "w"
                                    });
                                    log.info("初始化文件成功");
                                    load();
                                }).catch(err=>{
                                    log.error("初始化文件失败");
                                });
                                storage.setStorage("domainPath", domainPath);
                            }
                        });
                    }
                });
            } else {
                domains = [];
                files.forEach(res => {

                    let content: string = fs.readFileSync(domainPath + '/' + res, 'utf-8').toString();
                    let json = JSON.parse(content);
                    json['fsPath'] = domainPath + '/' + res;
                    domains.push(json);

                });
                domain.setItems(domains);
            }
        });
    } else {
        vscode.window.showInformationMessage("首次安装需要选择网站目录,否则无法使用网络搜索功能", '选择文件夹', '我不想用').then(res => {
            if (res === "选择文件夹") {
                vscode.window.showOpenDialog({
                    title: "选择网站保存的目录",
                    canSelectFiles: false,
                    canSelectFolders: true,
                    filters: {},
                    openLabel: "确定"
                }).then(res => {
                    if (res) {
                        domainPath = res[0].path;
                        if (os.platform().indexOf("win") != -1) {
                            if (domainPath.startsWith('/')) {
                                domainPath = domainPath.replace('/', '');
                            }
                        }

                        // 初始化一些文件
                        import(path.join(__dirname,"../domain/biquge")).then(res => {
                            let content = JSON.stringify(res.default).replaceAll(',', ',\n');
                            content = content.replaceAll('{"', '{\n"').replaceAll('":"', '" : "').replaceAll('"}', '"\n}');
                            fs.writeFileSync(domainPath + '/biquge.json', content, {
                                flag: "w"
                            });
                            load();
                        });
                        storage.setStorage("domainPath", domainPath);
                    }
                });
            }

        });

    }

}

function init() {
    load();
    add();
    del();
    edit();
    reset();
}

function add() {
    let command = "read-book-status-bar.domain-add";
    log.info('注册网站添加命令');
    vscode.commands.registerCommand(command, () => {
        let file = vscode.Uri.file(domainPath + '/custom' + domains.length + '.json');
        // 初始化一些文件
        log.info('网站添加命令激活');
        log.info(file.fsPath);

        import(path.join(__dirname,"../domain/biquge")).then(res => {
            let content = JSON.stringify(res.default).replaceAll(',', ',\n');
            content = content.replaceAll('{"', '{\n"').replaceAll('":"', '" : "').replaceAll('"}', '"\n}');
            fs.writeFileSync(file.fsPath, content, {
                flag: "w"
            });
            vscode.workspace.openTextDocument(file).then(res => {
                vscode.window.showTextDocument(res);
            });
            load();
        });
    });
    vscode.workspace.onDidSaveTextDocument((ret) => {
        let path = domainPath.split(":");
        let fsPath = "";
        if(path.length >1){
            fsPath = path[1];
        }else{
            fsPath = path[0];
        }
        if(ret.uri.path.search(fsPath) !== -1){
            load();
        }
    });
}
function del() {
    let command = "read-book-status-bar.domain-del";
    vscode.commands.registerCommand(command, (e) => {
        fs.unlinkSync(e.element.fsPath);
        load();
    });
}
function edit() {
    let command = "read-book-status-bar.domain-edit";
    vscode.commands.registerCommand(command, (e) => {
        let file = vscode.Uri.file(e.element.fsPath);
        vscode.workspace.openTextDocument(file).then(res => {
            vscode.window.showTextDocument(res);
        });
    });
}
function reset() {
    let command = "read-book-status-bar.domain-reset";
    vscode.commands.registerCommand(command, (e) => {
        storage.rmStorage("domainPath");
        load();
    });
}
export default {
    run(app: ReadBook) {
        handler = app;
        init();
    }
};