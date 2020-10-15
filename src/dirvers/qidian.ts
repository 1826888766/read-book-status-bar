import { Dirvers } from "../interface/dirvers";
import { get } from "../http";
import gbk from "../util/GBK";
import { Log } from "../util/log";
var iconv = require("iconv-lite");
class QiDian implements Dirvers {
  _list: any;
  navlist: any;
  name: string = "";

  async list(item: any) {
    const $ = await get(item.link,'UTF-8').catch((err: any) => {
      console.log(err);
    });
    let list: any = [];
    // @ts-ignore
    $(".volume-wrap li a").each(function (i, elem) {
      list[i] = {
        // @ts-ignore
        title: $(this).text(),
        // @ts-ignore
        link: 'https:'+$(this).attr("href"),
      };
    });
    this._list = list;
    console.log(list);
    return list;
  }
  
  async read(item: any) {
    const $:any = await get(item.link,'UTF-8').catch((err: any) => {
      console.log(err);
    });
    return $(".main-text-wrap .read-content").text();
  }

  async search(name: string) {
    this.name =encodeURIComponent(name);
    let url =
      "https://www.qidian.com/search?kw=" +
      this.name;
    const $:any = await get(url,'UTF-8').catch((err: any) => {
      console.log(err);
    });
    let list: any = [];
    // @ts-ignore
    $('#result-list .book-img-text ul li').each(function (i, elem) {
      // @ts-ignore
      
      list[i] = {
        // @ts-ignore
        title: $(this).find("h4").text(),
        // @ts-ignore
        link:'https:'+ $(this).find("h4 a").attr("href")+'#Catalog',
      };
    });
    this.navlist = list;
    return list;
  }
}
export default new QiDian();
