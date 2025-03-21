// Name: extendedFourndyUserData.js Ver: 0.1.0
// Made by 4ndy64

const extendedFourndyUserData = (function() {
  let battery = null;

  const isBatteryApiAvailable = () => 'getBattery' in navigator;

  const getBatteryStatus = async () => {
    if (isBatteryApiAvailable()) {
      try {
        battery = await navigator.getBattery();
        return {
          level: battery.level * 100,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
          isBatteryApiAvailable: true
        };
      } catch (error) {
        return { error: "Error fetching battery data" };
      }
    } else {
      return { error: "Battery API is not supported" };
    }
  };

  const getOSInfo = () => {
    const userAgent = navigator.userAgent;
    let os = "Unknown OS";
    let browser = "Unknown Browser";

    if (userAgent.indexOf("Win") !== -1) os = "Windows";
    else if (userAgent.indexOf("Mac") !== -1) os = "macOS";
    else if (userAgent.indexOf("Linux") !== -1) os = "Linux";
    else if (userAgent.indexOf("Android") !== -1) os = "Android";
    else if (userAgent.indexOf("like Mac") !== -1) os = "iOS";

    if (userAgent.indexOf("Chrome") !== -1) browser = "Chrome";
    else if (userAgent.indexOf("Firefox") !== -1) browser = "Firefox";
    else if (userAgent.indexOf("Safari") !== -1) browser = "Safari";
    else if (userAgent.indexOf("Edge") !== -1) browser = "Edge";
    else if (userAgent.indexOf("Opera") !== -1) browser = "Opera";

    return {
      os: os,
      browser: browser,
      userAgent: userAgent
    };
  };

  const isMobileDevice = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const getViewportSize = () => ({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const getMemoryInfo = () => {
    if ('deviceMemory' in navigator) {
      return {
        totalMemory: navigator.deviceMemory + "GB",
        isMemoryApiAvailable: true
      };
    } else {
      return {
        error: "Device memory info not available",
        isMemoryApiAvailable: false
      };
    }
  };

  const search = (query, engine = 'google') => {
    let searchURL = '';
    switch(engine.toLowerCase()) {
      case 'google': searchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`; break;
      case 'bing': searchURL = `https://www.bing.com/search?q=${encodeURIComponent(query)}`; break;
      case 'duckduckgo': searchURL = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`; break;
      case 'yahoo': searchURL = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`; break;
      case 'ask': searchURL = `https://www.ask.com/web?q=${encodeURIComponent(query)}`; break;
      case 'yandex': searchURL = `https://yandex.com/search/?text=${encodeURIComponent(query)}`; break;
      case 'baidu': searchURL = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`; break;
      case 'qwant': searchURL = `https://www.qwant.com/?q=${encodeURIComponent(query)}`; break;
      case 'startpage': searchURL = `https://www.startpage.com/sp/search?q=${encodeURIComponent(query)}`; break;
      default: searchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`; break;
    }
    window.open(searchURL, '_blank');
  };

  const getUserTimezone = () => {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      offset: new Date().getTimezoneOffset()
    };
  };

  const getConnectionInfo = () => {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    } else {
      return { error: "Network Information API is not supported" };
    }
  };

  const getSystemMemoryUsage = () => {
    if (performance.memory) {
      return {
        totalJSHeap: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + "MB",
        usedJSHeap: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + "MB",
        jsHeapLimit: (performance.memory.jsHeapLimit / 1024 / 1024).toFixed(2) + "MB"
      };
    } else {
      return { error: "Memory usage info not available" };
    }
  };

  const isDarkMode = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const getGeoLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        reject("Geolocation is not supported by this browser.");
      }
    });
  };

  const isIncognitoMode = () => {
    return new Promise((resolve, reject) => {
      const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
      if (!fs) {
        resolve(false);
        return;
      }
      fs(window.TEMPORARY, 100, () => resolve(false), () => resolve(true));
    });
  };

  const getAllTabs = () => {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== "undefined" && chrome.tabs) {
        chrome.tabs.query({}, (tabs) => {
          resolve(tabs);
        });
      } else {
        reject("Tabs API is not available in this browser.");
      }
    });
  };

  const getHardwareConcurrency = () => {
    if ('hardwareConcurrency' in navigator) {
      return navigator.hardwareConcurrency;
    } else {
      return { error: "Hardware concurrency information not available" };
    }
  };

  const getLanguageInfo = () => {
    return {
      language: navigator.language || "unknown",
      languages: navigator.languages || []
    };
  };

  const getScreenInfo = () => {
    if (window.screen) {
      return {
        width: screen.width,
        height: screen.height,
        availableWidth: screen.availWidth,
        availableHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth
      };
    } else {
      return { error: "Screen information not available" };
    }
  };

  const getCookiesEnabled = () => {
    return navigator.cookieEnabled;
  };

  const getOnlineStatus = () => {
    return navigator.onLine;
  };

  const getPlugins = () => {
    if (navigator.plugins) {
      const plugins = [];
      for (let i = 0; i < navigator.plugins.length; i++) {
        plugins.push(navigator.plugins[i].name);
      }
      return plugins;
    } else {
      return { error: "Plugins information not available" };
    }
  };

  const getLocalStorageUsage = () => {
    if (window.localStorage) {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const item = localStorage.getItem(key);
          if (item) {
            total += item.length;
          }
        }
      }
      
      return (total / 1024).toFixed(2) + "KB";
    } else {
      return { error: "localStorage is not supported" };
    }
  };

  const getAllData = async () => {
    const batteryStatus = await getBatteryStatus();
    const osInfo = getOSInfo();
    const memoryInfo = getMemoryInfo();
    const viewportSize = getViewportSize();
    const systemMemoryUsage = getSystemMemoryUsage();
    const connectionInfo = getConnectionInfo();
    const timezone = getUserTimezone();
    const darkMode = isDarkMode();
    const geoLocation = await getGeoLocation().catch(() => null);
    const incognito = await isIncognitoMode();
    const tabs = await getAllTabs().catch(() => []);
    
    return {
      OS: osInfo.os,
      Browser: osInfo.browser,
      UserAgent: osInfo.userAgent,
      Battery: batteryStatus,
      Memory: memoryInfo,
      Viewport: viewportSize,
      SystemMemory: systemMemoryUsage,
      Connection: connectionInfo,
      Timezone: timezone,
      DarkMode: darkMode,
      Location: geoLocation,
      Incognito: incognito,
      IsMobile: isMobileDevice(),
      TabsOpen: tabs,
      HardwareConcurrency: getHardwareConcurrency(),
      Language: getLanguageInfo(),
      Screen: getScreenInfo(),
      CookiesEnabled: getCookiesEnabled(),
      Online: getOnlineStatus(),
      Plugins: getPlugins(),
      LocalStorageUsage: getLocalStorageUsage()
    };
  };

  return {
    getBatteryStatus,
    getOSInfo,
    isMobileDevice,
    getViewportSize,
    getMemoryInfo,
    search,
    getUserTimezone,
    getConnectionInfo,
    getSystemMemoryUsage,
    isDarkMode,
    getGeoLocation,
    isIncognitoMode,
    getAllTabs,
    getHardwareConcurrency,
    getLanguageInfo,
    getScreenInfo,
    getCookiesEnabled,
    getOnlineStatus,
    getPlugins,
    getLocalStorageUsage,
    getAllData
  };
})();
