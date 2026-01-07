import * as Constants from "./constants.js";
import * as NotificationHelper from "./notification.js";

let timeLeft = Constants.CONFIG.WORK_MINUTES * 60;
let timerInterval = null;
let isCountingDown = false;
let currentMode = Constants.MODES.WORK;
let feedCount = 0;

// DOM Elements
const timerDisplay = document.getElementById("timer");
const petImg = document.getElementById("pet-image");
const petTxt = document.getElementById("pet-speech");
const btnMain = document.getElementById("btn-main");
const btnFeed = document.getElementById("btn-feed");
const feedCountDisplay = document.getElementById("fish-count");
const alarmSound = new Audio(Constants.CONFIG.ALARM_SOUND);

function init() {
  resetWork();
  document.getElementById("yt-player").src = Constants.CONFIG.DEFAULT_YOUTUBE_URL;
}

function setPet(state) {
  if (petImg.src !== state.img) {
    petImg.src = state.img;
    petTxt.innerText = state.text;
  }
}

window.toggleTimer = function () {
  if (currentMode === Constants.MODES.DONE) {
    resetWork();
    return;
  }
  if (isCountingDown) {
    // Đang chạy mà bấm -> Tạm dừng
    clearInterval(timerInterval);
    isCountingDown = false;
    btnMain.innerText = "Tiếp tục";
    btnMain.classList.remove("btn-toggle");
  } else {
    if (currentMode === Constants.MODES.WORK) {
      setPet(Constants.CAT_STATE.sleeping);
    }
    // (Nếu đang là BREAK mà pause xong chạy lại thì vẫn giữ là eating, không cần set lại)

    startCountdown();
    btnMain.innerText = "Tạm dừng";
    btnMain.classList.add("btn-toggle");
  }
};

function startCountdown() {
  // Xin quyền notification
  if ("Notification" in window && Notification.permission === "default")
    Notification.requestPermission();

  isCountingDown = true;
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      clearInterval(timerInterval);
      isCountingDown = false;
      alarmSound.play().catch((e) => console.log(e));
      if (currentMode === Constants.MODES.WORK) finishWork();
      else if (currentMode === Constants.MODES.BREAK) finishBreak();
    }
  }, 1000);
}

function finishWork() {
  setPet(Constants.CAT_STATE.hungry);
  petImg.classList.add("shaking");
  btnMain.style.display = "none";
  btnFeed.style.display = "inline-block";

  if (Notification.permission === "granted") {
    new Notification("Tao đóiiiiii", {
      body: "Cho tao ăn đi Sen ơi!",
      icon: Constants.CAT_STATE.hungry.img,
    });
  }
}

window.startBreak = function () {
  feedCount++;
  feedCountDisplay.innerText = feedCount;

  alarmSound.pause();
  alarmSound.currentTime = 0;
  petImg.classList.remove("shaking");
  currentMode = Constants.MODES.BREAK;
  timeLeft = Constants.CONFIG.BREAK_MINUTES * 60;

  setPet(Constants.CAT_STATE.eating);
  btnFeed.style.display = "none";
  startCountdown();
};

function finishBreak() {
  currentMode = Constants.MODES.DONE;
  setPet(Constants.CAT_STATE.laptop);
  btnMain.innerText = "Bắt đầu";
  btnMain.style.background = "#4ecdc4";
  btnMain.style.color = "white";
  if (Notification.permission === "granted")
    new Notification("No rồi!", {
      body: "Nghỉ ngơi xong rồi, quay lại học tập, làm việc thôi!",
      icon: Constants.CAT_STATE.laptop.img,
    });
}

window.resetWork = resetWork;
function resetWork() {
  alarmSound.pause();
  alarmSound.currentTime = 0;
  currentMode = Constants.MODES.WORK;
  isCountingDown = false;
  clearInterval(timerInterval);
  timeLeft = Constants.CONFIG.WORK_MINUTES * 60;
  setPet(Constants.CAT_STATE.laptop);
  btnMain.innerText = "Bắt đầu";
  btnMain.classList.remove("btn-toggle");
  updateDisplay();
}

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  timerDisplay.innerText = timeString;

  if (currentMode === Constants.MODES.WORK) {
    if (isCountingDown) {
      const activeConfig = Constants.MOTIVATION_QUOTES.find(
        (item) => minutes >= item.timeGreater
      );
      // Backup
      const quote = activeConfig ? activeConfig.quote : "Cố lên!";

      document.title = `${timeString} - ${quote}`;
    } else {
      document.title = `🛑 Hãy bắt đầu - ${timeString}`;
    }
  } else if (currentMode === Constants.MODES.BREAK) {
    document.title = `☕ ${timeString} - Nghỉ ngơi`;
  } else if (currentMode === Constants.MODES.DONE) {
    document.title = `❤️ Tiếp tục nào - ${timeString}`;
  }
}

