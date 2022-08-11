import { ReadBook } from "../main";
import * as vscode from "vscode";
import log from "../utils/log";
var handler: ReadBook, provider: vscode.Disposable;

var range: vscode.Range;
function register() {
    provider = vscode.languages.registerCodeLensProvider('*', new (class implements vscode.CodeLensProvider {
        provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
            let codelenss = [];
            
            if (!isHide&&msg){
                if (range) {
                    let code = new vscode.CodeLens(range, {
                        arguments: [msg],
                        command: "",
                        title: `// ${msg}`
                    });
                    codelenss.push(code);
                }
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
        }
       
    }
    var pre:any;
    vscode.window.onDidChangeTextEditorSelection((e) => {
        let selections = e.selections[0];
        if (selections){
            range = new vscode.Range(selections.active, selections.active);
        }
        if(e.kind == 2){
            reset();
        }
    });
}

function reset() {
    if (provider) {
        provider.dispose();
    }
    register();
}

var msg = "";
var isHide = false;
export default {
    run(app: ReadBook) {
        handler = app;
        init();
    },
    hide(){
        isHide = true;
        reset();
    },
    show(){
        isHide = false;
        reset();
    },
    async write(str: string) {
        msg = str;
        reset();
    }
};