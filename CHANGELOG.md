# 2.2.2
增加阅读页面多页内容翻页问题

```json
{...
  "contentPage": true,
  "contentCheckNext": {
    "content": ".box_con .bottem1 a[rel=next]",
    "url": ".box_con .bottem1 a[rel=next]:href",
    "text": "下一页"
  }
}

```
# 2.2.1
增加替换规则 replace , function

```json
{
  ...,
  "catalogUrl": {
    "before": "{list}",
    "after": {
      "type": "replace",
      "value": ["book","read"]
    }
  }
}

```

# 2.1.4
修复最后一行超出设定的字符数丢失问题
# 2.1.1
- 使用爬虫框架`crawler`代替`axios`请求
- 增加对POST方式支持
- 修复最后一行不显示问题
- 增加gzip编码支持
# 2.0.21
- 增加解析返回编码
# 2.0.16
- 增加是否加载插件功能
# 2.0.15
- 修复加载下一章错误
# 2.0.14
- 修复手动选择一章时，上一章，下一章控制无效
# 2.0.13
- 修复行为空时造成死循环
# 2.0.12
- 修复换行问题
# 2.0.11
- 增加加载中提示
# 2.0.10
- 修复重载时加载目录问题
- 修复加入书架没有自动选择阅读，造成重载不加载目录问题
# 2.0.8
- 修复远程开发时bug
- 书架空时错误
# 2.0.5
- 修复非win系统路径问题
# 2.0.1
## 本次更新去除sqlite数据库存储，改用vscode的storageState，加载速度更快
## 去除已阅读状态
## 新增注释阅读方式
## 重新定义网站爬取规则，支持自定义网站
```json
{
  "name": "笔趣阁", // 网站名称
  "contentUrl":"{list}{content}", // 文章url规则
  "url": "https://www.xbiquge.so", // 网站网址
  "searchUrlChartSet":"gbk", // 网站搜索url编码 // 没有特殊需要不传入
  "searchUrl": "/modules/article/search.php?searchkey={name}", // 搜索网址
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

# 1.0.7
## 更新笔趣阁域名 优化导入顺序

# 1.0.4
## 修复导入本地txt文件 本地文件仅支持utf8编码文件，非utf8编码请转义后导入
# 1.0.0
## 重写项目，优化可读性
## 增加treeView 
## 增加webview浏览
## 全新书架
## 全新目录

# 0.0.21
## 修复 issues #7 by jingj5 问题

# 0.0.20

## 引入sqlite数据库安装时间更长，主要功能对本地文件进行分章，本地存储
## 增加本地文件txt导入，可以自定义正则断章

# 0.0.19

## 增加老板键 及自定义老板键文字
## 增加输入页码跳转


# 0.0.18

## 修复开启自动阅读情况时下一行读取超长句子问题
## 修复换行符引起无法显示内容问题

# 0.0.17

## 增加上一行，下一行 快捷键
## 增加配置关闭自动阅读下一行

# 0.0.14

## 增加配置描述

# 0.0.13

## 优化配置更新

# 0.0.12

## 优化长句子显示不全问题