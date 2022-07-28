export default {
    info(msg: string) {
        this.write('info', msg);
    },

    write(type: string, msg: string, ...params: any[]) {
        console.log(`[${type}] : ${msg}`, ...params);
    },

    error(msg: string) {
        this.write('error', msg);

    },
    warn(msg: string) {
        this.write('warn', msg);
    }
}