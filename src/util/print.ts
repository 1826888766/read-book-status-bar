import {window,StatusBarAlignment} from "vscode";
export class Print{
    private log;
    private static _instance = new Print();
    constructor(){
        this.log = window.createStatusBarItem(StatusBarAlignment.Left);
        this.log.show();
    }
    public static getInstance():Print{
		return this._instance;
	}

    write(text:string){
        this.log.text = text;
    }
    
    dispose(){
        this.log.dispose();
    }
}