# 投稿指南

## 能收什么

- ✅ 自己出的题、AI 生成后人工校对过的题、明确授权给你转发的题；
- ❌ 从别的 App、公众号、教辅 PDF 里扒下来的题库，除非你拿到了书面授权；
- ❌ 含推广链接、二维码、联系方式的内容；
- ❌ 含孩子姓名、学校、住址等个人信息的内容。

投稿即表示你确认自己有权分发这份题库，并同意按文件里的 `license` 字段授权他人使用。

## 文件格式

一份题库一个 `.json` 文件，放在 `banks/` 下，文件名用英文或拼音（例如 `grade3-math.json`）。

```json
{
  "name": "三年级口算 50 题",
  "version": 2,
  "subject": "数学",
  "level": "三年级",
  "author": "你的昵称",
  "license": "CC BY 4.0",
  "description": "一句话说明这套题的范围和难度",
  "items": [
    {"type": "single", "q": "27 + 48 = ?", "a": ["65", "75", "85"], "k": 1, "difficulty": 1, "subject": "数学", "level": "三年级", "bank": "三年级口算"}
  ]
}
```

字段细节见 [题目格式文档](https://github.com/chadyi/StudyOnTV/blob/main/docs/question-format.md)。几条硬性要求：

- `items` 里每题必须有 `q`（题干）和正确答案；
- 选择题 2–8 个选项，`k`（单选）或 `correctIndices`（多选）从 **0** 开始数；
- 判断题 `k` 只能是 0（正确）或 1（错误）；
- 填空题用 `answers`（可接受答案数组），主观题用 `modelAnswer`；
- 题干不要写 HTML；难度 1–5；朗读语言留空表示跟随设备。

## 提交流程

**会用 Git：**

```bash
# 放进 banks/ 后
node scripts/validate.mjs      # 校验并重建 index.json
git add banks/ index.json
git commit -m "bank: 三年级口算 50 题"
```

然后提 PR。CI 会跑同样的校验，`index.json` 没同步重建会直接失败。

**不会用 Git：** 开一个 [题库投稿 Issue](.github/ISSUE_TEMPLATE/bank-submission.md)，把 JSON 文件拖进输入框，写清楚来源和授权方式，维护者会代你提交。

## 审核看什么

1. 格式能过 `validate.mjs`；
2. 答案本身对不对（抽查，错题多会退回）；
3. 和现有题库是否大量重复（重复率高会退回，请在 Issue 里说明）；
4. 版权与内容安全。
