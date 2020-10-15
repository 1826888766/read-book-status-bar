/* eslint-disable eqeqeq */
import { start } from "repl";
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
  private statusBar: StatusBarItem;
  private contextArr: Array<string> = [];
  private navList: any = [];
  private navIndex = 0;
  private pageIndex = 0;
  private bookList = [];
  private timeout:any = 0;
  private selectNav: boolean = false;
  private quickPick: QuickPick<QuickPickItem>;
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

  constructor(config: WorkspaceConfiguration) {
    this.config = config;
    this.pageIndex = this.config.pageIndex || 0;
    this.navIndex = this.config.navIndex || 0;
    this.quickPick = window.createQuickPick();
    let status = window.createStatusBarItem(StatusBarAlignment.Right);
    status.command = "read-book-status-bar.next";
    status.text = "下一章";
    status.tooltip = "下一章";
    status.show();
    this.statusBar = window.createStatusBarItem(StatusBarAlignment.Right);
    this.statusBar.text = "当前章";
    this.statusBar.tooltip = "正在获取...";
    this.statusBar.color = "red";
    this.statusBar.show();
    let per = window.createStatusBarItem(StatusBarAlignment.Right);
    per.command = "read-book-status-bar.pre";
    per.text = "上一章";
    per.tooltip = "上一章";
    per.show();
    this.quickPick.onDidChangeSelection((res: QuickPickItem[]) => {
      if (res[0]) {
        if (this.selectNav) {
          this.navIndex = Number(res[0].label.split(".")[0]);
          this.activeNav = this.navList[this.navIndex];
          this.read();
        } else {
          this.active = res[0];
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
        return;
      }
      time = setTimeout(() => {
        this.search(e);
      }, 300);
    });
    this.quickPick.onDidTriggerButton((e: QuickInputButton) => {
      console.log(e);
      if (e.tooltip == "上一页") {
        this.pre();
      } else {
        this.next();
      }
    });
    this.quickPick.onDidAccept;

    this.quickPick.title = "搜索书籍";
  }

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

 private next() {
    console.log(this.navList.length);
    console.log(parseInt((this.navList.length / this.navPage.limits).toString()));
    console.log(this.navPage.cur);
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

  public prePage() {
    if(this.navIndex == 0){
      window.showWarningMessage("已是第一章");
      return;
    }
    this.activeNav = this.navList[this.navIndex];

    this.pageIndex = 0;
    this.navIndex -=1;
    this.read();
  }

 public nextPage() {
   if(this.navIndex >= this.navList.length -1){
    window.showWarningMessage("已是最后一章");
    return;
   }
   this.activeNav = this.navList[this.navIndex];

   this.pageIndex = 0;
    this.navIndex -=1;
    this.read();
  }
  public write(msg: string) {
    window.setStatusBarMessage(msg,3000);
  }

  public dispose() {
    this.statusBar.dispose();
  }

  public showBookList() {
    this.quickPick.title = "选择书籍";
    let start: number = this.bookPage.cur * this.navPage.limits;
    let end: number = start + Number(this.bookPage.limits);
    let items = this.bookList.slice(start, end);
    this.quickPick.items = items.reduce((pre: any, cur: any) => {
      pre.push({
        label: cur.title,
        detail: cur.link,
      });
      return pre;
    }, []);
    this.quickPick.show();
  }

  public showNavList() {
    this.quickPick.title = "选择书籍目录";
    let start: number = this.navPage.cur * this.navPage.limits;
    let end: number = start + Number(this.navPage.limits);
    this.quickPick.value = "";
    let items = this.navList.slice(start, end);
    this.quickPick.items = items.reduce((pre: any, cur: any, index: number) => {
      pre.push({
        label: index + "." + cur.title || "",
        detail: cur.link,
      });
      return pre;
    }, []);
    this.quickPick.show();
  }

  public async search(name: string = "") {
    this.selectNav = false;
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
    this.name = name;
    this.bookList = await request
      .setDirvers(this.config.type)
      .search(this.name);
    this.showBookList();
  }

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
    this.write("正在获取书籍目录信息");
    this.selectNav = true;
    if (this.navList.length > 0) {
      this.showNavList();
      return;
    }
    this.navList = await request.setDirvers(this.config.type).list({
      link: this.active.detail,
      name: this.active.label,
    });
    this.showNavList();
  }
  private updateConfig(key: string, value: any) {
    if (this.config.has(key)) {
      this.config
        .update(key, value, ConfigurationTarget.Global)
        .then(() => {})
        .then(undefined, (err) => {
          console.log("更新配置失败");
        });
    } else {
      console.log("更新配置失败");
    }
  }
  public async read() {
    if (!this.activeNav) {
      this.write("请搜索书籍");
      return;
    }
    this.statusBar.tooltip = this.activeNav.title;

    this.selectNav = true;
    this.updateConfig("navIndex", this.navIndex);
    let res = await request.setDirvers(this.config.type).read({
      link: this.navList[this.navIndex].link,
    });
    res = res.replace(/。|\./g, "\n");
    this.contextArr = res.split(/[(\r\n)\r\n]+/);
    this.inteval();
  }

  public getContext(): string {
    return this.contextArr[this.pageIndex];
  }

  public async run() {
    if (this.config.name && this.config.autoRead) {
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
      
      this.read();
    } else {
      this.write("请搜索书籍");
    }
  }


  private inteval() {
    let text = this.getContext();
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
    this.write(text);
    this.timeout = setTimeout(() => {
      this.inteval();
    }, speed);
  }
}
