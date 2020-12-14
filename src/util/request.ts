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
 /**
     * 设置配置
     */
    setConfig(config:any) {
        this.config = config;
        return this;
    }
    list(item:any):any{
        this.getDirvers();
       return this.dirver.list(item,this.config);
    }

    async search(name:string){
        this.getDirvers();
        return await this.dirver.search(name,this.config);
    }

    read(id:any){
        this.getDirvers();
        return this.dirver.read(id,this.config);
    }
}

export default new request(config);