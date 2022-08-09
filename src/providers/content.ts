// 书籍列表
import { ReadBook } from "../main";
import * as vscode from "vscode";
import storage from "../storage/storage";

export class ContentList implements vscode.TreeDataProvider<ContentItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ContentItem | undefined | void> = new vscode.EventEmitter<ContentItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ContentItem | undefined | void> = this._onDidChangeTreeData.event;

    public contents: any = [];
    constructor() {
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ContentItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ContentItem): Thenable<ContentItem[]> {
        var contents: ContentItem[] = [];
        this.contents.forEach((element: any) => {
            contents.push(new ContentItem(element.title, element, vscode.TreeItemCollapsibleState.None));
        });
        return Promise.resolve(contents);
    }
}

export class ContentItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly element: any,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    ) {
        super(label, collapsibleState);

        this.tooltip = `${element.url}`;
        this.description = element.type;
        this.iconPath = !element.active ? new vscode.ThemeIcon("book") : new vscode.ThemeIcon("check");
    }
    contextValue = 'content';
}
let provider: ContentList;
export default {
    run(app: ReadBook) {
        provider = new ContentList();
        vscode.window.registerTreeDataProvider('content', provider);
    },
    setItems(contents: any[]) {
        provider.contents = contents;
        provider.refresh();
    },
    getItems(){
        return provider.contents;
    },
    setActive(item:any){
        provider.contents.forEach((element:any)=>{
            if(element.title == item.title){
                element.active = true;
                element.reading = true;
            }else{
                element.reading = false;
            }
        });
        provider.refresh();
        let book = storage.getStorage('select-book');
        storage.setStorage('nav_'+book.title,provider.contents);
    }
};