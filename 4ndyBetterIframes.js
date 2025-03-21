// Name: 4ndyBetterIframes.js Ver: 1.1.0
// Made by 4ndy64
(() => {
  const _4ndyBetterIframes = {
    VERSION: '1.1.0',
    _tabs: {},
    _container: null,
    _tabHeaderBar: null,
    _tabContentArea: null,

    _functions: {
      initContainer: (containerSelector) => {
        _4ndyBetterIframes._container = containerSelector ? document.querySelector(containerSelector) : document.body;
        if (!_4ndyBetterIframes._container.querySelector('.iframe-tab-headers')) {
          _4ndyBetterIframes._tabHeaderBar = document.createElement('div');
          _4ndyBetterIframes._tabHeaderBar.className = 'iframe-tab-headers';
          _4ndyBetterIframes._tabHeaderBar.style.display = 'flex';
          _4ndyBetterIframes._tabHeaderBar.style.borderBottom = '1px solid #ccc';
          _4ndyBetterIframes._container.appendChild(_4ndyBetterIframes._tabHeaderBar);
        } else {
          _4ndyBetterIframes._tabHeaderBar = _4ndyBetterIframes._container.querySelector('.iframe-tab-headers');
        }
        if (!_4ndyBetterIframes._container.querySelector('.iframe-tab-content')) {
          _4ndyBetterIframes._tabContentArea = document.createElement('div');
          _4ndyBetterIframes._tabContentArea.className = 'iframe-tab-content';
          _4ndyBetterIframes._container.appendChild(_4ndyBetterIframes._tabContentArea);
        } else {
          _4ndyBetterIframes._tabContentArea = _4ndyBetterIframes._container.querySelector('.iframe-tab-content');
        }
      },

      createTab: (id, src, options = {}) => {
        if (_4ndyBetterIframes._tabs[id] || document.getElementById(id)) {
          console.error(`Tab with id "${id}" already exists.`);
          return null;
        }
        if (!_4ndyBetterIframes._container) {
          _4ndyBetterIframes._functions.initContainer(options.container);
        }

        const iframeType = options.type || "basic_iframe";
        const iframeElement = _4ndyBetterIframes._functions.createIframeByType(iframeType, id, src, options);

        const tabHeader = document.createElement('div');
        tabHeader.className = 'iframe-tab-header';
        tabHeader.style.padding = '8px 12px';
        tabHeader.style.cursor = 'pointer';
        tabHeader.style.position = 'relative';
        tabHeader.style.borderRight = '1px solid #ccc';
        tabHeader.innerText = options.title || id;
        const closeBtn = document.createElement('span');
        closeBtn.innerText = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.right = '4px';
        closeBtn.style.top = '2px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.padding = '0 4px';
        closeBtn.onclick = (e) => {
          e.stopPropagation();
          _4ndyBetterIframes._functions.removeTab(id);
        };
        tabHeader.appendChild(closeBtn);
        tabHeader.onclick = () => _4ndyBetterIframes._functions.activateTab(id);
        _4ndyBetterIframes._tabHeaderBar.appendChild(tabHeader);
        
        _4ndyBetterIframes._tabs[id] = { header: tabHeader, iframe: iframeElement };
        _4ndyBetterIframes._functions.activateTab(id);
        return { header: tabHeader, iframe: iframeElement };
      },

      createIframeByType: (type, id, src, options) => {
        let iframe = document.createElement('iframe');
        iframe.id = id;
        iframe.src = src;
        iframe.style.display = 'none'; 
        iframe = _4ndyBetterIframes._functions.applyIframeType(type, iframe, options);
        _4ndyBetterIframes._tabContentArea.appendChild(iframe);
        return iframe;
      },

      applyIframeType: (type, iframe, options) => {
        switch(type) {
          case 'basic_iframe':
            iframe.style.border = options.border || "none";
            iframe.style.width = options.width || "100%";
            iframe.style.height = options.height || "500px";
            break;
          case 'responsive_iframe':
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.maxWidth = options.maxWidth || "100%";
            iframe.style.maxHeight = options.maxHeight || "100%";
            iframe.style.aspectRatio = options.aspectRatio || "16:9";
            break;
          case 'fullscreen_iframe':
            iframe.style.width = "100%";
            iframe.style.height = "100vh"; 
            iframe.style.border = "none";
            iframe.style.position = "absolute";
            iframe.style.top = "0";
            iframe.style.left = "0";
            iframe.classList.add('fullscreen');
            break;
          case 'scrollable_iframe':
            iframe.style.overflow = 'auto';
            iframe.style.maxHeight = options.maxHeight || '500px';
            break;
          case 'popup_iframe':
            iframe.style.position = 'fixed';
            iframe.style.top = '50%';
            iframe.style.left = '50%';
            iframe.style.transform = 'translate(-50%, -50%)';
            iframe.style.zIndex = 1000;
            iframe.style.border = options.border || '1px solid #ccc';
            iframe.style.boxShadow = options.boxShadow || '0px 4px 6px rgba(0, 0, 0, 0.1)';
            break;
          case 'lazyload_iframe':
            iframe.loading = 'lazy';
            iframe.style.border = options.border || 'none';
            break;
          case 'borderless_iframe':
            iframe.style.border = 'none';
            break;
          case 'custom_style_iframe':
            iframe.style.cssText = options.customCSS || '';
            break;
          case 'iframe_with_audio':
            iframe.style.border = 'none';
            iframe.style.width = options.width || '100%';
            iframe.style.height = options.height || '300px';
            iframe.src = options.audioSrc || src;
            break;
          case 'iframe_with_video':
            iframe.style.border = 'none';
            iframe.style.width = options.width || '100%';
            iframe.style.height = options.height || '400px';
            iframe.src = options.videoSrc || src;
            break;
          case 'iframe_with_tabs':
            iframe.style.border = 'none';
            iframe.style.width = options.width || '100%';
            iframe.style.height = options.height || '500px';
            break;
          case 'iframe_with_shadow':
            iframe.style.boxShadow = options.boxShadow || '0px 4px 6px rgba(0, 0, 0, 0.1)';
            break;
          case 'iframe_with_border_animation':
            iframe.style.border = '2px solid transparent';
            iframe.style.transition = 'border-color 0.5s';
            iframe.addEventListener('mouseenter', () => iframe.style.borderColor = 'blue');
            iframe.addEventListener('mouseleave', () => iframe.style.borderColor = 'transparent');
            break;
          case 'iframe_with_draggable':
            iframe.style.position = 'absolute';
            iframe.draggable = true;
            iframe.addEventListener('dragstart', (event) => {
              event.dataTransfer.setData("text/plain", iframe.id);
            });
            break;
          default:
            console.error(`Unknown iframe type: ${type}`);
        }
        return iframe;
      },

      removeTab: (id) => {
        const tab = _4ndyBetterIframes._tabs[id] || document.getElementById(id);
        if (tab) {
          if (_4ndyBetterIframes._tabs[id]) {
            if (_4ndyBetterIframes._tabs[id].header.parentNode) _4ndyBetterIframes._tabs[id].header.parentNode.removeChild(_4ndyBetterIframes._tabs[id].header);
            if (_4ndyBetterIframes._tabs[id].iframe.parentNode) _4ndyBetterIframes._tabs[id].iframe.parentNode.removeChild(_4ndyBetterIframes._tabs[id].iframe);
            delete _4ndyBetterIframes._tabs[id];
          } else {
            const iframe = document.getElementById(id);
            if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
          }
          const remainingIds = Object.keys(_4ndyBetterIframes._tabs);
          if (remainingIds.length > 0) {
            _4ndyBetterIframes._functions.activateTab(remainingIds[0]);
          }
          return true;
        }
        console.error(`Tab with id "${id}" not found.`);
        return false;
      },

      activateTab: (id) => {
        Object.keys(_4ndyBetterIframes._tabs).forEach(tabId => {
          _4ndyBetterIframes._tabs[tabId].header.style.backgroundColor = '';
          _4ndyBetterIframes._tabs[tabId].iframe.style.display = 'none';
        });
        if (_4ndyBetterIframes._tabs[id]) {
          _4ndyBetterIframes._tabs[id].header.style.backgroundColor = '#ddd';
          _4ndyBetterIframes._tabs[id].iframe.style.display = 'block';
        }
      },

      resizeTab: (id, width, height) => {
        const tab = _4ndyBetterIframes._tabs[id];
        if (tab && tab.iframe) {
          if (width) tab.iframe.style.width = width;
          if (height) tab.iframe.style.height = height;
          return true;
        }
        console.error(`Tab with id "${id}" not found.`);
        return false;
      },

      sendMessageToTab: (id, message, targetOrigin = "*") => {
        const tab = _4ndyBetterIframes._tabs[id];
        if (tab && tab.iframe && tab.iframe.contentWindow) {
          tab.iframe.contentWindow.postMessage(message, targetOrigin);
          return true;
        }
        console.error(`Tab with id "${id}" not found or invalid contentWindow.`);
        return false;
      },

      listenToTabMessages: (callback) => {
        if (typeof callback !== "function") {
          console.error("Callback must be a function.");
          return;
        }
        window.addEventListener("message", (event) => {
          callback(event);
        });
      },

      getTab: (id) => {
        return _4ndyBetterIframes._tabs[id] || null;
      }
    }
  };

  window._4ndyBetterIframes = _4ndyBetterIframes;
})();
