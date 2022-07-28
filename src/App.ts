import Commands from "./Commands";


export default class App {
    constructor() {
        this.init();
    }

    public init() {
        Commands.registerCommand();
    }


    /**
     * 销毁方法
     */
    public dispose() {

    }
}