import { Dirvers } from "../interface/dirvers";
import { Import } from "../util/import";
class File implements Dirvers {
  _list: any;
  navlist: any;
  name: string = "";
    _import:any;
  async list(item: any,config:any) {
    this._import =  new Import({rule:config.rule});
    await this._import.read(item.link);
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
