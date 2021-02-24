/* eslint-disable @typescript-eslint/naming-convention */
import { Print } from "./print";
import * as vscode from "vscode";
import request from "./request";
import { Tools } from "./Tools";
import { Books } from "./Books";
import {BookProvider} from "../provider/BookProvider";
import { CatalogProvider } from "../provider/CatalogProvider";
import path = require("path");
var time: any = 0;
export class Log2 {

    // 输出到控制台
    protected config;
    name: string = "";
    bookList: Array<any> = [];
    // 目录分页信息
    private navPage = {
        cur: 0,
        limits: 10,
    };
    // 书籍分页信息
    private bookPage = {
        cur: 0,
        limits: 10,
    };
    // 当前书籍目录信息
    catalogList: Array<any> = [];
    // 是否是选中目录
    selectCatalog: any = false;
    // 当且阅读到的目录索引
    navIndex: number = 0;
    // 当前选中的数据信息
    active!: any;
    // 当前选中的章节信息
    activeCatalog: any = {
        id: 0
    };
    // 是否停止阅读
    isStop: boolean = false;
    // 当前章节内容段落数组
    contextArr: any;
    // 阅读定时器
    timeout: any = 0;
    // 当前阅读到的行索引
    pageIndex: any;
    // 上次阅读行遗留未读完文字
    pretext: string = "";
    bookProvider!: BookProvider;
    catalogProvider!: CatalogProvider;
    private _importIcon!: vscode.StatusBarItem;
    statusBar!: vscode.StatusBarItem;
    playBar!: vscode.StatusBarItem;
    webViewPanel: null|vscode.WebviewPanel = null;

    constructor() {
        this.registerCommands();
        this.config = vscode.workspace.getConfiguration("read-book-status-bar");
        this.initStatusBar();
        this.listen();
    }

    /**
     * 设置配置文件
     * @param config 
     */
    public setConfig(config: vscode.WorkspaceConfiguration) {
        if (this.config && this.config.type !== config.type) {
            this.config = config;
            if (this.config.type === 'file') {
                this._importIcon.show();
            }else{
                this._importIcon.hide();
            }
            this.bookList = [];
            this.catalogList = [];
            this.navIndex = 0;
            this.navPage = {
                cur: 0,
                limits: 10,
            };
            this.bookPage = {
                cur: 0,
                limits: 10,
            };
            this.search(this.config.name);

        } else {
            this.config = config;

        }
    }

    /**
     * 初始化底部状态栏按钮
     */
    private initStatusBar() {
        this._importIcon =vscode. window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this._importIcon.command = "read-book-status-bar.import";
        this._importIcon.text = "$(add)";
        this._importIcon.tooltip = "导入";
        this._importIcon.show();

        if (this.config.type !== 'file') {
            this._importIcon.hide();
        }
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.statusBar.command = "read-book-status-bar.list";
        this.statusBar.text = "$(book)";
        this.statusBar.tooltip = "正在获取...";
        this.statusBar.show();

        let status =vscode. window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        status.command = "read-book-status-bar.next";
        status.text = "$(chevron-right)";
        status.tooltip = "下一章";
        status.show();
        this.playBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.playBar.command = "read-book-status-bar.stop";
        this.playBar.text = "$(play)";
        this.playBar.tooltip = "停止";
        this.playBar.show();
        let per =vscode. window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        per.command = "read-book-status-bar.pre";
        per.text = "$(chevron-left)";
        per.tooltip = "上一章";
        per.show();
        let search = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        search.command = "read-book-status-bar.search";
        search.text = "$(search)";
        search.tooltip = "搜索";
        search.show();
    }

    /**
     * 初始运行
     */
    public async run() {
        this.isStop = !this.config.autoRead;
        if (this.config.name) {
            this.name = this.config.name;
            this.active = await Books.getInstance().getActiveBook();
            if(!this.active){
                vscode.window.showInformationMessage("没有正在阅读的书籍");
                return false;
            }
            this.catalogProvider.setName(this.active.id);
            this.catalogList = await Books.getInstance().getCatalogList(this.active);
            this.activeCatalog = {
                id: this.active.nav_id
            };
            if (this.isStop) {
                this.playBar.text = "$(debug-start)";
                this.playBar.tooltip = "开始";
            } else {
                this.playBar.text = "$(debug-pause)";
                this.playBar.tooltip = "停止";
            }
            this.config.autoRead && this.read(true);

        } else {
            this.write("请搜索书籍");
        }
    }

