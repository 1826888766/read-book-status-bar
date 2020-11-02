/* eslint-disable eqeqeq */
const path = require("path");
const fs = require("fs");
import { setTimeout } from "timers";
import {
    window,
    StatusBarAlignment,
    StatusBarItem,
    QuickPick,
    QuickPickItem,
    ConfigurationTarget,
    ThemeIcon,
    QuickInputButton,
    WorkspaceConfiguration,
} from "vscode";
import request from "./request";

export class Log {
    private statusBar !: StatusBarItem;
    private contextArr: Array<string> = [];
    private navList: any = [];
    private navIndex = 0;
    private pageIndex = 0;
    private bookList = [];
    private timeout: any = 0;
    private selectNav: boolean = false;
    private isStop: boolean = false;

    private quickPick!: QuickPick<QuickPickItem>;
    private navPage = {
        cur: 0,
        limits: 10,
    };
    private bookPage = {
        cur: 0,
        limits: 10,
    };
    private active!: QuickPickItem;
    private activeNav: any = [];
    name: string = "";

    private config!: WorkspaceConfiguration;
    private playBar!: StatusBarItem;
    private log!: StatusBarItem;
    /**
     *
     * @param config 初始化
     */
    constructor(config: WorkspaceConfiguration) {
        this.setConfig(config);
        this.initStatusBar();
        this.initQuickPick();
        this.pageIndex = this.config.pageIndex || 0;
        this.navIndex = this.config.navIndex || 0;
        this.navPage.cur = parseInt((this.config.navIndex / this.navPage.limits).toString());
    }
    /**
     * 设置配置文件
     * @param config 
     */
    public setConfig(config: WorkspaceConfiguration) {
        if (!this.config || this.config.type !== config.type) {
            this.config = config;
            console.log(config);
        }
    }

