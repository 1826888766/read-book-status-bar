// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import App from "./App";
import { Config } from "./Config";
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  Config.getInstance().context = context;
  let app = new App();
  context.subscriptions.push(app);
}

// this method is called when your extension is deactivated
export function deactivate() {}