# read-book-status-bar README

## qq群 755708694 
```json
// 自定义网站规则
{
  "name": "笔趣阁", // 网站名称
  "url": "https://www.xbiquge.so", // 网站网址‘
  "gzip":true, // 应对某些网站开启gzip压缩
  "contentUrl":"{list}{content}", // 文章url规则
  "searchUrlChartSet":"gbk", // 网站搜索url编码 // 没有特殊需要不传入
  "searchUrl": "/modules/article/search.php?searchkey={name}", // 搜索网址 {name}为搜索的内容
  "parseSearch": {
    "list": "#main li", // 搜索的页面，列表搜索，参考jquery
    "url": ".s2 a:href", // 搜索的页面，书籍地址，参考:href 解析链接
    "content": ".s2" // 搜索的页面，书籍名称，会自动获取text内容
  },
  "parseCatalog": {
    "list": "dd a",// 目录的页面，列表搜索，参考jquery
    "url": ":href",// 目录的页面，书籍地址，参考:href 解析链接
    "content": "" // 目录的页面，书籍名称，会自动获取text内容
  },
  "parseContent": {
    "content": "#content" // 内容页面，会自动获取text内容
  }
}
```

# 2.0全新升级

- 免费网站自定义,不在受预设平台限制，随意更换
- 本地文件加载更快，每个书籍都可单独配置自己的断章规则，
- 如有其他需求，欢迎提交issue
- 两种阅读方式可供选择，`状态栏`，`编辑器内注释`

## 支持命令

- [x] 搜索
- [x] 上一章
- [x] 下一章
- [x] 目录选择
- [x] 平台切换
- [x] 阅读速度
- [x] 阅读历史
- [x] 上一行
- [x] 下一行
- [x] 老板键




# 1.0
# 状态栏读书

> `ctrl+shift+p` 搜索 `状态栏读书：搜索` or `状态栏读书：目录` 
> 可在webview中看原始页面

## 支持平台

- [x] 本地文件【txt】导入
- [x] 新笔趣阁
- [x] 起点中文网
- [x] 纵横中文网

## 支持命令

- [x] 搜索
- [x] 上一章
- [x] 下一章
- [x] 目录选择
- [x] 平台切换
- [x] 阅读速度
- [x] 阅读历史
- [x] 上一行
- [x] 下一行
- [x] 老板键

## 快捷键

> 上一行  windows `ctrl+alt+w` mac `cmd+alt+w`
>
> 下一行  windows `ctrl+alt+s` mac `cmd+alt+s`
# 本插件仅供学习和参考