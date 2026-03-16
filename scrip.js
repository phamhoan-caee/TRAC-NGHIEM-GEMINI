async function submitQuiz() {
    clearInterval(timerInterval);
    let score = 0;

    selectedQuestions.forEach((q, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (selected && selected.value === q["Đáp án đúng"]) {
            score++;
        }
    });

    const status = score >= 24 ? "ĐẠT" : "KHÔNG ĐẠT";
    
    // ĐÃ SỬA: Tên biến phải khớp 100% với file Apps Script của thầy
    const payload = {
        name: document.getElementById('studentName').value, // Kiểm tra lại ID này có đúng trong HTML không
        className: document.getElementById('studentID').value, // Đổi 'id' thành 'className' để khớp Apps Script
        score: score + "/30",
        result: status // Đổi 'status' thành 'result' để khớp Apps Script
    };

    document.getElementById('quiz-screen').innerHTML = `
        <div class="text-center p-5">
            <div class="spinner-grow text-success" role="status"></div>
            <h3>Đang gửi kết quả về hệ thống...</h3>
        </div>`;

    try {
        // ĐÃ SỬA: Thêm dấu ngoặc kép bao quanh link
        await fetch("https://script.google.com/macros/s/AKfycbwg75d-6OFif2t-bnwgZNgijiN_PUi-_xSxOM9fHHvvM6N9Ymr1yfTVtoZiVaqUwZNh/exec", {
            method: "POST",
            mode: "no-cors", 
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        });
        
        alert(`Kết thúc bài thi! \nHọc viên: ${payload.name} \nSố câu đúng: ${payload.score} \nKết quả: ${status}`);
    } catch (e) {
        console.error("Lỗi:", e);
        alert("Có lỗi kết nối khi gửi điểm. Thầy hãy chụp lại màn hình kết quả!");
    }

    location.reload(); 
}
