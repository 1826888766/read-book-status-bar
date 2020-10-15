var url = require("url");
var http = require("https");
var cheerio = require("cheerio");
var iconv = require("iconv-lite");
export function get(urls: string,decode:string="GBK") {
  return new Promise((resolve, reject) => {
    var options = url.parse(urls);

    var req = http.request(options, function (res: any) {
      let html = "";
      res.on("data", (data: any) => {
        html += iconv.decode(data, decode);
      });
      res.on("end", () => {
        resolve(cheerio.load(html));
      });
    });

    req.on("error", function (e: any) {
      console.log("problem with request: " + e.message);
    });

    req.end();
  }).catch((err: any) => {
    console.log("problem with request: " + err.message);
  });
}
