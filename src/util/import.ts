const fs = require("fs");
const path = require("path");
const os = require("os");
var iconv = require("iconv-lite");
export class Import {
    public rule = /(正文){0,1}(\s|\n)(第)([\u4e00-\u9fa5a-zA-Z0-9]{1,7})[章][^\n]{1,35}(|\n)/g;
    public navList: any = [];
    public content: any = [];
    constructor(config: any) {
        if (config.rule) {
            this.rule = new RegExp(config.rule, 'g');
        }
        if (config.file) {
            this.read(config.file);
        }
    }

    read(file: string) {
        if (!file) {
            return false;
        }
        var platform = os.platform();
        if (platform.search("win") !== false) {
            file = file.replace('\/', '');
        }
        var data = fs.readFileSync(file);
        var string = data.toString();
        this.praseNav(string);
        this.navList = this.navList.sort(function (a: any, b: any) {
            return a.link - b.link;
        });
        this.praseContent(string);
        return this;
    }

    praseNav(text: string) {
        var navList;
        var i = 0;
        while (navList = this.rule.exec(text)) {
            this.navList.push({
                title: navList[0].replace(/(\r|\n)/g, ""),
                link: i.toString(),
            });
            i++;
        }
    }

    praseContent(text: string) {

        for (var i = 1; i <= this.navList.length; i++) {
            var rule;
            if (i == this.navList.length) {
                rule = new RegExp(this.navList[i - 1].title + "([\\s|\\S]+)", "g");
            } else {
                rule = new RegExp(this.navList[i - 1].title + "([\\s|\\S]+)" + this.navList[i].title, "g");
            }
            var content;
            while (content = rule.exec(text)) {
                this.navList[i - 1]['content'] = content[1].replace(/(\r|\n)/g, "");
            }
        }
    }

}