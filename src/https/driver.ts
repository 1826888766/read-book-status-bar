export interface ParseItem {
    /**
     * 详情解析规则
     */
    list: string
    /**
     * 详情解析规则
     */
    url: string
    /**
     * 内容解析规则
     */
    content: string
}

export default class Driver {
    /**
     * 网站名称
     */
    name: string = "";
    gzip: boolean = true;
    method: string = "GET";
    searchUrlChartSet: string = "utf-8";
    page: boolean = false;
    contentPage:boolean = false;
    contentCheckNext:any = "";
    data:any = {};
    /**
     * 网站地址
     */
    url: string = "";
    /**
     * 搜索地址
     */
    contentUrl: any = "";
    searchUrl: any = "";
    cookie: string = "";
    catalogUrl: any = "";
    /**
     * 搜索解析规则
     */
    parseSearch: ParseItem = {
        list: "",
        url: "",
        content: ""
    };
    /**
     * 目录解析规则
     */
    parseCatalog: ParseItem = {
        url: "",
        list: "",

        content: ""
    };
    /**
    * 内容解析规则
    */
    parseContent: ParseItem = {
        url: "",
        list: "",
        content: ""
    };

    getSearchList(value: any): ParseItem[] {
        return this.execParseList(value, this.parseSearch);
    }

    getCatalogList(value: any): ParseItem[] {
        return this.execParseList(value, this.parseCatalog);
    }

    getContent(value: any): string {
        return this.execParseItem(this.parseContent.content, value);
    }

    /**
     * 解析内容
     */
    execParseList($: any, parse: ParseItem): ParseItem[] {
        let list: ParseItem[] = [];
        console.log($.html());
        $(parse.list).each((i: number, elem: any) => {
            let item: ParseItem = {
                url: "",
                list: "",
                content: ""
            };
            item.url = this.execParseItem(parse.url, $(elem));
            item.content = this.execParseItem(parse.content, $(elem)).replace("\r\n","").trim();
            list[i] = item;
        });
        return list;
    }

    execParseItem(parse: string, $: any): string {
        let dom = parse.split(":")[0];
        let attr = parse.split(":")[1];
        let data;
        if (dom) {
            if (typeof $.find === "function") {
                data = $.find(dom);
            } else {
                data = $(dom);
            }
        } else {
            data = $;
        }
        if (attr) {
            return data.attr(attr);
        } else {
            return data.text();
        }
    }

    static parse(driver: any) {
        let obj = new Driver();
        if (typeof driver === "string") {
            driver = JSON.parse(driver);
        }
        obj = Object.assign(obj,driver);
        return obj;
    }
}
