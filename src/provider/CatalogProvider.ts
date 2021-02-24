import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Sqlite } from '../util/Sqlite';

export class CatalogProvider implements vscode.TreeDataProvider<Dependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;
    private sqlite:Sqlite;

	
    private books:any = [];
    constructor(private id:any){
        this.sqlite = new Sqlite();
        this.getCatalog();
    }

	setName(id:string){
		this.id = id;
        this.getCatalog();
	}

    async getCatalog(){
		if (!this.id) {return [];}
		this.books = await this.sqlite.table('book_nav').where('book_id', this.id).select();
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
        this.books.forEach((element:any,index:number) => {
            books.push(new Dependency(element.title,index,element,vscode.TreeItemCollapsibleState.None));
        });
		return Promise.resolve(books);
	}
}

export class Dependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		private readonly index:number,
		private readonly element:any,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
		this.tooltip = `${this.element.url}`;
		this.iconPath = this.element.read?new vscode.ThemeIcon("circle-large-filled"):new vscode.ThemeIcon("circle-large-outline");

	}

	contextValue = 'catalog';
}