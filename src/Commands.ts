import { ReadBook } from "./main";


const commands: string[] = [
    './commands/read',  
    './commands/import',  
    './commands/search',  
    './providers/book',  
    './providers/content',  
    './previews/editcontent',  
    './previews/statusview',  
    './previews/webview',  
];


export default {
    run(app: ReadBook) {
        for (let key in commands) {
            const item = commands[key];
            app.use(import(item));
        }
    }
};