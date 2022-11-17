import log from "../utils/log";
import Driver, { ParseItem } from "./driver";
var format = require('string-format');
var Crawler = require("crawler");
import GBK from "../utils/gbk";

var c = new Crawler({});
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
        log.info("setDriver" + JSON.stringify(driver));
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
    async catalog(item: any): Promise<ParseItem[]> {
        let url = format(this.handler.catalogUrl || "{list}", { list: item.detail });
        if (url.startsWith("http://") || url.startsWith("https://")) {

        } else {
            url = this.handler.url + url;
        }
        let content = await this.request(url);
        return this.handler.getCatalogList(content);
    }
    /**
     * 文章内容
     */
    async content(item: any): Promise<string> {

        let url = format(this.handler.contentUrl || "{list}{content}", { list: item.parent.detail || item.parent.url, content: item.url });
        if (url.startsWith("http://") || url.startsWith("https://")) {

        } else {
            url = this.handler.url + url;
        }
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
            log.info('request 请求：' + url);
            c.queue([{
                uri: url,
                methods: this.handler.method || "GET",
                gzip: this.handler.gzip,
                // The global callback won't be called
                callback: function (error: any, res: any, done: Function) {
                    if (error) {
                        log.info(error);
                    } else {
                        var $ = res.$;
                        // $ 默认为 Cheerio 解析器
                        // 它是核心jQuery的精简实现，可以按照jQuery选择器语法快速提取DOM元素
                        resolve($);
                    }
                    done();
                }
            }]);
        });
    }
}