import log from "../utils/log";
import Driver, { ParseItem } from "./driver";
var uri = require("url");
var cheerio = require("cheerio");
var iconv = require("iconv-lite");
var format = require('string-format');
import GBK from "../utils/gbk";
export default class Request {
    //@ts-ignore
    public handler: Driver;

    constructor(driver: any) {
        this.setDriver(driver);
    }

    static instance?: Request;

    static getInstance(driver?: any): Request {
        if (!this.instance) {
            this.instance = new Request(driver);
        } else {
            if (driver) {
                this.instance.setDriver(driver);
            }
        }

        return this.instance;
    }

    setDriver(driver: any) {
        log.info("setDriver"+JSON.stringify(driver));
        if (typeof driver === "string") {
            driver = JSON.parse(driver);
        }
        if (!this.handler) {
            this.handler = Driver.parse(driver);
        } else {
            if (driver.name !== this.handler.name) {
                this.handler = Driver.parse(driver);
            }
        }

    }

    /**
     * 搜索书籍
     */
    async search(name: string): Promise<ParseItem[]> {
        if (this.handler.searchUrlChartSet === "gbk") {
            name = GBK.encodeURI(name);
        } else {
            name = encodeURI(name);
        }
        let url = format(this.handler.searchUrl, { name });
        let content = await this.request(this.handler.url + url);
        return this.handler.getSearchList(content);
    }

    /**
     * 书籍目录
     */
    async catalog(url:string): Promise<ParseItem[]> {
        let content = await this.request(url);
        return this.handler.getCatalogList(content);
    }
    /**
     * 文章内容
     */
    async content(item:any): Promise<string> {
        let url = format(this.handler.contentUrl||"{list}{content}",{list:item.parent.detail||item.parent.url,content:item.url});
        let content = await this.request(url);
        return this.handler.getContent(content);
    }

    /**
     * 发起请求
     * @param url 
     * @param decode 
     * @returns 
     */
    request(url: string, decode: string = "GBK"): Promise<any> {
        return new Promise((resolve, reject) => {
            var options = uri.parse(url);
            var http;
            if (url.search('http://') !== -1) {
                http = require("http");
            } else {
                http = require("https");
            }
            log.info('request 请求：'+url);
            var req = http.request(options, function (res: any) {
                let html = "";
                res.on("data", (data: any) => {
                    html += iconv.decode(data, decode);
                });
                res.on("end", () => {
                    resolve(cheerio.load(html));
                });
            });

            req.on("error", function (e: any) {
                console.log("problem with request: " + e.message);
                reject(e.message);
            });

            req.end();
        });
    }
}