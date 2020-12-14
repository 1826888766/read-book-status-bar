import { window } from "vscode";

const path = require("path");
const fs = require("fs");
import {Sqlite} from "./Sqlite";
export class BookShelf {

    config: any = [];
    rootPath: string = "/read-book/";
    sqlite:Sqlite;

    constructor(config: any = []) {
        this.config = config;
        this.sqlite = new Sqlite();
        this.rootPath = path.resolve(this.rootPath);
        this.init();
    }

    public async init() {
        

    }
 
    public create(book:any) {
        var res = this.sqlite.where('name','=',book.name).find();
        if(res){
            this.update();
        }else{
            this.sqlite.create(res);
        }
    }

    public read(name: string = "") {
        this.sqlite.where('name','=',name).find();
    }

    public list() {
        this.sqlite.select();
    }


    public update() {
       
    }
}