import { Dirvers } from '../interface/dirvers'
import { get } from "../http"
import gbk from "../util/GBK"

var iconv = require("iconv-lite");
class BiQuGe implements Dirvers {
    _list: any;
    name:string = "";

    list() {
        return this._list;
    }
    async read(index:number) {
        let item = this._list[index];
        const $ = await get('https://www.xbiquge.cc/book/' + encodeURI(this.name) + '/' + item.link);
        // @ts-ignore
        return $("#content").text()
    }


    async search(name: string) {
        this.name = name;
        let b = Buffer.from(name)
        this.name = iconv.decode(b, 'GBK');
        let url ='https://www.xbiquge.cc/modules/article/search.php?searchkey='+encodeURIComponent(encodeURIComponent(this.name))
        const $ = await get(url);
        let list: any = []
        // @ts-ignore
        console.log($.html())
        console.log($("#main").text())

        // $("dd a").each(function (i, elem) {
        //     list[i] = {
        //         // @ts-ignore
        //         title: $(this).text(),
        //         // @ts-ignore
        //         link: $(this).attr('href')
        //     }
        // })
        // this._list = list;
        console.log(list)
    }
}
export default new BiQuGe()