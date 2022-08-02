import { ReadBook } from "../main";
import * as vscode from "vscode";
import log from "../utils/log";
var handler: ReadBook, provider: vscode.Disposable;

var range: vscode.Range;
function register(title: string) {
    provider = vscode.languages.registerCodeLensProvider('*', new (class implements vscode.CodeLensProvider {
        provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
            console.log(document.lineCount);
            let codelenss = [];
            if (range) {
                let code = new vscode.CodeLens(range, {
                    arguments: [title],
                    command: "",
                    title: `// ${title}`
                });
                codelenss.push(code);
            }
            return codelenss;
        }
    })());
}

function init() {
    if(vscode.window.activeTextEditor){
        let selections = vscode.window.activeTextEditor.selections[0];
        if (selections){
            range = new vscode.Range(selections.active, selections.active);
            reset();
        }
       
    }
    
    vscode.window.onDidChangeTextEditorSelection((e) => {
        let selections = e.selections[0];
        range = new vscode.Range(selections.active, selections.active);
        reset();
    });
}

function reset() {
    if (provider) {
        provider.dispose();
    }
    register(msg);
}

var msg = "";
export default {
    run(app: ReadBook) {
        handler = app;
        init();
    },
    async write(str: string) {
        msg = str;
        reset();
    }
};