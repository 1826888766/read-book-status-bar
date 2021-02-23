// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import {BookProvider} from "./provider/BookProvider";
import { CatalogProvider } from "./provider/CatalogProvider";
import { Log2 } from "./util/Log2";
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let log = new Log2();
  context.subscriptions.push(log);
  log.run();
  var bookProvider  = new BookProvider();
  var catalogProvider  = new CatalogProvider(log.name);

  vscode.window.registerTreeDataProvider('books', bookProvider );
  vscode.window.registerTreeDataProvider('catalog', catalogProvider );
  vscode.workspace.onDidChangeConfiguration((e:any)=>{
    log.setConfig(vscode.workspace.getConfiguration("read-book-status-bar"));
    setTimeout(()=>{
      catalogProvider.setName(log.name);
      bookProvider.getBooks();
    },1000);
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}