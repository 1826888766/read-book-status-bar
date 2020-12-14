import { Dirvers } from "../interface/dirvers";
import { Import } from "../util/import";
class File implements Dirvers {
  _list: any;
  navlist: any;
  name: string = "";
    _import:any;
  async list(item: any) {
    this._import =  new Import();
    await this._import.read(item.link);
    console.log(this._import.navList);
    return this._import.navList;
  }
  
  async read(item: any) {
    return this._import.content[item.link];
  }

  async search(name: string) {
   return [];
  }
}
export default new File();
