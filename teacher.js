// 1. ตรวจสอบสิทธิ์ทันที
const auth = JSON.parse(localStorage.getItem('auth'));
if (!auth || auth.role !== 'Teacher') {
    window.location.href = 'index.html'; 
}

// 2. เมื่อโหลดหน้า
window.onload = () => {
    // แสดงชื่อครูที่มุมขวาบน
    document.getElementById('user-display-area').innerHTML = `
        <div class="fw-bold text-dark">${auth.name}</div>
        <small class="text-muted">ครูผู้สอน</small>
    `;
    showDashboard(); // เริ่มต้นที่หน้า Dashboard
};

// 3. ฟังก์ชันหน้าหลัก (Dashboard)
function showDashboard() {
    updateMenu('menu-dash');
    document.getElementById('header-title').innerText = "ระบบจัดการชั้นเรียน";
    const area = document.getElementById('content-area');
    
    area.innerHTML = `
        <div class="row g-4">
            <div class="col-lg-8">
                <div class="card p-4 border-0 shadow-sm rounded-4">
                    <h5 class="fw-bold mb-3">รายชื่อนักเรียน</h5>
                    <div class="table-responsive">
                        <table class="table align-middle">
                            <thead class="table-light">
                                <tr><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>สถานะ</th><th>จัดการ</th></tr>
                            </thead>
                            <tbody id="student-list-area">
                                </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card p-4 border-0 shadow-sm rounded-4 text-center">
                    <h6 class="text-muted">สถิติวันนี้</h6>
                    <h2 class="text-primary display-5 fw-bold">158</h2>
                    <p class="small">คนเข้าเรียนทั้งหมด</p>
                </div>
            </div>
        </div>
    `;
    loadClassRoom('ปวช.1/1');
}

// 4. ฟังก์ชันหน้าสร้าง QR
function showCreateQR() {
    updateMenu('menu-qr');
    document.getElementById('header-title').innerText = "สร้าง QR Code รายบุคคล";
    const area = document.getElementById('content-area');
    
    area.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-4">
            <div class="row g-4">
                <div class="col-md-5">
                    <h5 class="fw-bold mb-3">กรอกข้อมูลเพื่อสร้าง QR</h5>
                    <div class="mb-3">
                        <label class="form-label small">รหัสนักเรียน (ID)</label>
                        <input type="text" id="qr-input-id" class="form-control rounded-pill" placeholder="เช่น 69001">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small">ชื่อ-นามสกุล</label>
                        <input type="text" id="qr-input-name" class="form-control rounded-pill" placeholder="นายสมชาย ใจดี">
                    </div>
                    <button onclick="generateQR()" class="btn btn-primary w-100 rounded-pill fw-bold">สร้าง QR Code</button>
                </div>
                <div class="col-md-7 text-center border-start">
                    <div id="qr-result-area" class="p-3 d-none">
                        <div id="qr-card-to-print" class="p-4 border rounded-4 bg-white shadow-sm d-inline-block" style="width: 250px;">
                            <h6 class="fw-bold text-primary mb-2">EduTrack QR</h6>
                            <div id="qr-image-container" class="mb-2"></div>
                            <div class="fw-bold" id="qr-display-name"></div>
                            <div class="small text-muted" id="qr-display-id"></div>
                        </div>
                        <div class="mt-3">
                            <button onclick="printQR()" class="btn btn-outline-dark rounded-pill px-4">พิมพ์บัตร QR</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- ฟังก์ชันเสริมอื่นๆ ---

async function loadClassRoom(room) {
    const tbody = document.getElementById('student-list-area');
    if(tbody) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">กำลังดึงข้อมูล ${room}...</td></tr>`;
    }
}

function updateMenu(activeId) {
    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('active');
        el.classList.add('text-dark');
    });
    const active = document.getElementById(activeId);
    active.classList.add('active');
    active.classList.remove('text-dark');
}

function generateQR() {
    const id = document.getElementById('qr-input-id').value;
    const name = document.getElementById('qr-input-name').value;
    if (!id || !name) {
        Swal.fire('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
        return;
    }
    const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${id}&choe=UTF-8`;
    document.getElementById('qr-image-container').innerHTML = `<img src="${qrUrl}" class="img-fluid">`;
    document.getElementById('qr-display-name').innerText = name;
    document.getElementById('qr-display-id').innerText = `ID: ${id}`;
    document.getElementById('qr-result-area').classList.remove('d-none');
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function printQR() {
    const content = document.getElementById('qr-card-to-print').innerHTML;
    const win = window.open('', '', 'height=500,width=500');
    win.document.write('<html><head><title>Print QR</title>');
    win.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">');
    win.document.write('<style>body{font-family:Sarabun;text-align:center;padding:20px;}</style></head><body>');
    win.document.write(content);
    win.document.write('</body></html>');
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
}
