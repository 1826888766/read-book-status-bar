import path = require("path");
import { ReadBook } from "./main";
import log from "./utils/log";


const commands: string[] = [
    './storage/storage', 
    './providers/book',  
    './commands/Search',  
    './commands/Domain',  
    './providers/domain',  
    './providers/content',  
    './previews/editcontent',  
    './previews/statusview',  
    './previews/webview', 
    './commands/Import',  
    './commands/Read',  
];


export default {
    run(app: ReadBook) {
        try{
            for (let key in commands) {
                const item = commands[key];
                app.use(import(path.join(__dirname,item)));
            }
        }catch(e){
            log.info(JSON.stringify(e));
            
        }
        
    }
};