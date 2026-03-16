async function submitQuiz() {
    clearInterval(timerInterval);
    let score = 0;

    selectedQuestions.forEach((q, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        // Kiểm tra đúng tên cột "Đáp án đúng" trong file của thầy
        if (selected && selected.value === q["Đáp án đúng"]) {
            score++;
        }
    });

    const status = score >= 24 ? "ĐẠT" : "KHÔNG ĐẠT";
    const payload = {
        name: document.getElementById('studentName').value,
        id: document.getElementById('studentID').value,
        score: score + "/30",
        status: status
    };

    document.getElementById('quiz-screen').innerHTML = `
        <div class="text-center p-5">
            <div class="spinner-grow text-success" role="status"></div>
            <h3>Đang gửi kết quả về hệ thống...</h3>
        </div>`;

    try {
        // Cấu hình fetch chuẩn để gửi dữ liệu cho Google Script
        await fetch(https://script.google.com/macros/s/AKfycbxSZgEC-oNqO513UvYv_3bvQWkjtMELucG3JWBevyWtcwJoDn6VbH-271TOk42X5oGL/exec, {
            method: "POST",
            mode: "no-cors", // Thêm dòng này để tránh lỗi chặn gửi dữ liệu
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
