import { ReadBook } from "./main";


const commands: string[] = [
    './storage/storage',  
    './providers/book',  
    './commands/search',  
    './commands/domain',  
    './providers/domain',  
    './providers/content',  
    './previews/editcontent',  
    './previews/statusview',  
    './previews/webview', 
    './commands/read',  
    './commands/import',  
];


export default {
    run(app: ReadBook) {
        for (let key in commands) {
            const item = commands[key];
            app.use(import(item));
        }
    }
};