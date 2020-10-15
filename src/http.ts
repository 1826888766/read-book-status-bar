var url = require('url');
var http = require("https")
var cheerio = require('cheerio');
var iconv = require("iconv-lite");
export function get(urls: string) {
    return new Promise((resolve, reject) => {
        var options = url.parse(urls)


        var req = http.request(options, function (res: any) {
            let html = ""
            res.on("data",(data:any)=>{
                html +=iconv.decode(data, 'GBK');
            })
            res.on("end",()=>{
                resolve(cheerio.load(html))
            })
        });

        req.on('error', function (e: any) {
            console.log('problem with request: ' + e.message);
            reject(e)
        });

        req.end();
    })

}
