const API_URL = "https://script.google.com/macros/s/AKfycbxt5rndbk6Gw4d-opv4CHRRliB6K84awMxtSPJm5qTr5yPhjdZhllISfrR-zGlV3Tsgsw/exec";
let currentSelectedRole = "";
let html5QrCode = null;

// 1. ระบบ Role Selection
function selectRole(role) {
    currentSelectedRole = role;
    document.getElementById('role-view').style.setProperty('display', 'none', 'important');
    const loginView = document.getElementById('login-view');
    loginView.style.setProperty('display', 'flex', 'important');
    
    const badge = document.getElementById('role-badge');
    badge.innerText = (role === 'Student') ? "บทบาท: นักเรียน" : "บทบาท: ผู้สอน";
    badge.className = (role === 'Student') ? "badge rounded-pill bg-info text-white px-3 py-2" : "badge rounded-pill bg-warning text-dark px-3 py-2";
}

function backToRole() {
    document.getElementById('role-view').style.setProperty('display', 'flex', 'important');
    document.getElementById('login-view').style.setProperty('display', 'none', 'important');
}

// 2. ระบบ Login
async function handleLogin() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (!user || !pass) {
        Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอก Username และ Password', 'warning');
        return;
    }

    document.getElementById('loader').style.display = 'flex';

    try {
        // จำลองการเชื่อมต่อ API (แทนที่ด้วยโค้ด fetch จริงของคุณได้)
        setTimeout(() => {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('login-view').style.setProperty('display', 'none', 'important');
            document.getElementById('main-view').style.display = 'block';
            document.getElementById('user-display-name').innerText = user;
            showDashboard(); // ไปที่หน้าแรกหลัง Login
        }, 1000);
    } catch (err) {
        document.getElementById('loader').style.display = 'none';
        Swal.fire('Error', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    }
}

// 3. ระบบ Sidebar Navigation
function updateActiveMenu(el) {
    if (html5QrCode) { // หยุดกล้องถ้ามีการเปลี่ยนหน้า
        html5QrCode.stop().catch(() => {});
    }
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    if(el) el.classList.add('active');
}

function showDashboard(el) {
    updateActiveMenu(el);
    document.getElementById('header-title').innerText = "Dashboard Overview";
    document.getElementById('content-area').innerHTML = `
        <div class="row g-4">
            <div class="col-md-4"><div class="card p-4 border-0 shadow-sm rounded-4 text-center"><h5>จำนวนนักเรียน</h5><h2 class="text-primary fw-bold">45</h2></div></div>
            <div class="col-md-4"><div class="card p-4 border-0 shadow-sm rounded-4 text-center"><h5>มาเรียนวันนี้</h5><h2 class="text-success fw-bold">42</h2></div></div>
            <div class="col-md-4"><div class="card p-4 border-0 shadow-sm rounded-4 text-center"><h5>ยังไม่ส่งงาน</h5><h2 class="text-danger fw-bold">3</h2></div></div>
        </div>
    `;
}

function showScanner(el) {
    updateActiveMenu(el);
    document.getElementById('header-title').innerText = "Smart Scanner System";
    document.getElementById('content-area').innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card border-0 shadow-lg rounded-5 overflow-hidden bg-dark position-relative" style="aspect-ratio: 1/1;">
                    <div id="reader" style="width: 100%; height: 100%;"></div>
                    <div class="scanner-line"></div>
                </div>
                <div class="alert alert-primary mt-4 rounded-4 border-0 text-center fw-bold">
                    <i class="fas fa-info-circle me-2"></i> กรุณาวางคิวอาร์โค้ดในกรอบเพื่อแสกน
                </div>
            </div>
        </div>
    `;
    
    // เริ่มต้นกล้อง
    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
            Swal.fire('สำเร็จ!', 'สแกนข้อมูล: ' + decodedText, 'success');
        },
        (errorMessage) => { /* scanning... */ }
    ).catch(err => {
        console.error("Camera Error: ", err);
    });
}

function logout() {
    Swal.fire({
        title: 'ยืนยันการออกจากระบบ?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ออก',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) location.reload();
    });
}
