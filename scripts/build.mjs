import { readFile, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildBlog } from './build-blog.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await readFile(path.join(root, 'data/site.json'), 'utf8'));
const out = path.join(root, 'dist');
const e = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = (value, lang) => typeof value === 'string' ? value : (value?.[lang] ?? '');
const localized = (value, lang) => e(text(value, lang));
const url = value => {
  if (!value || /^(?:https?:\/\/|mailto:|(?:assets|files)\/)/.test(value)) return e(value);
  throw new Error(`Unsupported URL: ${value}`);
};
const external = (label, href, extra = '') => `<a href="${url(href)}"${href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}${extra}>${label}</a>`;
const labels = {
  en: {
    home: 'Academic homepage', skip: 'Skip to content', about: 'About', aboutHeading: 'About Me',
    research: 'Research Interests', news: 'News', publications: 'Selected Research', projects: 'Open Source & Projects',
    experience: 'Experience', education: 'Education', researchExperience: 'Research & Industry', honors: 'Honors & Awards',
    contact: 'Contact', email: 'Email', blog: 'Blog', paper: 'Paper', photo: 'Portrait to be added',
    updates: 'Research updates will appear here.', researchNote: 'Preprints and ongoing research.',
    figure: 'Figure to be added', updated: 'Last updated', top: 'Back to top',
    footer: 'Yuheng Na · Embodied AI & Robot Learning', contactText: 'For research conversations and collaboration:',
    changeLanguage: 'Switch to Chinese', menu: 'Open navigation', expandNews: 'Earlier updates',
    wechat: 'WeChat', xiaohongshu: 'Xiaohongshu', scholar: 'Google Scholar',
    close: 'Close', originalQR: 'Open full-size QR code',
    wechatHint: 'Scan with WeChat to connect.', xiaohongshuHint: 'Scan with Xiaohongshu to find my profile.'
  },
  zh: {
    home: '学术个人主页', skip: '跳转到正文', about: '关于', aboutHeading: '关于我',
    research: '研究兴趣', news: '最新动态', publications: '代表性研究', projects: '开源与项目',
    experience: '个人经历', education: '教育经历', researchExperience: '研究与工作经历', honors: '荣誉与奖项',
    contact: '联系', email: '邮箱', blog: '博客', paper: '论文', photo: '个人照片待补充',
    updates: '后续将在此更新研究动态。', researchNote: '预印本与正在开展的研究。',
    figure: '研究配图待补充', updated: '最近更新', top: '返回顶部',
    footer: '纳昱恒 · 具身智能与机器人学习', contactText: '欢迎交流研究想法与合作机会：',
    changeLanguage: 'Switch to English', menu: '展开导航', expandNews: '更早动态',
    wechat: '微信', xiaohongshu: '小红书', scholar: '谷歌学术',
    close: '关闭', originalQR: '查看二维码原图',
    wechatHint: '使用微信扫一扫，添加好友。', xiaohongshuHint: '使用小红书扫一扫，找到我的主页。'
  }
};

