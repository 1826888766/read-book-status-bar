/* eslint-disable @typescript-eslint/naming-convention */
import request from "./request";
import { Sqlite } from "./Sqlite";

export class Books {
  
    
    private sqlite: Sqlite;

    private static _instance = new Books();

    static getInstance() {
        return this._instance;
    }

    constructor() {
        this.sqlite = new Sqlite();
    }

    async addBooks(data: any) {
        var book: any = await this.sqlite.table('book').where('type', data.type).where('title', data.title).find();
        if(!book){
            this.sqlite.table("book").create(data);
        }
    }

    async getBook(name: any,config:any) {
       return await this.sqlite.table('book').where('type', config.type).where('title', name).find();
    }
    async activeCatalog(id: any) {
        await this.sqlite.table("book_nav").where('id',id).update({read:0});
    }
    async activeBook(id:number){
        await this.sqlite.table("book").where('active',"1").update({active:0});
        await this.sqlite.table("book").where("id",id).update({active:1});
    }

    async getPrePage(id:number,bookId:number){
       return await this.sqlite.table("book_nav").where("id",">",id).where("book_id",bookId).order("id","desc").find();
    }

    async getNextPage(id:number,bookId:number){
        return await this.sqlite.table("book_nav").where("id",">",id).where("book_id",bookId).order("id","asc").find();
     }
    async getContent(id:number,config:any){
        var content: any = await this.sqlite.table("book_nav").where({
            id:id,
        }).field('id,content,url').find();
        if(!content){
            return false;
        }
        if(!content.content){
            content = await request.setDirvers(config.type).read({
                link: content.url,
            });
            this.setContent(id,content);
        }else{
            content = content.content;
        }
        return Promise.resolve(content);
    }

    async getCatalogList(name: string, url: any, config: any) {
        var book: any = await this.sqlite.table('book').where('type', config.type).where('title', name).find();
        this.sqlite.table("book").where('id',book.id).update({active:1});
        var list: any = await this.sqlite.table("book_nav").where({
            "book_id": book.id,
        }).field('id,title,url as link').select();
        if (!list.length) {
            list = await request.setConfig(config).list({
                link: url,
                name: name,
            });
            this.addBooksNav(name, list);
        }
        return Promise.resolve(list);
    }

    async addBooksNav(name: string, data: any) {
        var book: any = await this.sqlite.table('book').where('title', name).find();
        this.sqlite.table("book_nav").where('book_id', book.id).delete();
        data.forEach(async (item: any) => {
            this.sqlite.table("book_nav").create({
                title: item.title,
                url: item.link,
                book_id: book.id,
                read:0,
                content: ""
            });
        });
    }

    setContent(id:number,text:string){
        this.sqlite.table("book_nav").where('id',id).update({content:text});
    }
}