    /**
     * 初始化下拉选择框
     */
    private initQuickPick() {
        this.quickPick = window.createQuickPick();
        this.quickPick.onDidChangeSelection((res: QuickPickItem[]) => {
            if (res[0]) {
                if (this.selectNav) {
                    this.navIndex = Number(res[0].label.split(".")[0]);
                    this.activeNav = this.navList[this.navIndex];
                    this.read();
                } else {
                    this.active = res[0];
                    this.navIndex = 0;
                    this.navPage.cur = 0;
                    this.navList = [];
                    this.list();
                }
            }
        });
        this.quickPick.placeholder = "请选择想要的书籍";
        let time: any = 0;
        this.quickPick.onDidChangeValue((e: string) => {
            clearTimeout(time);
            if (this.selectNav) {
                this.quickPick.hide();
                return;
            }
            time = setTimeout(() => {
                this.search(e);

            }, 300);
        });
        this.quickPick.onDidTriggerButton((e: QuickInputButton) => {
            if (e.tooltip == "上一页") {
                this.pre();
            } else {
                this.next();
            }
        });
        this.quickPick.title = "搜索书籍";
    }
    /**
     * 初始化底部状态栏按钮
     */
    private initStatusBar() {
        this.log = window.createStatusBarItem(StatusBarAlignment.Left);
        this.log.show();
        this.statusBar = window.createStatusBarItem(StatusBarAlignment.Right);
        this.statusBar.command = "read-book-status-bar.list";
        this.statusBar.text = "$(book)";
        this.statusBar.tooltip = "正在获取...";
        this.statusBar.show();

        let status = window.createStatusBarItem(StatusBarAlignment.Right);
        status.command = "read-book-status-bar.next";
        status.text = "$(chevron-right)";
        status.tooltip = "下一章";
        status.show();
        this.playBar = window.createStatusBarItem(StatusBarAlignment.Right);
        this.playBar.command = "read-book-status-bar.stop";
        this.playBar.text = "$(play)";
        this.playBar.tooltip = "停止";
        this.playBar.show();
        let per = window.createStatusBarItem(StatusBarAlignment.Right);
        per.command = "read-book-status-bar.pre";
        per.text = "$(chevron-left)";
        per.tooltip = "上一章";
        per.show();
        let search = window.createStatusBarItem(StatusBarAlignment.Right);
        search.command = "read-book-status-bar.search";
        search.text = "$(search)";
        search.tooltip = "搜索";
        search.show();
    }
    /**
     * 上一页 （淡出列表翻页）
     */
    private pre() {
        if (this.selectNav) {
            if (this.navPage.cur == 0) {
                window.showWarningMessage("已是第一页");
                return;
            }
            this.navPage.cur -= 1;
            this.showNavList();
        } else {
            if (this.bookPage.cur == 0) {
                window.showWarningMessage("已是第一页");
                return;
            }
            this.bookPage.cur -= 1;
            this.showBookList();
        }
    }
    /**
     * 下一页 （淡出列表翻页）
     */
    private next() {
        if (this.selectNav) {
            if (
                this.navPage.cur >=
                parseInt((this.navList.length / this.navPage.limits).toString())
            ) {
                window.showWarningMessage("已是最后一页");
                return;
            }
            this.navPage.cur += 1;
            this.showNavList();
        } else {
            if (
                this.bookPage.cur >=
                parseInt((this.bookList.length / this.bookPage.limits).toString())
            ) {
                window.showWarningMessage("已是最后一页");
                return;
            }
            this.bookPage.cur += 1;
            this.showBookList();
        }
    }
    /**
     * 上一章
     */
    public prePage() {
        if (this.navIndex == 0) {
            window.showWarningMessage("已是第一章");
            return;
        }
        this.activeNav = this.navList[this.navIndex];

        this.pageIndex = 0;
        this.navIndex -= 1;
        this.read();
    }
    /**
     * 下一章
     */
    public nextPage() {
        if (this.navIndex >= this.navList.length - 1) {
            window.showWarningMessage("已是最后一章");
            return;
        }
        this.activeNav = this.navList[this.navIndex];

        this.pageIndex = 0;
        this.navIndex += 1;
        this.read();
    }
    /**
     * 停止/开始
     */
    public stop(type = false) {
        this.isStop = type || !this.isStop;
        if (this.isStop) {
            this.playBar.text = "$(debug-start)";
            this.playBar.tooltip = "开始";
            clearTimeout(this.timeout);
        } else {
            this.playBar.text = "$(debug-pause)";
            this.playBar.tooltip = "停止";
            this.inteval();
        }
    }
    // 输出文本
    public write(msg: string) {
        this.log.text = msg;
    }
    // 加载文本
    public loading(msg: string) {
        this.log.text = "$(loading)" + msg;
    }
    /**
     * 销毁方法
     */
    public dispose() {
        this.statusBar.dispose();
        this.quickPick.dispose();
        this.log.dispose();

    }
    /**
     * 显示搜索道德书籍列表
     */
    public showBookList() {
        this.quickPick.title = "选择书籍";
        let items = [];
        if (this.bookList.length > 10) {
            let start: number = this.bookPage.cur * this.navPage.limits;
            let end: number = start + Number(this.bookPage.limits);
            items = this.bookList.slice(start, end);
        } else {
            items = this.bookList;
        }
        this.quickPick.items = items.reduce((pre: any, cur: any) => {
            pre.push({
                label: cur.title,
                detail: cur.link,
            });
            return pre;
        }, []);
        setTimeout(() => {
            this.quickPick.show();
        }, 150);
    }
    /**
     * 显示选择的书籍目录
     */
    public showNavList() {
        this.quickPick.title = "选择书籍目录";
        let start: number = this.navPage.cur * this.navPage.limits;
        let end: number = start + Number(this.navPage.limits);
        this.quickPick.value = "";
        let items = this.navList.slice(start, end);
        this.quickPick.items = items.reduce((pre: any, cur: any, index: number) => {
            pre.push({
                label: start + index + "." + cur.title || "",
                detail: cur.link,
            });
            return pre;
        }, []);
        if (this.activeNav) {
            this.quickPick.selectedItems = [
                {
                    label: this.activeNav.title,
                    detail: this.activeNav.link
                }
            ];
            this.quickPick.activeItems = [
                {
                    label: this.activeNav.title,
                    detail: this.activeNav.link
                }
            ];

        }

        this.quickPick.show();
    }
    /**
     * 搜索书籍
     * @param name 
     */
    public async search(name: string = "") {
        this.selectNav = false;
        this.stop(true); // 强制停止
        this.quickPick.buttons = [
            {
                tooltip: "上一页",
                iconPath: new ThemeIcon("arrow-left"),
            },
            {
                tooltip: "下一页",
                iconPath: new ThemeIcon("arrow-right"),
            },
        ];
        if (name == "列表") {
            return this.showBookList();
        }
        this.loading("正在搜索书籍");
        this.quickPick.busy = true;

        this.name = name;
        this.bookList = await request
            .setDirvers(this.config.type)
            .search(this.name);
        this.quickPick.busy = false;
        this.showBookList();
    }
    /**
     * 获取目录
     */
    public async list() {
        this.name = this.active.label;
        this.quickPick.buttons = [
            {
                tooltip: "上一页",
                iconPath: new ThemeIcon("arrow-left"),
            },
            {
                tooltip: "下一页",
                iconPath: new ThemeIcon("arrow-right"),
            },
        ];
        this.updateConfig("name", this.active.label);
        this.updateConfig("link", this.active.detail);
        this.quickPick.busy = true;
        this.loading("正在获取书籍目录信息");
        this.selectNav = true;
        if (this.navList.length > 0) {
            this.showNavList();
            this.quickPick.busy = false;
            return;
        }
        this.navList = await request.setDirvers(this.config.type).list({
            link: this.active.detail,
            name: this.active.label,
        });
        this.showNavList();
        this.quickPick.busy = false;

    }
    /**
     * 更新配置
     * @param key 
     * @param value 
     */
    private updateConfig(key: string, value: any) {
        if (this.config.has(key)) {
            this.config
                .update(key, value, ConfigurationTarget.Global)
                .then(() => { })
                .then(undefined, (err) => {
                    console.log("更新配置失败");
                });
        } else {
            console.log("更新配置失败");
        }
    }

