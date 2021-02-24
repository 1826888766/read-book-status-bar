const sqlite = require("sqlite3");
const path = require("path");
import  * as vscode from "vscode";
export class Sqlite {
    
    private filename = "bookshelf3.db";
    public db: any;
    private whereOpt: any = [];
    private fieldOpt: any = [];
    private orderOpt: any = [];
    private tableOpt: string = "";
    constructor() {
        this.db = new sqlite.Database(this.filename, function (e: any) {
            if (e) {
                throw e;
            }
        });
        this.db.get("SELECT * FROM book", (e: any) => {
            if (e) {
                // id 名称 类型 链接地址 当前阅读章节 章节索引
                this.db.run("CREATE TABLE book(id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT,type TEXT,url TEXT,nav_id int,nav_index INT,active INT);");
                // id 书籍id 链接地址 阅读状态 章节内容
                this.db.run("CREATE TABLE book_nav(id INTEGER PRIMARY KEY AUTOINCREMENT,book_id INT,url TEXT, title TEXT,read INT,content TEXT);");
                var panel = vscode.window.createWebviewPanel("welcome","状态栏更新",vscode.ViewColumn.Active);
                panel.webview.asWebviewUri = "<h1>version : 1.0.0</h1> <h2> 重写项目，优化可读性</h2><h2> 全新目录</h2><h2> 全新书架</h2><h2> 增加webview浏览</h2>";
            }
            
        });
    }
    order(field:Array<string>|string,type:string = "asc") {
        if(Array.isArray(field)){
           this.orderOpt = this.orderOpt.concat(field);
            return this;
        }
        this.orderOpt.push(`${field} ${type}`);
        return this;
    }
    async run(sql: string) {
       return new Promise((resolve)=>{
        this.db.run(sql, function (e: any) {
            if (e) {
                console.log(e);
                throw Error(e);
            }
            resolve(1);
        });
       }) ;
    }
    public table(name: string) {
        this.tableOpt = name;
        this.whereOpt = [];
        this.fieldOpt = [];
        this.orderOpt = [];
        return this;
    }

    async create(data: any) {
        var field = Object.keys(data);
        var value: any = [];
        Object.values(data).forEach((item) => {
            if (typeof item === "number") {
                value.push(`${item}`);
            } else {
                value.push(`"${item}"`);
            }
        });

        var sql = `INSERT INTO ${this.tableOpt}(${field}) VALUEs(${value})`;
        return await this.run(sql);
    }

    public delete() {

    }

    async update(data:any) {
        var where = this.whereOpt.join(" AND ");
        var dataArr = [];
        for(var key in data){
            dataArr.push(`${key} =  "${data[key]}"`);
        }
        var dataStr = dataArr.join(",");
        var sql = `UPDATE ${this.tableOpt} SET  ${dataStr}  WHERE ${where}`;
        return this.run(sql);
    }
    public field(name: any) {
        if (Array.isArray(name)) {
            this.fieldOpt = this.fieldOpt.concat(name);
        } else if (typeof name === "string") {
            this.fieldOpt = this.fieldOpt.concat(name.split(','));
        }
        return this;
    }

    public where(field: any, op: any = "", value: any = "") {
        if(typeof field === "object"){
            for(var key in field){
                if (typeof field[key] === "number") {
                    this.whereOpt.push(`${key} = ${field[key]}`);
                } else {
                    this.whereOpt.push(`${key} = "${field[key]}"`);
                }
            }
            return this;
        }
        if ("" === value) {
            value = op;
            op = "=";
        }
        if (typeof value === "number") {
            this.whereOpt.push(`${field} ${op} ${value}`);
        } else {
            this.whereOpt.push(`${field} ${op} "${value}"`);
        }
        return this;
    }
    public async find() {
        return new Promise((resolve, reject) => {
            var field = this.fieldOpt.join(",") || "*";
            var sql = `SELECT ${field} FROM ${this.tableOpt}`;
            if (this.whereOpt.length){
                sql += " WHERE "+ this.whereOpt.join(" AND ");
            }
            if (this.orderOpt.length){
                sql += " ORDER BY "+ this.orderOpt.join(",");
            }
            var data = this.db.get(sql, function (err: any, row: any) {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    public async select() {
        return new Promise((resolve, reject) => {
            var field = this.fieldOpt.join(",") || "*";
            var where = this.whereOpt.join(" AND ");
            if (!this.tableOpt) {
                return false;
            }
            var sql = `SELECT ${field} FROM ${this.tableOpt} `;

            if (where) {
                sql += ` WHERE ${where}`;
            }
            if (this.orderOpt.length){
                sql += " ORDER "+ this.orderOpt.join(",");
            }
            this.db.all(sql, function (err: any, row: any) {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

    }

}