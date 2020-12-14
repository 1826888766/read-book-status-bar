const sqlite = require("sqlite3");

export class Sqlite{
    private filename = "bookshelf.db";
    public  db;
    constructor(){

        this.db = new sqlite.Database(this.filename,function(e:any){
            if (e) {
                throw e;
            }
        });
        this.select();
        // this.db.run("CREATE TABLE foo ( id INT  PRIMARY KEY, title TEXT,url TEXT,nav_list TEXT , nav_page TEXT,curent TEXT,navIndex INT)");
    }

    public create(data:any) {
        this.db.run("");
    }

    public delete(){

    }

    public update(){

    }
    public where(field:string,op:string,value:any){
        return this;
    }
    public find(){
        return {};
    }

    public select(){
       console.log(this.db.run("SELECT * FROM foo;"));
    }

}