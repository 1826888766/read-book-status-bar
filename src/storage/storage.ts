import { Memento } from "vscode";
import { ReadBook } from "../main";
var handler: ReadBook;

var storage: Memento;

function init() {
    storage = handler.context.globalState;
    handler.context.globalState.setKeysForSync([

    ]);
}

function getStorage(key: string, defaultValue?: string): any {
    let value: any | undefined = storage.get(key);
    if (value) {
        value = JSON.parse(value).value;
    }
    return value || defaultValue;
}

function setStorage(key: string, value: any): void {
    value = JSON.stringify({ value, type: typeof value });
    storage.update(key, value);
}

export default {
    run(app: ReadBook) {
        handler = app;
        init();
    },
    getStorage,
    setStorage
};