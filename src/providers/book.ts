// 书籍列表
import { ReadBook } from "../main";
import * as vscode from "vscode";
import storage from "../storage/storage";
var books: any[] = [];
export class BookList implements vscode.TreeDataProvider<BookItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<BookItem | undefined | void> = new vscode.EventEmitter<BookItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<BookItem | undefined | void> = this._onDidChangeTreeData.event;

    private books: any = [];
    constructor() {
    }
    refresh(): void {
        this.books = books;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: BookItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: BookItem): Thenable<BookItem[]> {
        var books: BookItem[] = [];
        this.books.forEach((element: any) => {
            books.push(new BookItem(element.title, element, vscode.TreeItemCollapsibleState.None));
        });
        return Promise.resolve(books);
    }
}

export class BookItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        private readonly element: any,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);

        this.tooltip = `${element.url}`;
        this.description = element.type;
        this.iconPath = !element.active ? new vscode.ThemeIcon("book") : new vscode.ThemeIcon("check");
    }

    contextValue = 'books';
}
var provider: BookList;
export default {
    run(app: ReadBook) {
        provider = new BookList();
        books = storage.getStorage('books');
        provider.refresh();
        vscode.window.registerTreeDataProvider('books', provider);
    },
    setItems(contents: any[]) {
        books = contents;
        provider.refresh();
    },
    getItems() {
        return books;
    }
};