# StudyOnTV 题库共享

[题了个题](https://github.com/chadyi/StudyOnTV)（StudyOnTV）的公共题库仓库：所有题库都是普通 JSON，直接放进 App 的「题库 → 题库源」就能一键添加。

- 索引（App 默认读取这个地址）：
  `https://cdn.jsdelivr.net/gh/chadyi/StudyOnTV-banks@main/index.json`
- 备用地址（jsDelivr 打不开时）：
  `https://raw.githubusercontent.com/chadyi/StudyOnTV-banks/main/index.json`
- 题目格式：[docs/question-format.md](https://github.com/chadyi/StudyOnTV/blob/main/docs/question-format.md)

## 用一份题库

1. 电视上打开家长面板 → 题库 → **题库源**；
2. 列表里点「添加」，题目会直接进本机题库，重复的题自动跳过；
3. 也可以只把某份题库的链接贴到「导入题库 → 从链接导入」。

## 贡献一份题库

见 [CONTRIBUTING.md](CONTRIBUTING.md)。简单说：

- 题库必须是**自制、AI 生成或已获授权**的内容，不接受从别处下载/破解来的题库；
- 放进 `banks/`，本地跑 `node scripts/validate.mjs`，提交 PR；
- 不会用 Git 的话，开一个 Issue 把 JSON 文件拖进去，维护者会代你提交。

## 目录

```
banks/            题库文件（一份一个 .json，文件名用英文/拼音）
scripts/validate.mjs  校验 + 生成 index.json
index.json        自动生成，不要手改
```

## 授权

本仓库的文档、索引与脚本采用 CC BY 4.0；每个题库文件以它自己的 `license` 字段为准。
