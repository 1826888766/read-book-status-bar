import { start } from "repl"
import { setTimeout } from "timers"
import { window,StatusBarAlignment,StatusBarItem,QuickPick,QuickPickItem, ThemeIcon, QuickInputButton } from "vscode"
import request from "./request"

export class Log{
    private statusBar : StatusBarItem
    private context !:string

    private contextArr :Array<string> = []
    private weburl = "";
    private dirver = "biquge";
    private navList = [];
    private bookList = [];
    private index :number = 0
    private selectNav:boolean = false;
    private speed :number = 5000
    private quickPick:QuickPick<QuickPickItem>;
    private navPage = {
        cur:0,
        limits:10
    }
    private bookPage = {
        cur:0,
        limits:10
    }
    private active !:QuickPickItem;
    private activeNav !:QuickPickItem;
    name:string = ""

    constructor(config:any={}){
        this.index = config.index;
        this.speed = config.speed;
        this.dirver = config.type;
        this.name = config.name;

        this.statusBar = window.createStatusBarItem(StatusBarAlignment.Left)
        this.statusBar.show();
        this.quickPick = window.createQuickPick()
        this.quickPick.onDidChangeSelection((res:QuickPickItem[])=>{
            if(res[0]){
                if(this.selectNav){
                    this.activeNav = res[0]
                    this.read()
                }else{
                    this.active = res[0]
                    this.list()
                }
            }
            
        })
        this.quickPick.placeholder = "请选择想要的书籍"
        let time:any = 0;
        this.quickPick.onDidChangeValue((e:string)=>{
            clearTimeout(time)
            if(this.selectNav){
                return
            }
            time = setTimeout(()=>{
                this.search(e)
            },300)
        })
        this.quickPick.onDidTriggerButton((e:QuickInputButton)=>{
            console.log(e)
            if(e.tooltip == "上一页"){
                this.pre()
            }else{
                this.next()
                
            }
        })
        this.quickPick.onDidAccept



        this.quickPick.title = "搜索书籍"
       
    }

    private pre(){
        if(this.selectNav){
            if(this.navPage.cur == 0){
                window.showWarningMessage("已是第一页")
                return
            }
            this.navPage.cur-=1
        this.showNavList()

        }else{
            if(this.bookPage.cur == 0){
                window.showWarningMessage("已是第一页")
                return
            }
            this.bookPage.cur-=1
        this.showBookList()

        }
    }

    private next(){
        if(this.selectNav){
            if(this.navPage.cur >= parseInt((this.navList.length / this.navPage.limits).toString())){
                window.showWarningMessage("已是最后一页")
                return
            }
            this.navPage.cur+=1
        this.showNavList()

        }else{
            if(this.bookPage.cur >= parseInt((this.bookList.length / this.bookPage.limits).toString())){
                window.showWarningMessage("已是最后一页")
                return
            }
            this.bookPage.cur+=1
        this.showBookList()

        }
    }
    public write(msg:string){
        this.statusBar.text = msg;
    }

    public dispose(){
        this.statusBar.dispose()
    }

    public showBookList(){
        this.quickPick.title = "选择书籍"
        let start:number  = this.bookPage.cur * this.navPage.limits;
        let end:number =  start + Number(this.bookPage.limits);
        let items = this.bookList.slice(start,this.navPage.limits)
        this.quickPick.items = items.reduce((pre:any,cur:any)=>{
            pre.push({
                label:cur.title||"",
                detail:cur.link
            })
            return pre;
        },[])
        this.quickPick.show()
    }

    public showNavList(){
        this.quickPick.title = "选择书籍目录"
        let start:number  = this.navPage.cur * this.navPage.limits;
        let end:number =  start + Number(this.navPage.limits);
        this.quickPick.value = ""
        let items = this.navList.slice(start,end)
        this.quickPick.items = items.reduce((pre:any,cur:any)=>{
            pre.push({
                label:cur.title||"",
                detail:cur.link
            })
            return pre;
        },[])
        this.quickPick.show()
    }

    public async search(name:string = ""){
        this.selectNav = false
        this.quickPick.buttons = [{
            tooltip:"上一页",
            iconPath:new ThemeIcon("arrow-left")
        },{
            tooltip:"下一页",
            iconPath:new ThemeIcon("arrow-right")
        }]
        if(name=="列表"){
           return this.showBookList()
        }
        this.name = name;
        this.bookList = await request.setDirvers(this.dirver).search(this.name);
        this.showBookList()
       
    }

    public async list(){
        this.name = this.active.label
        this.write("正在获取书籍目录信息")
        this.selectNav = true
        this.navList = await request.setDirvers(this.dirver).list({
            link:this.active.detail,
            name:this.active.label
        });
        this.showNavList()
    }

    public async read(){
        if(!this.activeNav){
        this.write("请搜索书籍")
            return;
        }
        this.write("正在获取"+ this.activeNav.label +"内容")
        let res = await request.setDirvers(this.dirver).read({
            link:this.activeNav.detail,
            name:this.active.label
        });
        res = res.replace(/。|\./g, '\n')
        this.contextArr = res.split(/[(\r\n)\r\n]+/);
		this.inteval()
    }

    public getContext():string{
        return this.contextArr[this.index]
    }

    public run(){
        this.read()
    }

    private inteval(){
        let text = this.getContext()
        this.index ++
        if(!text.trim()){
             this.inteval()
             return
        }
        let speed =this.speed
        if(text.trim().length <20 ){
            speed = speed/2
        }
        this.write(text)
        setTimeout(()=>{
            this.inteval()
        },speed)

    }
}