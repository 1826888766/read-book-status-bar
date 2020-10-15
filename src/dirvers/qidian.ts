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
    const $ = await get(item.link).catch((err: any) => {
      console.log(err);
    });
    let list: any = [];
    // @ts-ignore
    $("dd a").each(function (i, elem) {
      list[i] = {
        // @ts-ignore
        title: $(this).text(),
        // @ts-ignore
        link: item.link + $(this).attr("href"),
      };
    });
    this._list = list;
    return list;
  }

  async read(item: any) {
    const $ = await get(item.link).catch((err: any) => {
      console.log(err);
    });
    // @ts-ignore
    return $("#content").text();
  }

  async search(name: string) {
    this.name = encodeURIComponent(name);
    let url =
      "https://www.qidian.com/search?kw=" +
      this.name;
    const $:any = await get(url).catch((err: any) => {
      console.log(err);
    });
    let list: any = [];
    // @ts-ignore
    $('#result-list  ul li').each(function (i, elem) {
      // @ts-ignore
      console.log($(this).html());
      list[i] = {
        // @ts-ignore
        title: $(this).find(".s2").text(),
        // @ts-ignore
        link: $(this).find(".s2 a").attr("href"),
      };
    });
    this.navlist = list;
    return list;
  }
}
export default new QiDian();