    /**
     * 输出到消息
     * @param text 
     */
    write(text: string) {
        Print.getInstance().write(text);
    }

    /**
     * 搜索书籍
     */
    async search(name: string = "") {
        if (!name) {
            return this.showBookQuickPick();
        }
        this.name = name;
        this.bookList = await request
            .setDirvers(this.config.type)
            .search(this.name);
        this.showBookQuickPick();
    }

    getBooksData() {
        var items = [];
        if (this.bookList.length > 10) {
            let start: number = this.bookPage.cur * this.navPage.limits;
            let end: number = start + Number(this.bookPage.limits);
            items = this.bookList.slice(start, end);
        } else {
            items = this.bookList;
        }
        return items.reduce((pre: any, cur: any) => {
            pre.push({
                label: cur.title,
                detail: cur.link,
            });
            return pre;
        }, []);
    }

    listen() {
        Tools.getInstance().on("onDidChangeSelection", (res: vscode.QuickPickItem[]) => {
            if (res[0]) {
                if (!this.selectCatalog) {
                    this.active = {
                        title:res[0].label,
                        url:res[0].detail,
                        type:this.config.type
                    };
                    this.navIndex = 0;
                    this.navPage.cur = 0;
                    this.catalogList = [];
                    this.list();
                    Tools.getInstance().quickPickHide();
                }
                else {
                    this.navIndex = Number(res[0].label.split(".")[0]);
                    this.activeCatalog = res[0];
                    this.pageIndex = 0;
                    this.pretext = "";
                    this.read();
                }
            }
        });
        Tools.getInstance().on("onDidTriggerButton", (e: vscode.QuickInputButton) => {
            if (!this.selectCatalog) {
                if (e.tooltip === "上一页") {
                    this.booksPre();
                } else {
                    this.booksNext();
                }
            } else {
                if (e.tooltip === "上一页") {
                    this.catalogPre();
                } else {
                    this.catalogNext();
                }
            }
        });
        Tools.getInstance().on("onDidChangeValue", (e: string) => {
            clearTimeout(time);
            time = setTimeout(() => {
                this.search(e);
            }, 300);
        });
    }

    updateConfig(name: any, value: any = "") {
        if (typeof name === "object") {
            for (var key in name) {
                this.updateConfig(key, name[key]);
            }
            return;
        }
        if (this.config.has(name)) {
            this.config
                .update(name, value, vscode.ConfigurationTarget.Global)
                .then(() => { })
                .then(undefined, (err) => {
                    console.log("更新配置失败");
                });
        }
    }
    /**
     * 目录列表
     * @param showQuick 是否显示弹窗目录
     */
    async list(showQuick = false) {
        this.name = this.active.title;
        this.updateConfig({
            name: this.active.title,
            link: this.active.url
        });
        // 获取或添加书籍
        this.active = await Books.getInstance().addBooks({
            title: this.active.title,
            type: this.active.type,
            url: this.active.url,
            nav_index: 0,
            nav_id: 0,
            active: 1
        });
        Tools.getInstance().showBusy();
        this.write("正在获取目录...");
        this.catalogList = await Books.getInstance().getCatalogList(this.active);
        this.catalogProvider.setName(this.active.id);
        showQuick&& this.showCatalogQuickPick();
        Tools.getInstance().hideBusy();
    }

    /**
    * 读取章节内容
    */
    async read(isInit = false) {
        if (!this.activeCatalog) {
            this.write("请搜索书籍");
            return;
        }
        if (!isInit) {
            this.isStop = false;
        }
        Print.getInstance().write("正在获取章节内容");
        this.selectCatalog = true;
        let res = await Books.getInstance().getContent(this.activeCatalog.id, this.active.type);
        await Books.getInstance().activeCatalog(this.activeCatalog.id);
        this.catalogProvider.setName(this.active.id);
        this.setContext(res);
        this.inteval();
    }

