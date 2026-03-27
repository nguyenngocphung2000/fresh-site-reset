function getRegistrableDomain(hostname) {
  const parts = hostname.split(".").filter(Boolean);

  if (parts.length <= 2) {
    return hostname;
  }

  return parts.slice(-2).join(".");
}

async function removeCookiesForDomain(hostname) {
  const cookies = await chrome.cookies.getAll({ domain: hostname });

  await Promise.all(
    cookies.map(async (cookie) => {
      const protocol = cookie.secure ? "https://" : "http://";
      const domain = cookie.domain.startsWith(".")
        ? cookie.domain.substring(1)
        : cookie.domain;
      const url = `${protocol}${domain}${cookie.path}`;

      return chrome.cookies.remove({
        url,
        name: cookie.name,
        storeId: cookie.storeId
      });
    })
  );
}

async function clearDomainHistory(hostname) {
  const originsToTry = [
    `https://${hostname}/*`,
    `http://${hostname}/*`,
    `https://*.${hostname}/*`,
    `http://*.${hostname}/*`
  ];

  for (const url of originsToTry) {
    try {
      await chrome.history.deleteUrl({ url });
    } catch (error) {
      // deleteUrl chỉ hỗ trợ URL cụ thể; sẽ bỏ qua ở đây và dùng search bên dưới.
    }
  }

  const startTime = 0;
  const endTime = Date.now();
  const historyItems = await chrome.history.search({
    text: hostname,
    startTime,
    endTime,
    maxResults: 10000
  });

  const matchingItems = historyItems.filter((item) => {
    try {
      const itemUrl = new URL(item.url);
      return (
        itemUrl.hostname === hostname ||
        itemUrl.hostname.endsWith(`.${hostname}`)
      );
    } catch (error) {
      return false;
    }
  });

  await Promise.all(
    matchingItems.map((item) =>
      chrome.history.deleteUrl({
        url: item.url
      })
    )
  );
}

async function clearSiteStorageAndCache(origin) {
  await chrome.browsingData.remove(
    {
      origins: [origin]
    },
    {
      appcache: true,
      cache: true,
      cacheStorage: true,
      cookies: true,
      fileSystems: true,
      indexedDB: true,
      localStorage: true,
      serviceWorkers: true,
      webSQL: true
    }
  );
}

async function clearSessionStorageViaTab(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      try {
        window.localStorage.clear();
      } catch (error) {
        // bỏ qua
      }

      try {
        window.sessionStorage.clear();
      } catch (error) {
        // bỏ qua
      }
    }
  });
}

async function clearActiveSiteData(tabId, pageUrl) {
  const parsedUrl = new URL(pageUrl);
  const hostname = parsedUrl.hostname;
  const origin = parsedUrl.origin;
  const registrableDomain = getRegistrableDomain(hostname);

  await clearSiteStorageAndCache(origin);
  await clearSessionStorageViaTab(tabId);
  await removeCookiesForDomain(hostname);

  if (registrableDomain !== hostname) {
    await removeCookiesForDomain(registrableDomain);
  }

  await clearDomainHistory(hostname);
  await chrome.tabs.reload(tabId, { bypassCache: true });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "CLEAR_ACTIVE_SITE_DATA") {
    return false;
  }

  clearActiveSiteData(message.tabId, message.url)
    .then(() => {
      sendResponse({ success: true });
    })
    .catch((error) => {
      sendResponse({
        success: false,
        error: error.message || "Đã xảy ra lỗi khi dọn dữ liệu trang."
      });
    });

  return true;
});
