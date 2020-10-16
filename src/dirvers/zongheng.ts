import { Dirvers } from "../interface/dirvers";
import { get } from "../http";
var iconv = require("iconv-lite");
class ZongHeng implements Dirvers {
  _list: any;
  navlist: any;
  name: string = "";

  async list(item: any) {
    const $ = await get(item.link,'UTF-8').catch((err: any) => {
      console.log(err);
    });
    let list: any = [];
    // @ts-ignore
    $(".chapter-list li").each(function (i, elem) {
      list[i] = {
        // @ts-ignore
        title: $(this).text(),
        // @ts-ignore
        link: $(this).find('a').attr("href"),
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
    return $(".content").text();
  }

  async search(name: string) {
    this.name =encodeURIComponent(name);
    let url =
      "https://search.zongheng.com/s?keyword=" +
      this.name;
    const $:any = await get(url,'UTF-8').catch((err: any) => {
      console.log(err);
    });
    let list: any = [];
    // @ts-ignore
    $('.search-tab .search-result-list').each(function (i, elem) {
      // @ts-ignore
      list[i] = {
        // @ts-ignore
        title: $(this).find("h2").text(),
        // @ts-ignore
        link:$(this).find("h2 a").attr("href").replace("/book/",'/showchapter/'),
      };
    });
    this.navlist = list;
    console.log(list);
    return list;
  }
}
export default new ZongHeng();
