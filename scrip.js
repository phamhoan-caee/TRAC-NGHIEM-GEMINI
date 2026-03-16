// 1. Cấu hình
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwxGySySYeE0wsg-41K5lTQUYgL_beTxmCGagDfwQO1AUxLs_l8K4iGMgz-jKE9sxc/exec";

let allQuestions = [];
let selectedQuestions = [];
let userAnswers = {}; // Lưu trữ đáp án chọn
let currentIdx = 0;   // Câu hỏi hiện tại
let timeLeft = 1200; 
let timerInterval;

// 2. Hàm bắt đầu thi
async function startQuiz() {
    const name = document.getElementById('studentName').value.trim();
    const id = document.getElementById('studentID').value.trim();

    if (!name || !id) {
        alert("Thầy nhắc học viên nhập đủ Họ tên và Mã số nhé!");
        return;
    }

    document.getElementById('start-screen').innerHTML = `
        <div class="card-body text-center">
            <div class="spinner-border text-primary"></div>
            <p class="mt-2">Đang lấy đề thi từ hệ thống CAEE...</p>
        </div>`;

    try {
        const response = await fetch(WEB_APP_URL);
        allQuestions = await response.json();
        selectedQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 30);

        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('quiz-screen').style.display = 'block';

        showQuestion(0); // Bắt đầu từ câu 1
        startTimer();
    } catch (error) {
        alert("Lỗi kết nối hệ thống!");
        location.reload();
    }
}

// 3. Hàm hiển thị TỪNG câu hỏi (Quan trọng nhất để không tự nhảy)
function showQuestion(index) {
    currentIdx = index;
    const q = selectedQuestions[index];
    const container = document.getElementById('quiz-content');
    
    const imageHtml = q["HINHANH"] ? `<div class="text-center mb-3"><img src="${q["HINHANH"]}" class="img-fluid rounded border shadow-sm" style="max-height:250px;"></div>` : "";
    
    // Giữ trạng thái đã chọn khi quay lại câu cũ
    const checkStatus = (opt) => userAnswers[index] === opt ? "checked" : "";

    container.innerHTML = `
        <div class="question-page p-3 bg-white rounded shadow-sm fade-in">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge bg-primary px-3 py-2">Câu hỏi ${index + 1} / 30</span>
                <span class="text-muted small">CAEE-2026</span>
            </div>
            
            <h5 class="mb-4 text-dark font-weight-bold">${q["Nội dung câu hỏi"]}</h5>
            ${imageHtml}
            
            <div class="options-list mt-3">
                ${['A', 'B', 'C', 'D'].map(opt => `
                    <div class="form-check mb-3 p-2 border rounded hover-shadow ${userAnswers[index] === opt ? 'bg-light border-primary' : ''}">
                        <input class="form-check-input ms-1" type="radio" name="quizOption" id="opt${opt}" value="${opt}" 
                            ${checkStatus(opt)} onchange="saveAnswerOnly(${index}, '${opt}')">
                        <label class="form-check-label w-100 ps-4 cursor-pointer" for="opt${opt}">
                            <strong>${opt}.</strong> ${q["Đáp án " + opt]}
                        </label>
                    </div>
                `).join('')}
            </div>

            <div class="navigation-btns d-flex justify-content-between mt-5">
                <button class="btn btn-outline-secondary px-4" onclick="prevQuestion()" ${index === 0 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-left"></i> Câu trước
                </button>
                
                ${index === 29 ? 
                    `<button class="btn btn-success px-4" onclick="confirmSubmit()">Nộp bài</button>` : 
                    `<button class="btn btn-primary px-4" onclick="nextQuestion()">Câu tiếp theo <i class="fas fa-arrow-right"></i></button>`
                }
            </div>
        </div>
    `;
}

// 4. Lưu đáp án - Tuyệt đối không có lệnh chuyển câu ở đây
function saveAnswerOnly(index, value) {
    userAnswers[index] = value;
    // Thầy lưu ý: Ở đây không gọi hàm chuyển trang, máy sẽ đứng im cho học viên kiểm tra.
}

function nextQuestion() {
    if (currentIdx < 29) showQuestion(currentIdx + 1);
}

function prevQuestion() {
    if (currentIdx > 0) showQuestion(currentIdx - 1);
}

// 5. Đồng hồ & Chấm điểm (Giữ nguyên logic gửi Sheets của thầy)
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        let min = Math.floor(timeLeft / 60);
        let sec = timeLeft % 60;
        document.getElementById('timer').innerText = `Thời gian: ${min}:${sec < 10 ? '0' : ''}${sec}`;
        if (timeLeft <= 0) submitQuiz();
    }, 1000);
}

function confirmSubmit() {
    if (confirm("Học viên chắc chắn muốn nộp bài?")) submitQuiz();
}

async function submitQuiz() {
    clearInterval(timerInterval);
    let score = 0;
    selectedQuestions.forEach((q, i) => {
        if (userAnswers[i] === q["Đáp án đúng"]) score++;
    });

    const status = score >= 24 ? "ĐẠT" : "KHÔNG ĐẠT";
    const payload = {
        name: document.getElementById('studentName').value,
        id: document.getElementById('studentID').value,
        score: score,
        status: status
    };

    document.getElementById('quiz-screen').innerHTML = `<div class="text-center p-5"><h3>Đang lưu kết quả...</h3></div>`;

    try {
        await fetch(WEB_APP_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(payload) });
        alert(`Kết quả: ${score}/30 câu - ${status}`);
    } catch (e) {
        alert("Lỗi lưu điểm, hãy chụp màn hình!");
    }
    location.reload();
}
