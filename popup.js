const refreshButton = document.getElementById("refreshSiteButton");
const statusElement = document.getElementById("status");

function setStatus(message, type = "default") {
  statusElement.textContent = message;
  statusElement.className = "status";

  if (type === "success") {
    statusElement.classList.add("is-success");
  }

  if (type === "error") {
    statusElement.classList.add("is-error");
  }
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return tabs[0];
}

refreshButton.addEventListener("click", async () => {
  refreshButton.disabled = true;
  setStatus("Đang phân tích tab hiện tại và dọn dữ liệu website...");

  try {
    const activeTab = await getActiveTab();

    if (!activeTab || !activeTab.id || !activeTab.url) {
      throw new Error("Không tìm thấy tab đang hoạt động.");
    }

    const url = new URL(activeTab.url);

    if (!/^https?:$/.test(url.protocol)) {
      throw new Error("Chỉ hỗ trợ các trang web dùng giao thức http hoặc https.");
    }

    const response = await chrome.runtime.sendMessage({
      type: "CLEAR_ACTIVE_SITE_DATA",
      tabId: activeTab.id,
      url: activeTab.url
    });

    if (!response?.success) {
      throw new Error(response?.error || "Không thể xóa dữ liệu của website hiện tại.");
    }

    setStatus("Đã hoàn tất. Trang đang được tải lại...", "success");
    window.close();
  } catch (error) {
    setStatus(error.message || "Đã xảy ra lỗi không xác định.", "error");
    refreshButton.disabled = false;
  }
});
