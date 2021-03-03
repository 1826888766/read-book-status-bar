const fs = require("fs");
const path = require("path");
const os = require("os");
var iconv = require("iconv-lite");
export class Import {
    public rule = /\s{0}第.{1,7}(章|节|集|卷|部|篇).{0,}/g;
    public navList:any = [];
    public content: any = [];
    constructor(config:any) {
        if (config.rule) {
            this.rule =  new RegExp(config.rule,'g');
        }
        if (config.file) {
            this.read(config.file);
        }
    }

    read(file: string) {
        if(!file) {
            return false;
        }
        var platform = os.platform();
        if (platform.search("win") !== false) {
            file = file.replace('\/', '');
        }
        var data = fs.readFileSync(file);
        var string =data.toString();
        this.praseNav(string);
        this.praseContent(string);
        return this;
    }

    praseNav(text: string) {
        var navList;
        var i=0;
        while (navList = this.rule.exec(text)) {
            this.navList.push({
                title:navList[0],
                link:i.toString()
            });
            i++;
        }
    }

    praseContent(text: string) {
        var content = text.split(this.rule);
        var contents: any = [];
        var i = -1;
        for (var key in content) {
            if (content[key].length === 1 && '章节集卷部篇'.search(content[key]) !== -1) {
                i += 1;
            }
            if (i >= 0) {
                contents[i] = content[key];
            }
        }
        this.content = contents;
    }

}