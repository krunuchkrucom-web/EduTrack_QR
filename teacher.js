// ตรวจสอบสิทธิ์ทันทีที่เปิดหน้า
const auth = JSON.parse(localStorage.getItem('auth'));
if (!auth || auth.role !== 'Teacher') {
    window.location.href = 'index.html'; 
}

window.onload = () => {
    document.getElementById('user-display-name').innerHTML = `
        <div class="fw-bold text-dark">${auth.name}</div>
        <small class="text-muted">ครูผู้สอน</small>
    `;
    showDashboard();
};

function showDashboard() {
    const area = document.getElementById('content-area');
    // ... ใส่โค้ด innerHTML ของหน้า Dashboard ครูตรงนี้ ...
    loadClassRoom('ปวช.1/1');
}

async function loadClassRoom(room) {
    const tbody = document.getElementById('student-list-area');
    tbody.innerHTML = `<tr><td colspan="4" class="text-center">กำลังดึงข้อมูล ${room}...</td></tr>`;
    // เรียก Fetch ข้อมูลจาก Sheets ต่อไป
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function generateQR() {
    const id = document.getElementById('qr-input-id').value;
    const name = document.getElementById('qr-input-name').value;

    if (!id || !name) {
        Swal.fire('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
        return;
    }

    // สร้าง URL สำหรับ QR Code โดยใช้ Google Charts API (ส่งค่า id เข้าไป)
    const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${id}&choe=UTF-8`;
    
    // แสดงผลบนหน้าจอ
    document.getElementById('qr-image-container').innerHTML = `<img src="${qrUrl}" class="img-fluid" alt="QR Code">`;
    document.getElementById('qr-display-name').innerText = name;
    document.getElementById('qr-display-id').innerText = `ID: ${id}`;
    
    // แสดงส่วนผลลัพธ์
    document.getElementById('qr-result-area').classList.remove('d-none');
}

function printQR() {
    const printContent = document.getElementById('qr-card-to-print').innerHTML;
    const originalContent = document.body.innerHTML;

    // คำสั่งพิมพ์แบบง่าย (สร้างหน้าต่างใหม่เพื่อพิมพ์)
    const printWindow = window.open('', '', 'height=500,width=500');
    printWindow.document.write('<html><head><title>Print QR Card</title>');
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">');
    printWindow.document.write('<style>body{font-family:Sarabun; text-align:center; padding:20px;}</style></head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
}
