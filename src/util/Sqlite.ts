const sqlite = require("sqlite3");
const path = require("path");
export class Sqlite {
    private filename = "bookshelf.db";
    public db;
    private whereOpt: any = [];
    private fieldOpt: any = ["*"];
    private tableOpt: string = "";
    constructor() {
        this.db = new sqlite.Database(this.filename, function (e: any) {
            if (e) {
                throw e;
            }
        });
        this.select();
    }

    public run(sql: string) {
        this.db.run(sql, function (e: any) {
            if (e) {
                console.log(e);
                throw Error(e);
            }
        });
    }
    public table(name: string) {
        this.tableOpt = name;
        return this;
    }

    public create(data: any) {
        var field = Object.keys(data);
        var value:any =[];
        Object.values(data).forEach((item)=>{
            if (typeof item === "number") {
                value.push(`${item}`);
            } else {
                value.push(`"${item}"`);
            }
        });
       
        var sql = `INSERT INTO ${this.tableOpt}(${field}) VALUEs(${value})`;
        return this.run(sql);
    }

    public delete() {

    }

    public update() {

    }
    public where(field: string, op: string, value: any = "") {
        if (!value) {
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
    public find() {
        return new Promise((resolve, reject) => {
            var field = this.fieldOpt.join(",");
            var where = this.whereOpt.join(" AND ");
            var sql = `SELECT ${field} FROM ${this.tableOpt} WHERE ${where};`;
            var data = this.db.get(sql, function (err: any, row: any) {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    public select() {
        var field = this.fieldOpt.join(",");
        var where = this.whereOpt.join(" AND ");
        var data = this.db.all(`SELECT ${field} FROM ${this.tableOpt} WHERE ${where};`);
        return data;
    }

}