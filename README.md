# Yuheng Na · Academic Homepage

纳昱恒的中英文学术个人主页。白底、衬线标题、横向论文条目，适配手机和电脑；英文首页和中文版均为完整静态页面，关闭 JavaScript 后也能阅读和切换语言。

学术主页：https://yuhengna.github.io/

技术博客：https://yuhengna.github.io/blog/

## 修改内容

日常维护只需编辑 [`data/site.json`](data/site.json)。其中 `en` 与 `zh` 是对应的英文和中文内容。

| 字段 | 内容 |
| --- | --- |
| `profile` | 姓名、简介、邮箱、头像和社交链接 |
| `research` | 研究方向 |
| `news` | 动态，最新一条放在最前面 |
| `publications` | 论文标题、作者角色、简介、配图和链接 |
| `projects` | 开源项目与社区工作 |
| `education` / `experience` | 教育和工作经历 |
| `honors` | 奖项 |
| `site.updated` | 页脚最近更新月份 |

主页已加入本人指定的照片和简介，两篇论文的配图分别截取自原论文的 Figure 1，点击配图可打开对应论文。页面不显示投稿会议或在投提示。简介下方提供微信、Google Scholar 和小红书入口，微信与小红书点击后显示二维码。News 按月记录论文与项目发布进度；未提供的 CV 链接自动隐藏。工作简介、链接与未来入学状态应随进展更新。

### 添加照片或论文配图

把照片放入 `assets/portrait.jpg`，然后把 `profile.portrait` 改为 `assets/portrait.jpg`。论文配图同理，设置对应论文的 `image`、`imageWidth` 和 `imageHeight`（图片的原始像素尺寸）。图片会被复制到发布目录，并按原始比例完整显示。

### 添加 CV 或 Google Scholar

设置 `profile.cv` 或 `profile.scholar` 为公开的完整 HTTPS 链接；也可以把 CV 放入 `assets/cv.pdf`，并将 `profile.cv` 设为 `assets/cv.pdf`。发布前请自行确认简历中准备公开的联系方式。

### 更新联系二维码

替换 `assets/wechat-qr.jpg` 或 `assets/xiaohongshu-qr.jpg` 即可更新二维码；如更改文件名，请同步修改 `profile.wechatQr` 或 `profile.xiaohongshuQr`。二维码弹窗支持关闭按钮、Esc 键和点击遮罩关闭，也可打开原图；关闭 JavaScript 时入口直接打开原图。

### 添加一条动态

```json
{
  "date": "2026.11",
  "text": { "en": "Your update in English.", "zh": "你的中文动态。" },
  "linkLabel": { "en": "Paper", "zh": "论文" },
  "url": "https://example.com/your-project"
}
```

把上面的对象加入 `news` 数组。`url` 可以省略。超过三条时，较早动态自动折叠。

现有动态依据：[EgoLoAF arXiv](https://arxiv.org/abs/2611.32260)（2026.11）、[EvoMem-VLA arXiv](https://arxiv.org/abs/2610.05418)（2026.10）、[DoggyClawAssistant 初始代码提交](https://github.com/YuhengNa/DoggyClawAssistant/commit/ea9d2cf61f321b6231a8035ffc6abd5b3976c7a5)（2026.04）。

## 本地预览

需要 Node.js 22 或更新版本，无需安装 npm 依赖。

```sh
npm run dev
```

打开命令输出的本地地址。修改内容后重新运行预览命令，或在另一个终端执行 `npm run build` 并刷新网页。

```sh
npm run build
npm run check
```

## 发布

推送到 `main` 后，GitHub Actions 自动生成 `dist/`、检查页面并发布 GitHub Pages。仓库 Settings → Pages 中的 Source 应设置为 **GitHub Actions**。发布配置见 [pages.yml](.github/workflows/pages.yml)。

本仓库是学术主页与技术博客的维护入口。原博客从根路径迁移至 `/blog/`，保留全部文章、图片、分类与搜索索引；构建时为原文章地址生成跳转，并保留旧图片地址。`blog/` 保存的是原 Hexo 静态输出，迁移前版本为 `3e28e4c27d3d304fe4e5e95428caa5eceac2d5eb`，可从 Git 历史恢复。未来从 Hexo 发布博客时，请将生成结果放入 `blog/` 并将 Hexo 的 `url`、`root` 配置为 `https://yuhengna.github.io/blog`、`/blog/`，不要覆盖仓库根目录。

原 `academic-homepage` 仓库仅保留长网址跳转。以后绑定自定义域名时，请同步更新 `site.url` 及博客地址。

迁移时一并修复了原博客 `events.js` 缺失逗号导致的脚本错误，并把原先缺失的背景图和友链图标引用改为博客内已有的默认图片。

## 文件结构

```text
data/site.json          中英文内容
assets/style.css        排版、颜色与移动端样式
assets/site.js          导航高亮与二维码弹窗（非必需）
scripts/build.mjs       零依赖静态生成器
scripts/check.mjs       页面与链接检查
scripts/build-blog.mjs  博客复制与旧地址兼容
scripts/check-blog.mjs  博客链接、搜索与跳转检查
scripts/serve.mjs       本地预览
blog/                   原技术博客的静态内容
.github/workflows/      自动发布
```
