// popup.js — LiquidSearch 设置弹窗逻辑

document.addEventListener('DOMContentLoaded', () => {
  const defaults = {
    removeAds: true,
    cardStyle: true,
    animations: true,
    theme: 'white',
    fontSize: 'normal',
    themeColor: 'default',    // 'default'|'mint'|'sakura'|'amber'|'sky'
    beautificationEnabled: true,
  };

  const beautifyBtn  = document.getElementById('beautifyBtn');
  const bModal      = document.getElementById('beautifyModal');
  const bCancel     = document.getElementById('beautifyCancel');
  const bConfirm    = document.getElementById('beautifyConfirm');

  // 颜色按钮
  const colorBtns = document.querySelectorAll('.color-btn');
  function updateColorBtns(color) {
    colorBtns.forEach(b => b.classList.toggle('active', b.dataset.color === color));
  }

  // 读取设置并初始化 UI
  chrome.storage.sync.get(defaults, (settings) => {
    document.getElementById('toggleAds').checked  = settings.removeAds;
    document.getElementById('toggleCard').checked  = settings.cardStyle;
    document.getElementById('toggleAnim').checked  = settings.animations;
    document.getElementById('toggleDark').checked = settings.theme === 'dark';

    document.querySelectorAll('.font-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.font === settings.fontSize);
    });

    // 初始化主题色按钮
    updateColorBtns(settings.themeColor || 'default');

    // 初始化美化按钮文字
    updateBeautifyBtn(settings.beautificationEnabled !== false);

  });

  // 更新美化按钮状态
  function updateBeautifyBtn(isEnabled) {
    if (isEnabled) {
      beautifyBtn.textContent = '退出美化';
      beautifyBtn.classList.remove('disabled');
    } else {
      beautifyBtn.textContent = '开启美化';
      beautifyBtn.classList.add('disabled');
    }
  }

  // ========== 退出/开启美化 按钮 ==========
  beautifyBtn.addEventListener('click', () => {
    chrome.storage.sync.get({ beautificationEnabled: true }, (s) => {
      if (s.beautificationEnabled !== false) {
        bModal.classList.add('show');
      } else {
        chrome.storage.sync.get(defaults, (all) => {
          all.beautificationEnabled = true;
          chrome.storage.sync.set(all, () => {
            document.getElementById('toggleAds').checked  = all.removeAds;
            document.getElementById('toggleCard').checked  = all.cardStyle;
            document.getElementById('toggleAnim').checked  = all.animations;
            document.getElementById('toggleDark').checked = all.theme === 'dark';
            document.querySelectorAll('.font-btn').forEach(b =>
              b.classList.toggle('active', b.dataset.font === all.fontSize));
            updateColorBtns(all.themeColor || 'default');
            updateBeautifyBtn(true);
            notifyContentScript();
          });
        });
      }
    });
  });

  // 退出美化 → 取消
  bCancel.addEventListener('click', () => {
    bModal.classList.remove('show');
  });

  // 退出美化 → 确定
  bConfirm.addEventListener('click', () => {
    bModal.classList.remove('show');
    chrome.storage.sync.set({ beautificationEnabled: false }, () => {
      document.getElementById('toggleAds').checked  = false;
      document.getElementById('toggleCard').checked  = false;
      document.getElementById('toggleAnim').checked  = false;
      document.getElementById('toggleDark').checked = false;
      updateBeautifyBtn(false);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'DISABLE_BEAUTIFICATION' });
        }
      });
    });
  });

  // ========== 通用开关：保持 beautificationEnabled 当前状态 ==========
  function onToggle(id, key) {
    const el = document.getElementById(id);
    el.addEventListener('change', () => {
      const val = el.checked;
      chrome.storage.sync.get({ beautificationEnabled: true }, (s) => {
        chrome.storage.sync.set({ [key]: val, beautificationEnabled: s.beautificationEnabled }, () => {
          notifyContentScript();
        });
      });
    });
  }
  onToggle('toggleAds', 'removeAds');
  onToggle('toggleCard', 'cardStyle');
  onToggle('toggleAnim', 'animations');

  // ========== 深色模式开关 ==========
  const darkToggle = document.getElementById('toggleDark');
  const dModal    = document.getElementById('darkModal');
  const dCancel   = document.getElementById('darkCancel');
  const dConfirm  = document.getElementById('darkConfirm');

  darkToggle.addEventListener('change', () => {
    if (darkToggle.checked) {
      darkToggle.checked = false;
      dModal.classList.add('show');
    } else {
      chrome.storage.sync.get({ beautificationEnabled: true }, (s) => {
        chrome.storage.sync.set({ theme: 'white', beautificationEnabled: s.beautificationEnabled }, () => {
          notifyContentScript();
        });
      });
    }
  });
  dCancel.addEventListener('click', () => { dModal.classList.remove('show'); });
  dConfirm.addEventListener('click', () => {
    dModal.classList.remove('show');
    darkToggle.checked = true;
    chrome.storage.sync.get({ beautificationEnabled: true }, (s) => {
      chrome.storage.sync.set({ theme: 'dark', beautificationEnabled: s.beautificationEnabled }, () => {
        notifyContentScript();
      });
    });
  });

  // ========== 字体按钮 ==========
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chrome.storage.sync.get({ beautificationEnabled: true }, (s) => {
        chrome.storage.sync.set({
          fontSize: btn.dataset.font,
          beautificationEnabled: s.beautificationEnabled,
        }, () => {
          notifyContentScript();
        });
      });
    });
  });

  // ========== 主题色按钮 ==========
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      updateColorBtns(btn.dataset.color);
      chrome.storage.sync.get({ beautificationEnabled: true }, (s) => {
        chrome.storage.sync.set({
          themeColor: btn.dataset.color,
          beautificationEnabled: s.beautificationEnabled,
        }, () => {
          notifyContentScript();
        });
      });
    });
  });

  // ========== 恢复默认 ==========
  document.getElementById('resetBtn').addEventListener('click', () => {
    chrome.storage.sync.set(defaults, () => {
      document.getElementById('toggleAds').checked  = defaults.removeAds;
      document.getElementById('toggleCard').checked  = defaults.cardStyle;
      document.getElementById('toggleAnim').checked  = defaults.animations;
      document.getElementById('toggleDark').checked = false;
      document.querySelectorAll('.font-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.font === defaults.fontSize));
      updateColorBtns(defaults.themeColor);
      updateBeautifyBtn(true);
      notifyContentScript();
    });
  });

  // 通知 content script
  function notifyContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SETTINGS_UPDATED' });
      }
    });
  }
});
