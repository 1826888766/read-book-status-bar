import { Dirvers } from "../interface/dirvers";
import { Import } from "../util/import";
import { Sqlite } from "../util/Sqlite";
const path = require("path");

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
    this.name = path.basename(item.link);
    var book: any = await this.sqlite.table('book').where('title', this.name).find();
    if (book) {
      return await this.sqlite.table('book_nav').where('nav_id', book.id).select();
    }
    this._import = new Import({ rule: config.rule });
    await this._import.read(item.link);
    this.save(item);
    return this._import.navList;
  }

  async read(item: any) {
    return this._import.content[item.link];
  }

  async search(name: string) {
    return [];
  }

  async save(item: any) {
    this._import.navList;
    this.sqlite.table('book').create({
      title: this.name,
      url: item.link,
      type: 'file',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      nav_index: 0
    });
    var book: any = await this.sqlite.table('book').where('title', this.name).find();

    this._import.navList.forEach((item:any,index:any) => {
      this.sqlite.table('book_nav').create({
        title: item.title,
        url: item.link,
      // eslint-disable-next-line @typescript-eslint/naming-convention
        book_id:book.id,
        content:this._import.content[index]
      });
    });
  }
}
export default new File();
