// 1. Cấu hình - Link Web App từ Google Sheets của bạn
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzRe6p2BHUlBsFM95U-3OCXx4CvmJ0-An25SMnTLhcsAUJhy4RBkNNUEZEwLsp8mx72/exec";

let allQuestions = [];
let selectedQuestions = [];
let userAnswers = {}; 
let currentQuestionIndex = 0; 
let timeLeft = 1200; // 20 phút
let timerInterval;

// 2. Hàm Bắt đầu thi
async function startQuiz() {
    const name = document.getElementById('studentName').value.trim();
    const id = document.getElementById('studentID').value.trim();

    if (!name || !id) {
        alert("Vui lòng nhập đủ Họ tên và Khóa!");
        return;
    }

    // Hiệu ứng chờ tải đề
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    // Hiển thị tên học viên lên góc phải nếu có chỗ
    const displayUser = document.querySelector('.HOCVIEN_NAME');
    if(displayUser) displayUser.innerText = name;

    try {
        const response = await fetch(WEB_APP_URL);
        allQuestions = await response.json();
        
        // Lấy ngẫu nhiên 30 câu từ ngân hàng
        selectedQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 30);

        renderSitemap(); // Vẽ sơ đồ câu hỏi bên phải
        showQuestion(0);
        startTimer();
    } catch (error) {
        alert("Lỗi kết nối hệ thống CAEE! Vui lòng kiểm tra Internet.");
        location.reload();
    }
}

// 3. Hàm hiển thị câu hỏi (Chỉ hiện từng câu một)
function showQuestion(index) {
    currentQuestionIndex = index;
    const q = selectedQuestions[index];
    const container = document.getElementById('quiz-content');
    
    const imageHtml = q["HINHANH"] ? `<div class="text-center mb-3"><img src="${q["HINHANH"]}" class="img-fluid rounded border shadow-sm" style="max-height:250px;"></div>` : "";
    
    // Kiểm tra xem đã chọn đáp án chưa để tích lại
    const isSelected = (opt) => userAnswers[index] === opt ? "checked" : "";

    container.innerHTML = `
        <div class="question-page p-3 bg-white rounded shadow-sm fade-in">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge bg-primary px-3 py-2">Câu hỏi ${index + 1} / 30</span>
                <span class="text-muted small">Mã đề: CAEE-2026</span>
            </div>
            
            <h5 class="mb-4 text-dark font-weight-bold">${q["Nội dung câu hỏi"]}</h5>
            ${imageHtml}
            
            <div class="options-list mt-3">
                ${['A', 'B', 'C', 'D'].map(opt => `
                    <div class="form-check mb-3 p-2 border rounded hover-shadow ${userAnswers[index] === opt ? 'bg-blue-50 border-primary' : ''}">
                        <input class="form-check-input ms-1" type="radio" name="quizOption" id="opt${opt}" value="${opt}" 
                            ${isSelected(opt)} 
                            onclick="saveAnswerOnly(${index}, '${opt}')"> 
                        <label class="form-check-label w-100 ps-4 cursor-pointer" for="opt${opt}">
                            <strong>${opt}.</strong> ${q["Đáp án " + opt]}
                        </label>
                    </div>
                `).join('')}
            </div>

            <div class="navigation-btns d-flex justify-content-between mt-5">
                <button class="btn btn-outline-secondary px-4" onclick="prevQuestion()" ${index === 0 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-left"></i> TRƯỚC
                </button>
                
                ${index === 29 ? 
                    `<button class="btn btn-danger px-4" onclick="confirmSubmit()">NỘP BÀI</button>` : 
                    `<button class="btn btn-primary px-4" onclick="nextQuestion()">TIẾP THEO <i class="fas fa-arrow-right"></i></button>`
                }
            </div>
        </div>
    `;
    updateActiveGrid(index);
}

// 4. Hàm lưu đáp án (Đã bỏ tự động chuyển câu)
function saveAnswerOnly(index, value) {
    userAnswers[index] = value;
    // Cập nhật màu xanh cho sơ đồ câu hỏi ngay khi chọn
    const gridItem = document.getElementById(`grid-item-${index}`);
    if (gridItem) gridItem.classList.add('answered');
}

function nextQuestion() {
    if (currentQuestionIndex < 29) showQuestion(currentQuestionIndex + 1);
}

function prevQuestion() {
    if (currentQuestionIndex > 0) showQuestion(currentQuestionIndex - 1);
}

// 5. Sơ đồ câu hỏi bên phải
function renderSitemap() {
    const grid = document.getElementById('questionGrid'); // Đảm bảo HTML có ID này
    if(!grid) return;
    grid.innerHTML = '';
    for(let i=0; i<30; i++) {
        const item = document.createElement('div');
        item.id = `grid-item-${i}`;
        item.className = 'q-grid-item'; // Class CSS thầy đã có
        item.innerText = i + 1;
        item.onclick = () => showQuestion(i);
        grid.appendChild(item);
    }
}

function updateActiveGrid(index) {
    document.querySelectorAll('.q-grid-item').forEach(el => el.classList.remove('active'));
    const current = document.getElementById(`grid-item-${index}`);
    if(current) current.classList.add('active');
}

// 6. Đồng hồ & Nộp bài
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        let min = Math.floor(timeLeft / 60);
        let sec = timeLeft % 60;
        const timerEl = document.getElementById('timer');
        if(timerEl) timerEl.innerText = `${min}:${sec < 10 ? '0' : ''}${sec}`;
        if (timeLeft <= 0) submitQuiz();
    }, 1000);
}

function confirmSubmit() {
    const count = Object.keys(userAnswers).length;
    if (confirm(`Bạn đã làm ${count}/30 câu. Bạn chắc chắn muốn nộp bài?`)) submitQuiz();
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
        className: document.getElementById('studentID').value, // Khớp với Apps Script
        score: score,
        result: status
    };

    document.getElementById('quiz-screen').innerHTML = `<div class="text-center p-5"><h4>Hệ thống đang lưu điểm của bạn...</h4></div>`;

    try {
        await fetch(WEB_APP_URL, { 
            method: "POST", 
            mode: "no-cors",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) 
        });
        alert(`KẾT QUẢ: ${score}/30 câu - ${status}`);
    } catch (e) {
        alert("Lỗi mạng! Bạn hãy chụp màn hình kết quả này và báo cho thầy Hoàn.");
    }
    location.reload();
}
