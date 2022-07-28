import { ReadBook } from "./main";

const providers: string[] = [


];


export default {
    run(app: ReadBook) {
        for (let key in providers) {
            const item = providers[key];
            app.use(()=>import(item));
        }
    }
};