    /**
     * 获取内容
     */
    getContext(): string {
        return this.pretext || this.contextArr[this.pageIndex];
    }
    /**
     * 设置章节内容
     * @param text 
     */
    setContext(text: string) {
        this.contextArr = text.replace(/[(\r\n)\r\n]+/, '。').split(/[(。|！|\!|\.|？|\?)]/);
    }
    /**
     * 上一章
     */
    async prePage() {
        this.activeCatalog = await Books.getInstance().getPrePage(this.activeCatalog.id, this.active.id);
        if (!this.activeCatalog) {
            vscode.window.showWarningMessage("已是第一章");
            return;
        }
        this.pageIndex = 0;
        await this.read();
    }
    /**
     * 下一章
     */
    async nextPage() {
        this.activeCatalog = await Books.getInstance().getNextPage(this.activeCatalog.id, this.active.id);
        if (!this.activeCatalog) {
            vscode.window.showInformationMessage("已是最后一章");
            this.stop();
            return;
        }
        this.pageIndex = 0;
        await this.read();
    }
    /**
     * 上一行
     */
    preRow() {
        let auto = this.config.autoReadRow;
        if (auto) {
            this.pageIndex -= 2;
        } else {
            this.pageIndex--;
        }
        this.inteval();
    }
    /**
     * 下一行
     */
    nextRow() {
        !this.config.autoReadRow && !this.pretext && this.pageIndex++;
        this.inteval();
    }


    /**
    * 间隔执行输出
    */
    private inteval() {
        var text = this.getContext();
        let auto = this.config.autoReadRow;
        if (auto) {
            clearTimeout(this.timeout);
            this.pageIndex++;
        }
        if (!auto && text === undefined) {
            vscode.window.showErrorMessage("无章节内容，请先点击开始、或下一章");
            return false;
        } else if (auto && text === undefined) {
            this.nextPage();
            return;
        }
        text = text.replace(/[(.|\n)]/g, '').trim();
        if (!text) {
            return this.nextRow();
        }
        let speed = text.length > 20 ? this.config.speed : (this.config.speed / 2);
        if (text.length > this.config.rowLength) {
            this.pretext = text.substring(this.config.rowLength);
            text = text.substring(0, this.config.rowLength);
        } else {
            this.pretext = "";
        }
        this.write(text);
        if (auto && !this.isStop) {
            this.timeout = setTimeout(() => {
                this.inteval();
            }, speed);
        }
    }

    getCatalogData() {
        let start: number = this.navPage.cur * this.navPage.limits;
        let end: number = start + Math.min((this.catalogList.length - 1, Number(this.navPage.limits)));
        let items = this.catalogList.slice(start, end);
        return items.reduce((pre: any, cur: any, index: number) => {
            pre.push({
                label: start + index + "." + cur.title || "",
                detail: cur.link.toString(),
            });
            return pre;
        }, []);
    }

    showCatalogQuickPick() {
        this.selectCatalog = true;
        var allpage = Math.ceil(this.catalogList.length / this.navPage.limits);
        Tools.getInstance().setQuickPickData(this.getCatalogData(), {
            title: "选择目录",
            value: "",
            placeholder: `输入数字跳转页码，总页数（${allpage}）`,
            buttons: [
                {
                    tooltip: "上一页",
                    iconPath: new vscode.ThemeIcon("arrow-left"),
                },
                {
                    tooltip: "下一页",
                    iconPath: new vscode.ThemeIcon("arrow-right"),
                },
            ]
        });
        Tools.getInstance().quickPickShow();
    }
    /**
     * 目录上一页
     */
    private catalogPre() {
        if (this.navPage.cur === 0) {
            vscode.window.showWarningMessage("已是第一页");
            return;
        }
        this.navPage.cur -= 1;
        this.showCatalogQuickPick();
    }
    /**
     * 目录下一页
     */
    private catalogNext() {
        var allpage = Math.ceil(this.catalogList.length / this.navPage.limits);
        if (this.navPage.cur >= allpage) {
            vscode.window.showWarningMessage("已是最后一页");
            return;
        }
        this.navPage.cur += 1;
        this.showCatalogQuickPick();
    }

    /**
    * 书籍上一页 （淡出列表翻页）
    */
    private booksPre() {
        if (this.bookPage.cur === 0) {
            vscode.window.showWarningMessage("已是第一页");
            return;
        }
        this.bookPage.cur -= 1;
        this.showBookQuickPick();
    }

