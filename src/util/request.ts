/* eslint-disable @typescript-eslint/naming-convention */
const config = {};
import {Dirvers} from "../interface/dirvers";
import dirvers from "../dirvers";
class request {
    private config = {};
    private dirvers:string = "biquge";
    private dirver:Dirvers;
    constructor(config: any) {
        this.config = config;
        this.dirver = dirvers[this.dirvers];

    }
    /**
     * 获取驱动
     */
    getDirvers(){
        this.dirver = dirvers[this.dirvers];
        return this;
    }
    /**
     * 设置驱动
     */
    setDirvers(name:string) {
        this.dirvers = name;
        return this;
    }

    list(item:any):any{
        this.getDirvers();
       return this.dirver.list(item);
    }

    async search(name:string){
        this.getDirvers();
        return await this.dirver.search(name);
    }

    read(id:any){
        this.getDirvers();
        return this.dirver.read(id);
    }
}

export default new request(config);