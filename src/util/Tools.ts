import {window,QuickPick,QuickPickItem,QuickInputButton} from "vscode";

interface QuickPickOptions{
    [index:string]:any
}
export class Tools{
    private quickPick!: QuickPick<QuickPickItem>;
    private static _instance = new Tools;
    private funs:any = {};
    constructor(){
        this.quickPick = window.createQuickPick();
        this.listen();
    }

    private listen(){
        // this.quickPick.onDidChangeSelection((res: QuickPickItem[])=>this.call("onDidChangeSelection",res));
        this.quickPick.onDidChangeValue((e: string) => this.call("onDidChangeValue",e));
        this.quickPick.onDidTriggerButton((e: QuickInputButton) =>this.call("onDidTriggerButton",e));
    }

    quickPickShow(){
        this.quickPick.show();
    }

    quickPickHide(){
        this.quickPick.hide();
    }

    setQuickPickData(items:QuickPickItem[],options:QuickPickOptions){
        if(options){
            for(var key in options){
                // @ts-ignore
               this.quickPick[key] = options[key];
            }
        }
        this.quickPick.items = items;
    }

    static getInstance(){
        return this._instance;
    }

    showBusy(){
        this.quickPick.busy = true;
    }

    hideBusy(){
        this.quickPick.busy = false;
    }

    on(name:string,callback:Function){
        if(!this.funs[name]){
            this.funs[name] = [];
        }
        this.funs[name].push(callback);
    }

    call(name:string,...params:any){
        var funs = this.funs[name];
        if(!funs){
           return;
        }
        for(var key in funs){
            if(typeof funs[key] === "function"){
                funs[key](...params);
            }
        }
    }
}