    /**
     * 读取章节内容
     */
    public async read(isInit = false) {
        if (!this.activeNav) {
            this.write("请搜索书籍");
            return;
        }
        if(!isInit){
            this.isStop = false;
        }
        this.statusBar.tooltip = this.activeNav.title;

        this.selectNav = true;
        this.updateConfig("navIndex", this.navIndex);
        let res = await request.setDirvers(this.config.type).read({
            link: this.navList[this.navIndex].link,
        });
        this.contextArr = res.replace(/[(\r\n)\r\n]+/, '。').split(/[(。|！|\!|\.|？|\?)]/);
        this.inteval();
    }
    /**
     * 获取分割行内容
     */
    public getContext(): string {
        return this.contextArr[this.pageIndex];
    }
    /**
     * 初始运行
     */
    public async run() {
        this.isStop = !this.config.autoRead;
        if (this.config.name) {
            this.name = this.config.name;

            this.active = {
                label: this.config.name,
                detail: this.config.link,
            };
            this.navList = await request.setDirvers(this.config.type).list({
                link: this.active.detail,
                name: this.active.label,
            });
            this.activeNav = this.navList[this.config.navIndex];
            if (this.isStop) {
                this.playBar.text = "$(debug-start)";
                this.playBar.tooltip = "开始";
            } else {
                this.playBar.text = "$(debug-pause)";
                this.playBar.tooltip = "停止";
            }
            if(this.config.autoRead){
                this.read(true);
            }
        } else {
            this.write("请搜索书籍");
        }
    }
    /**
     * 间隔执行输出
     */
    private inteval(text = "") {
        text = text || this.getContext();
        clearTimeout(this.timeout);
        this.pageIndex++;
        if (text === undefined) {
            this.nextPage();
            return;
        }
        text = text.trim();
        if (!text) {
            this.inteval();
            return;
        }

        let speed = this.config.speed;
        if (text.length < 20) {
            speed = speed / 2;
        }

        if (text.length > this.config.rowLength) {
            this.write(text.substring(0, this.config.rowLength));
            if (this.isStop) {
                return;
            }
            let nextText = text.substring(this.config.rowLength);
            this.timeout = setTimeout(() => {
                this.inteval(nextText);
            }, speed);
            return;
        }

        this.write(text);
        if (this.isStop) {
            return;
        }
        this.timeout = setTimeout(() => {
            this.inteval();
        }, speed);
    }
}
