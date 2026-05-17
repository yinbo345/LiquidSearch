/* welcome.js — 外部 JS 文件，避免 Manifest V3 CSP 拦截内联脚本 */

document.addEventListener('DOMContentLoaded', function() {
  var id = function(s) { return document.getElementById(s); };
  var state = 'on';

  // FAQ 折叠
  document.querySelectorAll('.fq').forEach(function(el) {
    el.addEventListener('click', function() {
      el.parentElement.classList.toggle('open');
    });
  });

  function resetCards() {
    document.querySelectorAll('.dc').forEach(function(c) {
      c.classList.remove('ad', 'hiding', 'plain');
      c.style.cssText = '';
      if (c.id === 'a1' || c.id === 'a2') c.classList.add('ad');
      var tip = id('agTip');
      if (tip) tip.style.display = 'flex';
    });
  }

  function turnOn() {
    resetCards();
    state = 'on';
    upBtn('bOn');
  }

  function turnOff() {
    resetCards();
    document.querySelectorAll('.dc').forEach(function(c) {
      c.classList.add('plain');
    });
    state = 'off';
    upBtn('bOff');
  }

  function blockAds() {
    resetCards();
    state = 'blocked';
    ['a1', 'a2'].forEach(function(i) {
      var el = id(i);
      if (!el) return;
      el.style.boxShadow = '0 0 0 3px rgba(255,80,80,0.6)';
      setTimeout(function() {
        el.style.boxShadow = '';
        el.classList.add('hiding');
      }, 500);
    });
    setTimeout(function() {
      var tip = id('agTip');
      if (tip) tip.style.animation = 'fadeUp 0.5s ease both';
    }, 1200);
    upBtn('bBlock');
    setTimeout(function() {
      if (state === 'blocked') turnOn();
    }, 3800);
  }

  function upBtn(onId) {
    document.querySelectorAll('.db').forEach(function(b) {
      b.classList.remove('on');
    });
    var btn = id(onId);
    if (btn) btn.classList.add('on');
  }

  function openTab(url) {
    // 优先通过 background 打开
    if (chrome && chrome.runtime && chrome.runtime.id) {
      chrome.runtime.sendMessage({ action: 'openTab', url: url }, function(resp) {
        if (chrome.runtime.lastError) {
          fallback(url);
        }
      });
      return;
    }
    fallback(url);
    function fallback(url) {
      var a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
  }

  function copyMail() {
    var btn = id('btnCopy');
    if (!btn) return;

    // 防止重复触发
    if (btn.classList.contains('copied')) return;

    function done() {
      btn.textContent = '已复制✓';
      btn.classList.add('copied');
      setTimeout(function() {
        btn.textContent = '复制';
        btn.classList.remove('copied');
      }, 1500);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText('tianlu345@163.com').then(done).catch(function() {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      var ta = document.createElement('textarea');
      ta.value = 'tianlu345@163.com';
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      done();
    }
  }

  // 绑定按钮
  var bOn = id('bOn');
  if (bOn) bOn.addEventListener('click', turnOn);

  var bOff = id('bOff');
  if (bOff) bOff.addEventListener('click', turnOff);

  var bBlock = id('bBlock');
  if (bBlock) bBlock.addEventListener('click', blockAds);

  var btnAG = id('btnAG');
  if (btnAG) btnAG.addEventListener('click', function() { openTab('https://adguard.com/'); });

  var g1 = id('g1');
  if (g1) g1.addEventListener('click', function(e) { e.preventDefault(); openTab('https://www.bing.com/'); });

  var bBing = id('bBing');
  if (bBing) bBing.addEventListener('click', function() { openTab('https://www.bing.com/'); });

  var bClose = id('bClose');
  if (bClose) bClose.addEventListener('click', function() {
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'closeTab' });
    }
    window.close();
  });

  var btnCopy = id('btnCopy');
  if (btnCopy) btnCopy.addEventListener('click', copyMail);
});
