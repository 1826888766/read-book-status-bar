import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Sqlite } from '../util/Sqlite';

export class BookProvider implements vscode.TreeDataProvider<Dependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;
    private sqlite:Sqlite;
    private books:any = [];
    constructor(){
        this.sqlite = new Sqlite();
        this.getBooks();
    }

    async getBooks(){
        this.books = await this.sqlite.table("book").select();
        this.refresh();
    }
	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Dependency): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Dependency): Thenable<Dependency[]> {
        var books:Dependency[] = [];
        this.books.forEach((element:any) => {
            books.push(new Dependency(element.title,element,vscode.TreeItemCollapsibleState.None));
        });
		return Promise.resolve(books);
	}
}

export class Dependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		private readonly element: any,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);

		this.tooltip = `${element.url}`;
		this.description = element.type;
		this.iconPath = !element.active?new vscode.ThemeIcon("book") :new vscode.ThemeIcon("check");
	}

	contextValue = 'books';
}