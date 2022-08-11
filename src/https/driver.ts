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

    searchUrlChartSet: string = "utf-8";
    contentUrl: string = "";
    /**
     * 网站地址
     */
    url: string = "";
    /**
     * 搜索地址
     */
    searchUrl: string = "";
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
        $(parse.list).each((i: number, elem: any) => {
            let item: ParseItem = {
                url: "",
                list: "",
                content: ""
            };
            item.url = this.execParseItem(parse.url, $(elem));
            item.content = this.execParseItem(parse.content, $(elem));
            list[i] = item;
        });
        return list;
    }

    execParseItem(parse: string, $: any): string {
        let dom = parse.split(":")[0];
        let attr = parse.split(":")[1];
        let data;
        if (dom) {
            if (typeof $.find == "function"){
                data = $.find(dom);
            }else{
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
        obj.name = driver.name;
        obj.url = driver.url;
        obj.searchUrl = driver.searchUrl;
        if (driver.searchUrlChartSet) {
            obj.searchUrlChartSet = driver.searchUrlChartSet;
        }
        if (driver.contentUrl) {
            obj.contentUrl = driver.contentUrl;
        }
        obj.parseSearch = driver.parseSearch;
        obj.parseCatalog = driver.parseCatalog;
        obj.parseContent = driver.parseContent;
        return obj;
    }
}