function render(lang) {
  const t = labels[lang];
  const p = data.profile;
  const isEn = lang === 'en';
  const filename = isEn ? 'index.html' : 'zh.html';
  const altFilename = isEn ? 'zh.html' : 'index.html';
  const languageTag = isEn ? 'en' : 'zh-CN';
  const canonical = data.site.url + (isEn ? '' : filename);
  const title = `${isEn ? p.name : p.chineseName} — ${t.home}`;
  const qrLink = (id,label,src) => src ? `<a href="${url(src)}" target="_blank" rel="noopener" data-qr-dialog="${id}" aria-haspopup="dialog" aria-controls="${id}">${label}</a>` : '';
  const qrDialog = (id,label,src,hint) => src ? `<dialog id="${id}" class="contact-dialog" aria-labelledby="${id}-title"><div class="contact-dialog-header"><h2 id="${id}-title">${label}</h2><button type="button" class="dialog-close" data-close-dialog aria-label="${t.close}" autofocus>×</button></div><img class="contact-qr-image" src="${url(src)}" alt="${e(p.name)} — ${label} QR code"><p class="contact-dialog-hint">${hint}</p><a class="qr-original" href="${url(src)}" target="_blank" rel="noopener">${t.originalQR} ↗</a></dialog>` : '';
  const linkList = list => list.map(l => external(`${localized(l.label, lang)} <span aria-hidden="true">↗</span>`, l.url)).join('');
  const heading = (id, title, aside = '') => `<div class="section-heading"><h2 id="${id}-heading">${title}</h2>${aside ? `<span class="section-note">${aside}</span>` : ''}</div>`;
  const nav = [['about',t.about],['publications',t.publications],['projects',isEn?'Projects':'项目'],['experience',t.experience]];
  const experienceRows = entries => entries.map(item => `<li class="timeline-row"><div class="timeline-date">${localized(item.date, lang)}</div><div><h4>${localized(item.organization, lang)}</h4><p>${localized(item.position, lang)}</p>${text(item.detail, lang) ? `<p class="muted">${localized(item.detail, lang)}</p>` : ''}</div></li>`).join('');
  const newsRow = item => `<li><time datetime="${e(item.date.replace('.', '-'))}">${e(item.date)}</time><div>${localized(item.text, lang)}${item.url ? ` ${external(`${localized(item.linkLabel || (isEn ? 'More' : '详情'), lang)} <span aria-hidden="true">↗</span>`,item.url)}` : ''}</div></li>`;
  const news = data.news.length ? `<ul class="news-list">${data.news.slice(0,3).map(newsRow).join('')}</ul>${data.news.length > 3 ? `<details><summary>${t.expandNews}</summary><ul class="news-list">${data.news.slice(3).map(newsRow).join('')}</ul></details>` : ''}` : `<p class="empty-note"><span aria-hidden="true">—</span> ${t.updates}</p>`;
  const person = { '@context':'https://schema.org', '@type':'Person', name:p.name, alternateName:p.chineseName, url:data.site.url, sameAs:[p.github,p.blog,p.scholar].filter(Boolean) };
  return `<!doctype html>
<html lang="${languageTag}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(title)}</title>
  <meta name="description" content="${localized(data.site.description, lang)}">
  <meta name="theme-color" content="#ffffff">
  <meta property="og:title" content="${e(title)}">
  <meta property="og:description" content="${localized(data.site.description, lang)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url(canonical)}">
  <link rel="canonical" href="${url(canonical)}">
  <link rel="alternate" hreflang="en" href="${url(data.site.url + 'index.html')}">
  <link rel="alternate" hreflang="zh-CN" href="${url(data.site.url + 'zh.html')}">
  <link rel="alternate" hreflang="x-default" href="${url(data.site.url)}">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/style.css">
  <script type="application/ld+json">${JSON.stringify(person).replaceAll('<','\\u003c')}</script>
  <script src="assets/site.js" defer></script>
</head>
<body id="top">
  <a class="skip-link" href="#main">${t.skip}</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="wordmark" href="#top">Yuheng Na<span class="wordmark-dot" aria-hidden="true">.</span></a>
      <div class="header-right">
        <nav aria-label="${isEn?'Main navigation':'主导航'}" class="main-nav" id="main-nav">${nav.map(([id,label])=>`<a href="#${id}">${label}</a>`).join('')}</nav>
        <a class="language-link" href="${altFilename}" lang="${isEn?'zh-CN':'en'}" aria-label="${t.changeLanguage}">${isEn?'中文':'EN'}</a>
      </div>
    </div>
  </header>
  <main class="page-shell" id="main">
    <section class="profile-hero" id="about" aria-labelledby="profile-name">
      <div class="portrait-column">
        ${p.portrait ? `<img class="portrait" src="${url(p.portrait)}" alt="${e(p.name)}" width="224" height="272">` : `<div class="portrait portrait-placeholder" role="img" aria-label="${t.photo}"><span class="portrait-monogram">YN</span><span class="portrait-caption">${t.photo}</span></div>`}
        <p class="portrait-location">${localized(p.location, lang)}</p>
      </div>
      <div class="profile-copy">
        <p class="eyebrow">${localized(p.role,lang)}</p>
        <h1 id="profile-name">${e(p.name)} <span lang="zh-CN">「${e(p.chineseName)}」</span></h1>
        <h2 class="about-heading">${t.aboutHeading}</h2>
        <div class="introduction">${p.about[lang].map(s=>`<p>${e(s)}</p>`).join('')}</div>
        <nav class="profile-links" aria-label="${isEn?'Contact and profiles':'联系与个人资料'}">
          ${external(t.email,'mailto:'+p.email)}
          ${external('GitHub',p.github)}
          ${external(t.blog,p.blog)}
          ${qrLink('wechat-dialog',t.wechat,p.wechatQr)}
          ${p.scholar?external(t.scholar,p.scholar):''}
          ${qrLink('xiaohongshu-dialog',t.xiaohongshu,p.xiaohongshuQr)}
          ${p.cv?external('CV',p.cv):''}
        </nav>
      </div>
    </section>

    <section class="research-strip" aria-labelledby="research-heading">
      <h2 id="research-heading">${t.research}</h2>
      <ul>${data.research.map(r=>`<li>${localized(r,lang)}</li>`).join('')}</ul>
    </section>

    <section class="academic-section news-section" id="news" aria-labelledby="news-heading">
      ${heading('news',t.news)}${news}
    </section>

    <section class="academic-section" id="publications" aria-labelledby="publications-heading">
      ${heading('publications',t.publications,t.researchNote)}
      <div class="publication-list">${data.publications.map(item=>`
        <article class="publication" id="${e(item.id)}">
          ${item.image ? external(`<img class="paper-image" src="${url(item.image)}" alt="${e(item.shortName)} — Figure 1" width="${e(item.imageWidth || 220)}" height="${e(item.imageHeight || 150)}" loading="lazy">`, item.links[0].url, ` class="paper-preview" aria-label="${e(item.shortName)} — ${t.paper}"`) : `<div class="paper-image paper-placeholder" aria-label="${t.figure}"><span class="paper-type">${e(item.year)} / RESEARCH</span><span class="paper-monogram">${e(item.shortName)}</span><span class="paper-placeholder-label">${t.figure}</span></div>`}
          <div class="paper-copy">
            <h3>${external(e(item.title),item.links[0].url)}</h3>
            <p class="paper-authors"><strong>${e(p.name)}</strong><span class="role-separator">·</span>${localized(item.role,lang)}</p>
            <p class="paper-summary">${localized(item.summary,lang)}</p>
            <div class="item-links">${linkList(item.links)}</div>
          </div>
        </article>`).join('')}
      </div>
    </section>

    <section class="academic-section" id="projects" aria-labelledby="projects-heading">
      ${heading('projects',t.projects)}
      <div class="project-list">${data.projects.map((item,i)=>`<article class="project"><span class="project-number" aria-hidden="true">0${i+1}</span><div class="project-copy"><div class="project-title"><h3>${e(item.name)}</h3><span>${localized(item.role,lang)}</span></div><p>${localized(item.description,lang)}</p><div class="item-links">${linkList(item.links)}</div></div></article>`).join('')}</div>
    </section>

    <section class="academic-section" id="experience" aria-labelledby="experience-heading">
      ${heading('experience',t.experience)}
      <div class="experience-group"><h3>${t.education}</h3><ul class="timeline">${experienceRows(data.education)}</ul></div>
      <div class="experience-group"><h3>${t.researchExperience}</h3><ul class="timeline">${experienceRows(data.experience)}</ul></div>
    </section>

    <section class="academic-section" id="honors" aria-labelledby="honors-heading">
      ${heading('honors',t.honors)}
      <ul class="honors-list">${data.honors.map(item=>`<li><span class="honor-year">${e(item.year)}</span><p><strong>${localized(item.title,lang)}</strong><span class="honor-context">${localized(item.context,lang)}</span></p></li>`).join('')}</ul>
    </section>

    <section class="academic-section contact-section" id="contact" aria-labelledby="contact-heading">
      ${heading('contact',t.contact)}
      <p>${t.contactText} ${external(e(p.email),'mailto:'+p.email)}</p>
    </section>
  </main>
  ${qrDialog('wechat-dialog',t.wechat,p.wechatQr,t.wechatHint)}
  ${qrDialog('xiaohongshu-dialog',t.xiaohongshu,p.xiaohongshuQr,t.xiaohongshuHint)}
  <footer class="site-footer"><div><span>${t.footer}</span><span>${t.updated} ${e(data.site.updated)} <span aria-hidden="true">·</span> <a href="#top">${t.top} ↑</a></span></div></footer>
</body>
</html>`;
}

await rm(out, {recursive:true,force:true});
await mkdir(out,{recursive:true});
await cp(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
for (const [lang,filename] of [['en','index.html'],['zh','zh.html']]) await writeFile(path.join(out,filename),render(lang));
await writeFile(path.join(out,'.nojekyll'),'');
await writeFile(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${data.site.url}sitemap.xml\n`);
await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','zh.html'].map(f=>`<url><loc>${e(data.site.url+f)}</loc></url>`).join('')}</urlset>`);
await buildBlog(root, out);
console.log('Built English and Chinese homepages in dist/.');
