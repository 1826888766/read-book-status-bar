import { window } from "vscode";

const path = require("path");
const fs = require("fs");
import cnchar from 'cnchar';

export class BookShelf {

    config: any = [];
    rootPath: string = "/read-book/";

    constructor(config: any = []) {
        this.config = config;
        this.rootPath = path.resolve(this.rootPath);
        this.init();

    }

    public async init() {
        let checkStatus = this.check();
        if (!checkStatus) {
            let createStatus = this.createFile();
            if (!createStatus) {
                window.showWarningMessage('创建书架配置失败,请检查目录"' + this.rootPath + '"是否有可写权限');
            }
        } else {
            let createStatus = this.read('test.json');
        }

    }

    public check(name: string = "") {
        return  fs.existsSync(this.rootPath + name);
    }

    public createFile(name: string = "", value: string = "") {
        if (value) {
            //写入'入文件'三个字
            fs.writeFileSync(path.join(this.rootPath, name), value);
        } else {
            fs.mkdirSync(this.rootPath);
        }
        return true;
    }


    public readFile(name: string = "") {
        let file = fs.readFileSync(path.join(this.rootPath, name));
        if (file) {
            return JSON.parse(file.toString());
        }
        return "";
    }
    public create(book:any) {
        console.log('汉字'.spell());
        console.log('汉字'.stroke());
            // this.createFile(book.title+".json", JSON.stringify(book));
    }

    public read(name: string = "") {
            this.readFile("test.json");
    }

    public list() {

    }


    public update() {
       
    }
}