// --- TÍNH NĂNG MỚI: XỬ LÝ LINK PLAYLIST THÔNG MINH ---
// --- TÍNH NĂNG XỬ LÝ LINK & SEARCH ---
window.smartLoad = function () {
  const input = document.getElementById("inputUrl").value.trim();
  
  // 1. TỪ KHÓA CÓ SẴN (PRESETS)
  // Nếu gõ các từ khóa này thì load ngay, không cần phân tích URL
  const presets = {
    lofi: Constants.CONFIG.DEFAULT_VIDEO_ID || "jfKfPfyJRdk", // Lofi Girl
    piano: "5qap5aO4i9A", // Beautiful Relaxing Music
    rain: "mPZkdNFkNps",  // Rain Sound
    cafe: "vBdfY2oU5i0"   // Coffee Shop Ambience
  };

  if (presets[input.toLowerCase()]) { // toLowerCase để gõ LoFi hay lofi đều được
    changeEmbedUrl(
      `https://www.youtube.com/embed/${presets[input.toLowerCase()]}?autoplay=1`
    );
    return;
  }

  // 2. PHÂN TÍCH URL
  try {
    // Dùng đối tượng URL của JS (Chuẩn xác hơn Regex)
    const urlObj = new URL(input);

    // Lấy tham số v (video id) và list (playlist id)
    let videoId = urlObj.searchParams.get("v");
    let listId = urlObj.searchParams.get("list"); 

    // --- FIX LỖI PLAYLIST MIX (RD) ---
    // Nếu là danh sách Mix động (bắt đầu bằng RD), bỏ qua list để tránh lỗi
    if (listId && listId.startsWith("RD")) {
        console.log("Phát hiện YouTube Mix, chuyển sang chế độ phát video đơn.");
        listId = null; 
    }
    // ---------------------------------

    // XỬ LÝ CÁC TRƯỜNG HỢP URL
    if (listId && !videoId) {
      // TH1: Chỉ có Playlist (Ví dụ: youtube.com/playlist?list=...)
      changeEmbedUrl(
        `https://www.youtube.com/embed?listType=playlist&list=${listId}&autoplay=1`
      );
    } else if (listId && videoId) {
      // TH2: Video nằm trong Playlist -> Chạy video đó + list bên dưới
      changeEmbedUrl(
        `https://www.youtube.com/embed/${videoId}?list=${listId}&autoplay=1`
      );
    } else if (videoId) {
      // TH3: Video lẻ thông thường (Hoặc video Mix đã bị lọc list ở trên)
      changeEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
      console.log("hello")
    } else if (urlObj.hostname === "youtu.be") {
      // TH4: Link rút gọn (youtu.be/ID) -> Lấy ID từ pathname
      // pathname sẽ là "/ID", dùng slice(1) để bỏ dấu "/"
      const id = urlObj.pathname.slice(1);
      changeEmbedUrl(`https://www.youtube.com/embed/${id}?autoplay=1`);
    } else {
      // URL hợp lệ nhưng không phải Youtube
      alert("Link này không phải là link Youtube!");
    }

  } catch (e) {
    // 3. FALLBACK: NẾU NHẬP URL BỊ LỖI HOẶC KHÔNG PHẢI URL CHUẨN
    // Thử tìm ID bằng Regex cũ (phòng trường hợp copy thiếu https://)
    const match = input.match(
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    );
    if (match && match[2].length == 11) {
      changeEmbedUrl(`https://www.youtube.com/embed/${match[2]}?autoplay=1`);
    } else {
      alert("Không nhận diện được link. Hãy dán link Youtube đầy đủ hoặc gõ: lofi, rain, piano.");
    }
  }
};

window.handleEnter = function (e) {
  if (e.key === "Enter") smartLoad();
};

// Hàm đổi link iframe chung
function changeEmbedUrl(src) {
    // Thêm origin để xác thực với YouTube (giúp giảm tỷ lệ bị chặn)
    const url = new URL(src);
    url.searchParams.set("origin", window.location.origin);
    
    document.getElementById("yt-player").src = url.toString();
}

window.testNotification = NotificationHelper.testNotification;

init();
