let questions = [];
let answers = new Array(30).fill(null);
let current = 0;
let timeLeft = 1200;
let timer;

function startExam() {
    // Logic xáo trộn 101 câu từ data.js và lấy 30 câu
    questions = [...fullBank].sort(() => 0.5 - Math.random()).slice(0, 30);
    // ... Các hàm renderQ, renderGrid, submitTest ...
}

// Các hàm xử lý hiển thị giải thích, tính giờ, chuyển câu...
