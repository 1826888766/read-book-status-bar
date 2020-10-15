export interface Dirvers{
    /**
     * 获取所有书籍列表
     */
    list(index:number):any;
    /**
     * 搜索书籍
     */
    search(name:string):any;

    /**
     * 读取书籍
     */
    read(id:any):any;
}
