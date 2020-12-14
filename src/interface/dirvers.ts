export interface Dirvers{
    /**
     * 获取所有书籍列表
     */
    list(index:number,config?:any):any;
    /**
     * 搜索书籍
     */
    search(name:string,config?:any):any;

    /**
     * 读取书籍
     */
    read(id:any,config?:any):any;
}
