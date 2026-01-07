import * as Constants from "./constants.js";
export const testNotification = () => {
  // 1. Phát âm thanh ngay lập tức
  Constants.alarmSound.currentTime = 0;
  Constants.alarmSound
    .play()
    .catch((e) => alert("Lỗi loa: Trình duyệt đang chặn tự phát âm thanh."));

  // 2. Xử lý thông báo
  if (!("Notification" in window)) {
    alert("Trình duyệt này không hỗ trợ thông báo Desktop.");
    return;
  }

  if (Notification.permission === "granted") {
    // Đã có quyền -> Bắn thông báo luôn
    new Notification("Thông báo hoạt động tốt!", {
      body: "Âm thanh và thông báo đều ổn nha sen!",
      icon: Constants.CAT_STATE.hungry.img,
    });
  } else if (Notification.permission !== "denied") {
    // Chưa có quyền -> Hiện popup xin quyền
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("Đã cấp quyền thành công!", {
          body: "Từ giờ mèo sẽ gọi bạn khi đói!",
          icon: Constants.CAT_STATE.hungry.img,
        });
      } else {
        alert(
          "Bạn đã từ chối thông báo. Hãy vào cài đặt trình duyệt để bật lại nhé."
        );
      }
    });
  } else {
    // Đã bị chặn trước đó
    alert(
      "Bạn đã chặn thông báo trước đây. Hãy mở khóa trong icon ổ khóa trên thanh địa chỉ."
    );
  }
};