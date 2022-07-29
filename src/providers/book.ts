// 书籍列表
import { ReadBook } from "../main";
import * as vscode from "vscode";

export class BookList implements vscode.TreeDataProvider<BookItem> {

    private books: any = [];
    constructor() {
        this.getBooks();
    }

    async getBooks() {
        this.refresh();
    }

    refresh(): void {

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

export default {
    run(app: ReadBook) {
        vscode.window.registerTreeDataProvider('books', new BookList());
    }
};