// 书籍列表
import { ReadBook } from "../main";
import * as vscode from "vscode";
import storage from "../storage/storage";
export class DomainList implements vscode.TreeDataProvider<DomainItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<DomainItem | undefined | void> = new vscode.EventEmitter<DomainItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<DomainItem | undefined | void> = this._onDidChangeTreeData.event;

    public books: any = [];
    constructor() {
    }
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: DomainItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: DomainItem): Thenable<DomainItem[]> {
        var books: DomainItem[] = [];
        this.books.forEach((element: any) => {
            books.push(new DomainItem(element.name, element, vscode.TreeItemCollapsibleState.None));
        });
        return Promise.resolve(books);
    }
}

export class DomainItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly element: any,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    ) {
        super(label, collapsibleState);

        this.tooltip = element.url;
        this.description = element.type;
        this.iconPath =  new vscode.ThemeIcon("link");
    }

    contextValue = 'domain';
}
var provider: DomainList;
export default {
    run(app: ReadBook) {
        provider = new DomainList();
        provider.refresh();
        vscode.window.registerTreeDataProvider('domain', provider);
    },
    setItems(contents: any[]) {
        provider.books = contents;
        provider.refresh();
    },
    getItems() {
        return provider.books;
    }
};