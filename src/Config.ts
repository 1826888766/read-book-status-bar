import * as vscode from "vscode";
export class Config {
    private static instance: Config;
    private config: vscode.WorkspaceConfiguration;
    public context: vscode.ExtensionContext | undefined;
    constructor() {
        this.config = vscode.workspace.getConfiguration("read-book-status-bar");
    }

    public static getInstance(): Config {
        if (!this.instance) {
            this.instance = new Config();
        }
        return this.instance;
    }

    public get(name: string): any {
        return this.config.get(name);
    }

    public has(name: string): boolean {
        return this.config.has(name);
    }

    public set(name: string, value: any): void {
        this.config.update(name, value);
    }
}
