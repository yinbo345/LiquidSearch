// LiquidSearch Enhancer - 广告屏蔽 + 液态玻璃卡片 + 设置
// 去除搜索引擎广告，应用真正的液态玻璃风格

(function () {
  'use strict';

  // ========== 读取用户设置 ==========
  let settings = {
    removeAds: true,
    cardStyle: true,
    animations: true,
    theme: 'white',       // 'white' | 'dark'
    fontSize: 'normal',   // 'normal' | 'large'
    themeColor: 'default', // 'default'|'mint'|'sakura'|'amber'|'sky'
    beautificationEnabled: true,
  };

  let styleEl = null;

  // 主题色映射
  const COLOR_MAP = {
    default: { primary:'#667eea', secondary:'#764ba2', glow:'rgba(102,126,234,'  },
    mint:    { primary:'#38b2ac', secondary:'#319795', glow:'rgba(56,178,172,'   },
    sakura:  { primary:'#ed64a6', secondary:'#d53f8c', glow:'rgba(237,100,166,' },
    amber:   { primary:'#ed8936', secondary:'#dd6b20', glow:'rgba(237,137,54,'  },
    sky:     { primary:'#4299e1', secondary:'#3182ce', glow:'rgba(66,153,225,'  },
  };

  function loadSettings(callback) {
    if (chrome && chrome.storage) {
      chrome.storage.sync.get(settings, (items) => {
        Object.assign(settings, items);
        if (callback) callback();
      });
    } else {
      if (callback) callback();
    }
  }

  // ========== 1. 广告屏蔽规则 ==========
  const AD_SELECTORS = [
    '.ec_tuiguang', '.ec_wise_ad',
    'div[data-tools]',
    '.c-container .ec-ad',
    'div[tpl="right_ec_wise"]',
    'div[tpl="right_ec"]',
    '[data-pid="share"]',
    '[class*="ad-"]', '[class*="_ad_"]',
    'div[cmatchid]',
    '.ads-ad', '.ads-fr', '.ads-rc',
    '[data-text-ad]', '[aria-label*="广告"]',
    'div.g:has([data-google-query-id])',
    'div.pla-unit',
    '.b_ad', '.b_ads', 'li.b_adLastChild',
    '.results .ad',
    '.result-ad',
    '[class*="spon"]', '[id*="spon"]',
    'a[href*="eClick"]', 'a[href*="eclick"]',

    /* 百度热搜榜 */
    '#hotsearch-content',
    '#hotsearch',
    '.hotsearch',
    '[data-module="hotsearch"]',
    '.c-font-normal.c-color-t[tpl="hotsearch"]',
    'div[tpl="hotsearch"]',
    /* 百度相关搜索 */
    '#rs',
    '#rs_word',
    '.tpt_top',
    '.tpt_bottom',
    '.c-container[id="rs"]',
    'div[id="rs"]',
    /* 搜狗广告 */
    '.results .ad-result',
    '.results [data-ad]',
    '#results .ad',
    '.ft .ad-wrap',
    /* 360搜索 AI总结 + 广告 + 相关搜索 + 实时热搜 */
    '.ai-summary',
    '[class*="ai-summary"]',
    '[class*="ai_summary"]',
    '.result-ai',
    '.so-bd .ad',
    '#so_results .ad',
    '.news-article-ad',
    /* 360相关搜索 */
    '.rs_cont',
    '.rs',
    '#rs',
    '[class*="related"]',
    '[class*="relate_"]',
    '.search-relation',
    '.relate-new',
    /* 360实时热搜 */
    '.hot-news',
    '.hot-news-list',
    '[class*="hot-news"]',
    '.real-time-hot',
    '[class*="real-time"]',
    '.hot-rank',
    '[class*="hot-rank"]',
    '.trending',
    '[class*="trending"]',
    /* 必应相关搜索 */
    '.b_rs',
    '.b_related',
    '#b_context',
    /* 360主页广告 */
    '.ad-top',
    '.ad-bottom',
    '.ad-left',
    '.ad-right',
    '[class*="ad-wrap"]',
    '[class*="feed-ad"]',
    '[class*="banner-ad"]',
    '.promotion',
    '[class*="promotion"]',
    '.sponsor',
    '[class*="sponsor"]',
    '.recommend-ad',
    '.news-ad',
    '.info-ad',
  ];

  function removeAds() {
    if (!settings.removeAds) return;
    AD_SELECTORS.forEach(sel => {
      try { document.querySelectorAll(sel).forEach(el => el.remove()); } catch (e) {}
    });
    document.querySelectorAll('*').forEach(el => {
      try {
        const txt = (el.innerText || '').slice(0, 50);
        if (/^广告\s/.test(txt) || /^Ad\s/i.test(txt) || /^Sponsored\s/i.test(txt)) {
          const card = el.closest('.result') || el.closest('.g') || el.closest('.b_algo') || el;
          if (card && card.remove) card.remove();
        }
      } catch (e) {}
    });
  }

  // ========== 2. 注入动态样式（主题色 + 增强液态玻璃效果）=========
  function injectStyles() {
    if (settings.beautificationEnabled === false) return;

    if (styleEl && styleEl.parentNode) styleEl.remove();
    const prev = document.getElementById('ls-dynamic');
    if (prev) prev.remove();

    const isDark = settings.theme === 'dark';
    const c = COLOR_MAP[settings.themeColor] || COLOR_MAP['default'];

    const cardBg      = isDark ? 'rgba(40,40,55,0.42)'  : 'rgba(255,255,255,0.36)';
    const cardBorder  = isDark ? c.glow + '0.35)' : c.glow + '0.25)';
    const cardShadow  = isDark
      ? '0 8px 32px ' + c.glow + '0.18), 0 2px 8px rgba(0,0,0,0.20)'
      : '0 8px 32px ' + c.glow + '0.10), 0 2px 8px rgba(0,0,0,0.04)';
    const hoverBg     = isDark ? 'rgba(50,50,65,0.78)' : 'rgba(255,255,255,0.78)';
    const hoverShadow = isDark
      ? '0 16px 48px ' + c.glow + '0.25), 0 6px 16px rgba(0,0,0,0.22)'
      : '0 16px 48px ' + c.glow + '0.13), 0 6px 16px rgba(0,0,0,0.06)';
    const pageBg      = isDark ? '#12121c' : '#f4f5f7';
    const textColor   = isDark ? '#e0e0e8' : '#1d1d1f';
    const linkColor   = isDark ? c.primary : '#1a1a2e';
    const linkHover   = c.primary;
    const urlColor    = isDark ? '#7a7a8e' : '#8e8ea0';
    const scrollbar   = isDark ? c.glow + '0.45)' : c.glow + '0.32)';
    const scrollHover = isDark ? c.glow + '0.65)' : c.glow + '0.50)';
    const accentGlow  = c.glow + '0.55)';

    const css = [
      /* 液态玻璃卡片：百度/Bing/Google/通用 */
      '#content_left > .result,',
      '#content_left > .result-op,',
      '#content_left > .c-container,',
      'div.g,',
      'div[data-hveid],',
      '.b_algo,',
      '.results .vrResult,',
      '.result,',
      /* DuckDuckGo */
      '.result--web,',
      '.result__body,',
      /* Yahoo */
      '.dd.algo,',
      '.srchResults > li,',
      /* Yandex */
      '.serp-item,',
      '.serp-list .serp-item,',
      /* Ecosia */
      '.result-item,',
      /* Brave Search */
      '.Vroosting,',
      '.VrResults > div,',
      /* 360搜索 */
      '.result,',
      '.res-list .res-item,',
      '#results .res,',
      '[data-360-result],',
      /* 搜狗搜索 */
      '#results .vrResult,',
      '#results .result,',
      '.results .result,',
      '.wrap_result,',
      /* 通用后备 */
      'article,',
      'li.result,',
      'div[data-ved] {',
        'background:', cardBg, '!important;',
        'backdrop-filter: blur(48px) saturate(2.0) !important;',
        '-webkit-backdrop-filter: blur(48px) saturate(2.0) !important;',
        'border: 1px solid', cardBorder, '!important;',
        'border-left: 3px solid', c.primary, '!important;',
        'border-radius: 18px !important;',
        'box-shadow:', cardShadow, '!important;',
        'padding: 24px 28px !important;',
        'margin-bottom: 18px !important;',
        'position: relative !important;',
        'color:', textColor, '!important;',
        'transition: transform 0.45s cubic-bezier(.25,.84,.32,1.12), box-shadow 0.45s cubic-bezier(.25,.84,.32,1.12), background 0.3s ease, border-color 0.3s ease !important;',
        'will-change: transform, box-shadow !important;',
        'transform: translateZ(0) !important;',
      '}',

      /* 顶部主题色高光 */
      '#content_left > .result::before,',
      '#content_left > .result-op::before,',
      '#content_left > .c-container::before,',
      'div.g::before,',
      '.b_algo::before,',
      '.result::before,',
      /* 360搜索 */
      '.res-list .res-item::before,',
      '#results .res::before,',
      '[data-360-result]::before,',
      /* 搜狗搜索 */
      '#results .result::before,',
      '.results .result::before,',
      '.wrap_result::before,',
      /* DuckDuckGo / Yahoo / Yandex / Ecosia / Brave */
      '.result--web::before,',
      '.dd.algo::before,',
      '.serp-item::before,',
      '.result-item::before,',
      '.Vroosting::before {',
        'content: "";',
        'position: absolute;',
        'top: 0; left: 0; right: 0;',
        'height: 2px;',
        'background: linear-gradient(90deg,', c.glow + '0) 0%,', accentGlow, '50%,', c.glow + '0) 100%);',
        'border-radius: 18px 18px 0 0;',
        'pointer-events: none;',
      '}',

      /* 底部主题色辉光 */
      '#content_left > .result::after,',
      '#content_left > .result-op::after,',
      '#content_left > .c-container::after,',
      'div.g::after,',
      '.b_algo::after,',
      '.result::after,',
      /* 360搜索 */
      '.res-list .res-item::after,',
      '#results .res::after,',
      '[data-360-result]::after,',
      /* 搜狗搜索 */
      '#results .result::after,',
      '.results .result::after,',
      '.wrap_result::after,',
      /* DuckDuckGo / Yahoo / Yandex / Ecosia / Brave */
      '.result--web::after,',
      '.dd.algo::after,',
      '.serp-item::after,',
      '.result-item::after,',
      '.Vroosting::after {',
        'content: "";',
        'position: absolute;',
        'bottom: 0; left: 5%; right: 5%;',
        'height: 50%;',
        'background: linear-gradient(to top,', c.glow + '0.07) 0%,', c.glow + '0) 100%);',
        'border-radius: 0 0 18px 18px;',
        'pointer-events: none;',
      '}',

      /* 卡片悬停 */
      '#content_left > .result:hover,',
      '#content_left > .result-op:hover,',
      '#content_left > .c-container:hover,',
      'div.g:hover,',
      'div[data-hveid]:hover,',
      '.b_algo:hover,',
      '.results .vrResult:hover,',
      '.result:hover,',
      /* 360搜索 */
      '.res-list .res-item:hover,',
      '#results .res:hover,',
      '[data-360-result]:hover,',
      /* 搜狗搜索 */
      '#results .result:hover,',
      '.results .result:hover,',
      '.wrap_result:hover,',
      /* DuckDuckGo / Yahoo / Yandex / Ecosia / Brave */
      '.result--web:hover,',
      '.dd.algo:hover,',
      '.serp-item:hover,',
      '.result-item:hover,',
      '.Vroosting:hover {',
        'transform: translateY(-6px) scale(1.025) translateZ(0) !important;',
        'box-shadow:', hoverShadow, '!important;',
        'background:', hoverBg, '!important;',
        'border-color:', c.primary, '!important;',
      '}',

      /* 搜索框 */
      'input[type="text"],',
      'input[type="search"],',
      'textarea,',
      '#kw,',
      '#searchbox,',
      '.search-box,',
      '[role="searchbox"] {',
        'transition: all 0.35s cubic-bezier(.25,.84,.32,1.12) !important;',
        'border-radius: 12px !important;',
      '}',
      'input[type="text"]:focus,',
      'input[type="search"]:focus,',
      '#kw:focus,',
      '[role="searchbox"]:focus {',
        'transform: scale(1.03) translateZ(0) !important;',
        'border-color:', c.primary, '!important;',
        'box-shadow: 0 0 0 3px', c.glow + '0.18) !important;',
      '}',

      /* 按钮 */
      'input[type="submit"],',
      'button,',
      '.search-btn,',
      '#su,',
      '[role="search"] button,',
      '[type="submit"] {',
        'transition: all 0.35s cubic-bezier(.25,.84,.32,1.12) !important;',
        'will-change: transform !important;',
        'border-radius: 10px !important;',
      '}',
      'input[type="submit"]:hover,',
      'button:hover,',
      '#su:hover,',
      '[type="submit"]:hover {',
        'transform: scale(1.06) translateZ(0) !important;',
      '}',

      /* 链接 */
      'a, a:visited, .result a, .b_algo a, div.g a {',
        'color:', linkColor, '!important;',
        'transition: color 0.3s ease !important;',
      '}',
      'a:hover, .result a:hover, .b_algo a:hover {',
        'color:', linkHover, '!important;',
        'text-decoration: underline !important;',
      '}',
      '.c-showurl, .url_display, cite,',
      '.b_caption cite, div.g cite {',
        'color:', urlColor, '!important;',
        'font-size: 13px !important;',
      '}',

      /* 百度顶部栏 */
      '#head, #s_top_wrap, .head-wrap {',
        'backdrop-filter: blur(20px) saturate(1.3) !important;',
        '-webkit-backdrop-filter: blur(20px) saturate(1.3) !important;',
        'border-bottom: 1px solid', (isDark ? 'rgba(60,60,75,0.50)' : c.glow + '0.18)'), '!important;',
      '}',
      'html:not([data-liquid-theme="dark"]) #head,',
      'html:not([data-liquid-theme="dark"]) #s_top_wrap,',
      'html:not([data-liquid-theme="dark"]) .head-wrap {',
        'background: rgba(244,245,247,0.78) !important;',
      '}',
      'html[data-liquid-theme="dark"] #head,',
      'html[data-liquid-theme="dark"] #s_top_wrap,',
      'html[data-liquid-theme="dark"] .head-wrap {',
        'background: rgba(18,18,28,0.78) !important;',
      '}',

      /* 滚动条 */
      '::-webkit-scrollbar { width: 8px; }',
      '::-webkit-scrollbar-track { background: rgba(200,205,215,0.15); border-radius: 8px; }',
      '::-webkit-scrollbar-thumb { background:', scrollbar, 'border-radius: 8px; }',
      '::-webkit-scrollbar-thumb:hover { background:', scrollHover, '}',

      /* 页面背景 */
      'html, body {',
        'background:', pageBg, '!important;',
        'min-height: 100vh;',
      '}',

      /* 分页按钮 */
      '.n, .pc, .b_pag a, #page a {',
        'transition: all 0.35s cubic-bezier(.25,.84,.32,1.12) !important;',
        'border-radius: 8px !important;',
      '}',
      '.n:hover, .pc:hover, .b_pag a:hover {',
        'transform: scale(1.08) translateZ(0) !important;',
        'border-color:', c.primary, '!important;',
        'color:', c.primary, '!important;',
      '}',

      /* 屏蔽：百度热搜 + 相关搜索 + 必应相关搜索 */
      '#hotsearch-content,',
      '#hotsearch,',
      '.hotsearch,',
      '[data-module="hotsearch"],',
      'div[tpl="hotsearch"],',
      '#rs,',
      '#rs_word,',
      '.tpt_top,',
      '.tpt_bottom,',
      '.c-container[id="rs"],',
      'div[id="rs"],',
      '.b_rs,',
      '.b_related,',
      /* 360相关搜索 + 实时热搜 */
      '.rs_cont,',
      '.rs,',
      '#rs,',
      '[class*="related"],',
      '.search-relation,',
      '.relate-new,',
      '.hot-news,',
      '.hot-news-list,',
      '[class*="hot-news"],',
      '.real-time-hot,',
      '[class*="real-time"],',
      '.hot-rank,',
      '[class*="hot-rank"],',
      '.trending,',
      '[class*="trending"],',
      '#b_context {',
        'display: none !important;',
      '}',

      /* 360主页/导航页简化 - 只保留搜索框和快捷访问 */
      'body[data-ls-360home="1"] .header,',
      'body[data-ls-360home="1"] .top-nav,',
      'body[data-ls-360home="1"] .nav,',
      'body[data-ls-360home="1"] .news,',
      'body[data-ls-360home="1"] .news-feed,',
      'body[data-ls-360home="1"] .feed,',
      'body[data-ls-360home="1"] .recommend,',
      'body[data-ls-360home="1"] .recommendation,',
      'body[data-ls-360home="1"] .hot-search,',
      'body[data-ls-360home="1"] .trending,',
      'body[data-ls-360home="1"] .rank,',
      'body[data-ls-360home="1"] .ranking,',
      'body[data-ls-360home="1"] .ad,',
      'body[data-ls-360home="1"] [class*="ad"],',
      'body[data-ls-360home="1"] .footer,',
      'body[data-ls-360home="1"] .bottom,',
      'body[data-ls-360home="1"] .links,',
      'body[data-ls-360home="1"] .friend-link,',
      'body[data-ls-360home="1"] .sitemap,',
      'body[data-ls-360home="1"] .content,',
      'body[data-ls-360home="1"] .main-content,',
      /* 360导航页特有元素 */
      'body[data-ls-360home="1"] .sites,',
      'body[data-ls-360home="1"] .site-list,',
      'body[data-ls-360home="1"] .category,',
      'body[data-ls-360home="1"] .category-list,',
      'body[data-ls-360home="1"] .tool,',
      'body[data-ls-360home="1"] .tool-box,',
      'body[data-ls-360home="1"] .module,',
      'body[data-ls-360home="1"] .panel,',
      'body[data-ls-360home="1"] .card:not(:has(.shortcut)),',
      'body[data-ls-360home="1"] .box:not(:has(.shortcut)),',
      'body[data-ls-360home="1"] .section,',
      'body[data-ls-360home="1"] .area,',
      'body[data-ls-360home="1"] .main-site,',
      'body[data-ls-360home="1"] .hot-site,',
      'body[data-ls-360home="1"] .recommend-site,',
      'body[data-ls-360home="1"] .info,',
      'body[data-ls-360home="1"] .information,',
      'body[data-ls-360home="1"] .weather,',
      'body[data-ls-360home="1"] .widget,',
      'body[data-ls-360home="1"] .widget-box,',
      'body[data-ls-360home="1"] .wrap:not(:has(#search)):not(:has(.shortcut)),',
      'body[data-ls-360home="1"] .container:not(:has(#search)):not(:has(.shortcut)) {',
        'display: none !important;',
      '}',
    ].join(' ');

    styleEl = document.createElement('style');
    styleEl.id = 'ls-dynamic';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  // ========== 2b. 关闭所有美化效果 ==========
  function disableAllStyles() {
    if (styleEl && styleEl.parentNode) styleEl.remove();
    const lsFont = document.getElementById('ls-font');
    if (lsFont && lsFont.parentNode) lsFont.remove();

    const allCards = document.querySelectorAll(
      '#content_left > .result, #content_left > .result-op, div.g, div[data-hveid], .b_algo, .results .vrResult, .result'
    );
    allCards.forEach(el => {
      el.style.background         = '';
      el.style.backdropFilter      = '';
      el.style.webkitBackdropFilter = '';
      el.style.borderRadius       = '';
      el.style.border              = '';
      el.style.borderLeft         = '';
      el.style.boxShadow           = '';
      el.style.padding            = '';
      el.style.marginBottom       = '';
      el.style.transition          = '';
      el.style.willChange         = '';
      el.style.transform          = '';
      el.style.cursor             = '';
      el.style.overflow           = '';
      el.style.position           = '';
      el.style.color              = '';
      delete el.dataset.liquidStyled;
      delete el.dataset.liquidTheme;
      delete el.dataset.liquidColor;
    });

    document.body.style.background             = '';
    document.documentElement.style.background   = '';
    delete document.documentElement.dataset.liquidTheme;
  }

  // ========== 3. 统一字体 ==========
  function applyFont() {
    if (settings.beautificationEnabled === false) return;
    const size = settings.fontSize === 'large' ? '18px' : '16px';
    document.body.style.fontFamily = '"Microsoft YaHei", "微软雅黑", "PingFang SC", sans-serif';
    document.body.style.fontSize   = size;
    if (document.getElementById('ls-font')) return;
    const style = document.createElement('style');
    style.id = 'ls-font';
    style.textContent = [
      '* { font-family: "Microsoft YaHei", "微软雅黑", "PingFang SC", sans-serif !important; font-size:', size, '!important; }',
      'input, textarea, select, button { font-family: "Microsoft YaHei", "微软雅黑", "PingFang SC", sans-serif !important; }',
    ].join(' ');
    document.head.appendChild(style);
  }


  // ========== 4. 主流程 ==========
  function init() {
    loadSettings(() => {
      if (settings.beautificationEnabled === false) {
        disableAllStyles();
        return;
      }
      document.documentElement.dataset.liquidTheme = settings.theme;

      // 检测是否在360主页/导航页（不是搜索结果页）
      if ((location.hostname === 'www.so.com' && location.pathname === '/') ||
          (location.hostname === 'hao.360.cn' && location.pathname === '/')) {
        document.body.dataset.ls360home = '1';
      } else {
        delete document.body.dataset.ls360home;
      }

      removeAds();
      injectStyles();
      applyFont();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // MutationObserver — 处理广告和新增卡片
  const observer = new MutationObserver(() => {
    if (settings.beautificationEnabled === false) return;
    removeAds();
      if (settings.cardStyle) {
        const cards = document.querySelectorAll(
          '#content_left > .result, #content_left > .result-op, #content_left > .c-container, ' +
          'div.g, div[data-hveid], .b_algo, .results .vrResult, .result, ' +
          /* DuckDuckGo */
          '.result--web, .result__body, ' +
          /* Yahoo */
          '.dd.algo, .srchResults > li, ' +
          /* Yandex */
          '.serp-item, ' +
          /* Ecosia */
          '.result-item, ' +
          /* Brave */
          '.Vroosting, .VrResults > div, ' +
          /* 360搜索 */
          '.result, .res-list .res-item, #results .res, [data-360-result], ' +
          /* 搜狗 */
          '#results .vrResult, #results .result, .results .result, .wrap_result, ' +
          /* 通用后备 */
          'article, li.result, div[data-ved]'
        );
        const isDark = settings.theme === 'dark';
        const cc = COLOR_MAP[settings.themeColor] || COLOR_MAP['default'];
        const cardBg     = isDark ? 'rgba(40,40,55,0.42)' : 'rgba(255,255,255,0.36)';
        const cardBorder = isDark ? cc.glow + '0.35)' : cc.glow + '0.25)';
        const cardShadow = isDark
          ? '0 8px 32px ' + cc.glow + '0.18), 0 2px 8px rgba(0,0,0,0.20)'
          : '0 8px 32px ' + cc.glow + '0.10), 0 2px 8px rgba(0,0,0,0.04)';
        cards.forEach(el => {
          if (el.dataset.liquidStyled && el.dataset.liquidTheme === settings.theme && el.dataset.liquidColor === settings.themeColor) return;
          el.dataset.liquidStyled  = '1';
          el.dataset.liquidTheme   = settings.theme;
          el.dataset.liquidColor  = settings.themeColor;
          el.style.background         = cardBg;
          el.style.backdropFilter     = 'blur(48px) saturate(2.0)';
          el.style.webkitBackdropFilter = 'blur(48px) saturate(2.0)';
          el.style.border             = '1px solid ' + cardBorder;
          el.style.borderLeft         = '3px solid ' + cc.primary;
          el.style.borderRadius       = '18px';
          el.style.boxShadow          = cardShadow;
          el.style.padding           = '24px 28px';
          el.style.marginBottom       = '18px';
          el.style.position          = 'relative';
          el.style.willChange        = 'transform, box-shadow';
          el.style.transform         = 'translateZ(0)';
          el.style.transition        = 'transform 0.45s cubic-bezier(.25,.84,.32,1.12), box-shadow 0.45s cubic-bezier(.25,.84,.32,1.12), background 0.3s ease, border-color 0.3s ease';
        });
      }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // SPA 路由切换
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(init, 600);
    }
  }).observe(document, { subtree: true, childList: true });

  // 监听来自 popup 的设置变更
  if (chrome && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'SETTINGS_UPDATED') {
        chrome.storage.sync.get(settings, (items) => {
          Object.assign(settings, items);
          if (settings.beautificationEnabled === false) {
            disableAllStyles();
            return;
          }
          document.documentElement.dataset.liquidTheme = settings.theme;
          removeAds();
          injectStyles();
          applyFont();
        });
      }
      if (msg.type === 'DISABLE_BEAUTIFICATION') {
        chrome.storage.sync.get(settings, (items) => {
          Object.assign(settings, items);
          settings.beautificationEnabled = false;
          chrome.storage.sync.set({ beautificationEnabled: false }, () => {
            disableAllStyles();
          });
        });
      }
    });
  }
})();
