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
        let rule = this.handler.searchUrl;
        let url = this.buildUrl('before', rule, rule);
        url = format(url, { name });
        url = this.buildUrl('after', rule, url);
        let content = await this.request(url);
        return this.handler.getSearchList(content);
    }

    /**
     * 书籍目录
     */
    async catalog(item: any): Promise<ParseItem[]> {
        if (this.handler.page) {
            let page = 0;
            let catalog: ParseItem[] = [];
            while (true) {
                page++;
                let url = this.buildCatalogUrl(item.detail, page);
                let content = await this.request(url);
                let list = this.handler.getCatalogList(content);
                if (list) {
                    catalog = catalog.concat(list);
                } else {
                    break;
                }

            }
            return catalog;
        } else {
            let url = this.buildCatalogUrl(item.detail, 1);
            let content = await this.request(url);
            return this.handler.getCatalogList(content);
        }
    }

    buildUrl(action: any, url: any, params: any) {

        if (action === "after") {

            if (typeof url !== "string") {
                if (url[action]) {
                    if (typeof url[action] === "string") {
                        url = url[action];
                    } else {
                        if (url[action].type === "function") {
                            eval(`function fun(url){ ${url[action].value} };url = fun("${params}");`);
                        } else if (url[action].type === "replace") {
                            url = params.replace(url[action].value[0], url[action].value[1]);
                        } else {
                            url = params;
                        }
                    }
                }
            } else {
                url = params;
            }

            if (url.startsWith("http://") || url.startsWith("https://")) {

            } else {
                url = this.handler.url + url;
            }
        } else {
            if (typeof url !== "string") {
                if (url[action]) {
                    if (typeof url[action] === "string") {
                        url = url[action];
                    } else {
                        if (url[action].type === "function") {
                            eval(`function fun(url){ return ${url[action].value} };url = fun("${params}");`);
                        }
                    }
                }
            }
        }

        return url;
    }

    buildCatalogUrl(list: string, page: number) {
        let defaultValue = !this.handler.page ? '{list}' : "{list}?page={page}";
        let rule = this.handler.catalogUrl || defaultValue;
        let url = this.buildUrl('before', rule, rule);
        url = format(url, { list, page });
        return this.buildUrl('after', rule, url);
    }


    /**
     * 文章内容
     */
    async content(item: any): Promise<string> {

        if (this.handler.contentPage) {
            let list: string[] = [];
            let rule = this.handler.contentUrl || "{list}{content}";
            let url = this.buildUrl('before', rule, rule);
            url = format(url, { list: item.parent.detail || item.parent.url, content: item.url });
            url = this.buildUrl('after', rule, url);
            let content = await this.request(url);
            list.push(this.handler.getContent(content));
            while (true) {
                let nextText = this.handler.execParseItem(this.handler.contentCheckNext.content, content);
                if (nextText.replaceAll('\r\n', '').trim() !== (this.handler.contentCheckNext.text||'下一页')) {
                    break;
                }
                let nextUrl = this.handler.execParseItem(this.handler.contentCheckNext.url, content);
                let rule = this.handler.contentUrl || "{list}{content}";
                let url = this.buildUrl('before', rule, rule);
                url = format(url, { list: item.parent.detail || item.parent.url, content:nextUrl });
                url = this.buildUrl('after', rule, url);
                content = await this.request(url);
                list.push(this.handler.getContent(content));
            }
            return list.join("");
        } else {
            let rule = this.handler.contentUrl || "{list}{content}";
            let url = this.buildUrl('before', rule, rule);
            url = format(url, { list: item.parent.detail || item.parent.url, content: item.url });
            url = this.buildUrl('after', rule, url);
            let content = await this.request(url);
            return this.handler.getContent(content);
        }

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
                followAllRedirects: true,
                methods: this.handler.method || "GET",
                gzip: this.handler.gzip,
                referer: this.handler.url,
                // The global callback won't be called
                callback: function (error: any, res: any, done: Function) {
                    if (error) {
                        log.info(error);
                    } else {
                        var $ = res.$;
                        log.info(res);
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