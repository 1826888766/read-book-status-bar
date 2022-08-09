import { ReadBook } from "../main";
import * as vscode from "vscode";
import fs = require("fs");
import storage from "../storage/storage";
import domain from "../providers/domain";
var handler:ReadBook;
var domains:any[] = [];
var domainPath:string; 
function load(){
    domainPath = storage.getStorage("domainPath")||"";
    if (domainPath){
        fs.readdir(domainPath,(err,files)=>{
            if(err){

            }else{
                domains = [];
                files.forEach(res=>{
                    let content:string = fs.readFileSync(domainPath+'/'+res,'utf-8').toString();
                    let json = JSON.parse(content);
                    json['fsPath'] = domainPath+'/'+res;
                    domains.push(json);

                });
                domain.setItems(domains);
            }
        });
    }else{
        vscode.window.showInformationMessage("首次安装需要选择网站目录,否则无法使用网络搜索功能",'选择文件夹','我不想用').then(res=>{
            if(res == "选择文件夹"){
                vscode.window.showOpenDialog({
                    title: "选择网站保存的目录",
                    canSelectFiles:false,
                    canSelectFolders:true,
                    filters: {},
                    openLabel:"确定"
                }).then(res=>{
                    if (res){
                        domainPath = res[0].path;
                        if (domainPath.startsWith('/')){
                            domainPath = domainPath.replace('/','');
                        }
                        // 初始化一些文件
                        import("../domain/biquge").then(res=>{
                            let content = JSON.stringify(res.default).replaceAll(',',',\n');
                            content = content.replaceAll('{"','{\n"').replaceAll('":"','" : "').replaceAll('"}','"\n}');
                            fs.writeFileSync(domainPath+'/biquge.json',content,{
                                flag:"w"
                            });
                            load();
                        });
                        storage.setStorage("domainPath",domainPath);
                    }
                });
            }
            
        });
        
    }
    
}

function init(){
    load();
    add();
    del();
    edit();
}

function add(){
    let command = "read-book-status-bar.domain-add";
    vscode.commands.registerCommand(command,()=>{
        let file = vscode.Uri.file(domainPath+'/custom'+ domains.length +'.json');
        // 初始化一些文件
        import("../domain/biquge").then(res=>{
            let content = JSON.stringify(res.default).replaceAll(',',',\n');
            content = content.replaceAll('{"','{\n"').replaceAll('":"','" : "').replaceAll('"}','"\n}');
            fs.writeFileSync(file.fsPath,content,{
                flag:"w"
            });
            vscode.workspace.openTextDocument(file).then(res=>{
                vscode.window.showTextDocument(res);
            });
        });
    });
    vscode.workspace.onDidSaveTextDocument((ret)=>{
        if(ret.uri.path.indexOf(domainPath) !== -1){
            load();
        }
    });
}
function del(){
    let command = "read-book-status-bar.domain-del";
    vscode.commands.registerCommand(command,(e)=>{
        fs.unlinkSync(e.element.fsPath);
        load();
    });
}
function edit(){
    let command = "read-book-status-bar.domain-edit";
    vscode.commands.registerCommand(command,(e)=>{
        let file = vscode.Uri.file(e.element.fsPath);
        vscode.workspace.openTextDocument(file).then(res=>{
            vscode.window.showTextDocument(res);
        });
    });
}
export default{
    run(app:ReadBook){
        handler = app;
        init();
    }
};