    /**
     * 下一页 （淡出列表翻页）
     */
    private booksNext() {
        var allpage: number = Math.ceil(this.bookList.length / this.bookPage.limits);
        if (this.bookPage.cur >= allpage) {
            vscode.window.showWarningMessage("已是最后一页");
            return;
        }
        this.bookPage.cur += 1;
        this.showBookQuickPick();
    }

    showBookQuickPick() {
        this.selectCatalog = false;
        Tools.getInstance().setQuickPickData(this.getBooksData(), {
            title: "选择书籍",
            placeholder: "搜索书籍名称",
            buttons: [
                {
                    tooltip: "上一页",
                    iconPath: new vscode.ThemeIcon("arrow-left"),
                },
                {
                    tooltip: "下一页",
                    iconPath: new vscode.ThemeIcon("arrow-right"),
                },
            ]
        });
        setTimeout(() => {
            Tools.getInstance().quickPickShow();
        }, 150);
    }

    /**
     * 销毁方法
     */
    public dispose() {

    }

    import(file:string){
        this.selectCatalog = true;
        this.updateConfig('name',  path.basename(file));
        this.updateConfig('link', file);
        this.updateConfig('navIndex',0);
        this.list();
    }

    // 注册命令
    registerCommands() {
        // 搜索
        vscode.commands.registerCommand("read-book-status-bar.search", () => this.search());
        // 重新获取目录
        vscode.commands.registerCommand("read-book-status-bar.refresh", () => this.catalogProvider.setName(this.active.id));
        // 老板键
        vscode.commands.registerCommand("read-book-status-bar.bosskey", () => this.boss());
        // 上一行
        vscode.commands.registerCommand("read-book-status-bar.up", () => this.preRow());
        // 下一行
        vscode.commands.registerCommand("read-book-status-bar.down", () => this.nextRow());
        // 上一行
        vscode.commands.registerCommand("read-book-status-bar.pre", () => this.prePage());
        // 下一行
        vscode.commands.registerCommand("read-book-status-bar.next", () => this.nextPage());
        // 在浏览器中打开
        vscode.commands.registerCommand("read-book-status-bar.webview", (e:any) =>{
            this.webViewPanel =this.webViewPanel||  vscode.window.createWebviewPanel("read-book-status-bar",e.label,vscode.ViewColumn.Two,{
                enableScripts:true,
                retainContextWhenHidden:false,
                
            });
            this.webViewPanel.webview.html = `<html><head><style>iframe{position:absolute;border: none;width: 100%;height: 100%}::-webkit-scrollbar{display: none;}</style></head><body><iframe width="100%" height="100%" src="${e.element.url}" border="0"></iframe></body></html>`;
        });
        // 导入
        vscode.commands.registerCommand("read-book-status-bar.import", () => {
            var res = vscode.window.showOpenDialog({
                title:"请选择小说文本txt",
                filters:{
                  "file":['txt']
                }
              });
              res.then((file:any)=>{
                this.import(file[0].path);
              });
        });

        // 打开目录弹窗
        vscode.commands.registerCommand("read-book-status-bar.list", () => this.list(true));
        // 选择书籍
        vscode.commands.registerCommand("read-book-status-bar.select-book", (e: any) => {
            this.active = {
                label: e.element.title,
                detail: e.element.url,
                ...e.element
            };
            this.navIndex = e.element.nav_index;
            this.pageIndex = 0;
            this.list();
        });
        // 选择目录
        vscode.commands.registerCommand("read-book-status-bar.select-catalog", async (e: any) => {
            this.activeCatalog = {
                label: e.element.title,
                detail: e.element.url,
                ...e.element
            };
            this.pageIndex = 0;
            this.read();
            
        });

        this.bookProvider = new BookProvider();
        this.catalogProvider = new CatalogProvider(this.name);
        vscode.window.registerTreeDataProvider('books', this.bookProvider);
        vscode.window.registerTreeDataProvider('catalog', this.catalogProvider);
        vscode.workspace.onDidChangeConfiguration((e: any) => {
            this.config = vscode.workspace.getConfiguration("read-book-status-bar");
            this.bookProvider.getBooks();
        });
    }

    // 停止阅读
    stop() {
        this.isStop = true;
        clearTimeout(this.timeout);
    }
    /**
     * 老板键
     */
    boss() {
        this.stop();
        var text: any = this.config.get('bosstext');
        this.write(text);
    }
}