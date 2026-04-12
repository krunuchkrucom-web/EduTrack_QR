// --- 1. ตรวจสอบสิทธิ์ (Security Guard) ---
const auth = JSON.parse(localStorage.getItem('auth'));

if (!auth || auth.role !== 'Student') {
    // ถ้าไม่มีข้อมูล หรือไม่ใช่ Student ให้ส่งกลับไปหน้า Login ทันที
    window.location.href = 'index.html';
}

// --- 2. เมื่อโหลดหน้าจอ ---
window.onload = () => {
    // แสดงชื่อและข้อมูลเบื้องต้นจากข้อมูลการ Login
    document.getElementById('st-name').innerText = auth.name;
    document.getElementById('st-id').innerText = `รหัส: ${auth.user || 'ไม่ระบุ'}`;

    // ดึงข้อมูลประวัติการมาเรียน (จาก Google Sheets ผ่าน API)
    fetchStudentData();
};

async function fetchStudentData() {
    const API_URL = "https://script.google.com/macros/s/AKfycbwHV8K0Me5It_ePtkt4EhEnFPzypA6Rdpl-zmpU-vABr2fTeFYQGI8DZSppXSggnuPbtw/exec";
    
    try {
        // ส่ง Action ไปที่ Google Apps Script เพื่อขอข้อมูลรายคน
        const response = await fetch(`${API_URL}?action=getStudentStats&user=${auth.user}`);
        const data = await response.json();

        if (data.success) {
            updateUI(data);
        } else {
            document.getElementById('st-history-list').innerHTML = '<tr><td colspan="4" class="text-center">ไม่พบข้อมูลประวัติการมาเรียน</td></tr>';
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        // กรณีดึงข้อมูลไม่ได้ (เช่น ยังไม่ได้เขียน API ส่วนนี้) ให้แสดงค่าเริ่มต้นไว้ก่อน
        document.getElementById('st-history-list').innerHTML = '<tr><td colspan="4" class="text-center text-muted">ระบบกำลังเชื่อมต่อข้อมูลจาก Google Sheets...</td></tr>';
    }
}

function updateUI(data) {
    // อัปเดตตัวเลขสถิติ
    document.getElementById('count-present').innerText = data.stats.present;
    document.getElementById('count-late').innerText = data.stats.late;
    document.getElementById('count-absent').innerText = data.stats.absent;
    document.getElementById('count-leave').innerText = data.stats.leave;

    // อัปเดตตารางประวัติ
    const tbody = document.getElementById('st-history-list');
    tbody.innerHTML = data.history.map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.subject}</td>
            <td>${item.time}</td>
            <td><span class="badge rounded-pill ${getStatusClass(item.status)}">${item.status}</span></td>
        </tr>
    `).join('');
}

function getStatusClass(status) {
    if (status === 'มาเรียน') return 'bg-success';
    if (status === 'สาย') return 'bg-warning text-dark';
    if (status === 'ขาด') return 'bg-danger';
    return 'bg-info';
}

// --- 3. ระบบออกจากระบบ ---
function logout() {
    Swal.fire({
        title: 'ออกจากระบบ?',
        text: "คุณต้องการออกจากระบบใช่หรือไม่",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, ออกจากระบบ',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            window.location.href = 'index.html';
        }
    })
}
