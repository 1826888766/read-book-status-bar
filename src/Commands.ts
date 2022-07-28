import { ReadBook } from "./main";
import log from "./utils/log";

const commands: string[] = [
    './commands/Read'    
];


export default {
    run(app: ReadBook) {
        for (let key in commands) {
            const item = commands[key];
            app.use(()=>import(item));
            log.info('注册命令：'+item);
        }
    }
};