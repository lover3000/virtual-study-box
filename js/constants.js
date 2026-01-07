export const CAT_STATE = {
    sleeping: { img: "assets/gifs/Sleep.gif", text: "Zzz... Sen ơi cố lên Zzz..." },
    hungry:   { img: "assets/gifs/Hungry.gif", text: "Đói quá Sen ơi..." },
    eating:   { img: "assets/gifs/Eating.gif", text: "Măm măm..." },
    laptop:   { img: "assets/gifs/Laptop.gif", text: "Học bài, làm việc nuôi tao đi Sen..." }
};

export const MOTIVATION_QUOTES = [
    { quote: "Khởi động 📣", timeGreater: 20},
    { quote: "Tập trung 📈", timeGreater: 10},
    { quote: "Sắp xong rồi 💪", timeGreater: 0}
];

export const MODES = {
    WORK: 'WORK_MODE',       
    BREAK: 'BREAK_MODE',    
    DONE: 'DONE_MODE'        
};

export const CONFIG = {
    WORK_MINUTES: 25,  
    BREAK_MINUTES: 5,  
    ALARM_SOUND: "https://cdn.pixabay.com/audio/2021/08/04/audio_bb630cc098.mp3",
    DEFAULT_YOUTUBE_URL: "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1"
};
