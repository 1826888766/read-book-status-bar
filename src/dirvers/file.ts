/* eslint-disable @typescript-eslint/naming-convention */
import { Dirvers } from "../interface/dirvers";
import { Import } from "../util/import";
import { Sqlite } from "../util/Sqlite";
import {workspace} from "vscode";
class File implements Dirvers {
  _list: any;
  navlist: any;
  name: string = "";
  _import: any;
  sqlite: Sqlite;

  constructor() {
    this.sqlite = new Sqlite();
  }
  async list(item: any, config: any) {
    this.name =item.title;
    var navList:any = await this.sqlite.table('book_nav').where('book_id', item.id).select();
    if (navList.length) {
      return navList;
    }
    this._import = new Import({ rule: config.rule });
    this._import = this._import.read(item.link);
    return this._import.navList;
  }

  async read(item: any) {
    var config = workspace.getConfiguration();
    var nav: any = await this.sqlite.table('book_nav').where('id', item.id).find();
    var book: any = await this.sqlite.table('book').where('id', nav.book_id).find();
    if (book) {
      this._import = new Import({ rule: config.rule });
      this._import = this._import.read(book.url);
      return this._import.navList[nav.url].content;
    }
    return "获取文章失败";
  }

  async search(name: string) {
    return [];
  }

  async save(book: any) {
    this._import.navList.forEach((item: any, index: any) => {
      this.sqlite.table('book_nav').create({
        title: item.title,
        url: item.link,
        book_id: book.id,
        content: this._import.content[index]
      });
    });
  }
}
export default new File();
