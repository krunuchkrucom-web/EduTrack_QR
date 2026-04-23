const API_URL = "https://script.google.com/macros/s/AKfycbxt5rndbk6Gw4d-opv4CHRRliB6K84awMxtSPJm5qTr5yPhjdZhllISfrR-zGlV3Tsgsw/exec";
let currentSelectedRole = ""; 

function selectRole(role) {
    currentSelectedRole = role; // 'Student' หรือ 'Teacher'
    document.getElementById('role-view').style.setProperty('display', 'none', 'important');
    document.getElementById('login-view').style.setProperty('display', 'flex', 'important');
    
    const badge = document.getElementById('role-badge');
    if (badge) {
        badge.innerText = (role === 'Student') ? "สถานะ: นักเรียน" : "สถานะ: ผู้สอน";
        badge.className = (role === 'Student') ? "badge rounded-pill bg-info text-white px-3 py-2 shadow-sm" : "badge rounded-pill bg-warning text-dark px-3 py-2 shadow-sm";
    }
}

function backToRole() {
    document.getElementById('role-view').style.setProperty('display', 'flex', 'important');
    document.getElementById('login-view').style.setProperty('display', 'none', 'important');
}

async function handleLogin() {
    const userEl = document.getElementById('username');
    const passEl = document.getElementById('password');
    const user = userEl.value.trim();
    const pass = passEl.value.trim();

    if (!user || !pass) {
        Swal.fire('คำเตือน', 'กรุณากรอกข้อมูลให้ครบ', 'warning');
        return;
    }
    
    document.getElementById('loader').style.display = 'flex';
    
    try {
        const response = await fetch(API_URL, { 
            method: 'POST', 
            body: JSON.stringify({ action: 'login', user: user, pass: pass }) 
        });
        const json = await response.json();
        
        document.getElementById('loader').style.display = 'none';
        
        if (json.success) {
            // เช็คตัวพิมพ์ใหญ่-เล็กให้ตรงกับใน Google Sheets
            if (json.role.toLowerCase() !== currentSelectedRole.toLowerCase()) {
                Swal.fire('ผิดพลาด', `บัญชีนี้ไม่ใช่สิทธิ์ ${currentSelectedRole}`, 'error');
                return;
            }
            
            localStorage.setItem('auth', JSON.stringify(json));
            
            if (json.role.toLowerCase() === 'teacher') {
                window.location.href = 'teacher.html';
            } else {
                window.location.href = 'student.html';
            }
        } else {
            Swal.fire('ล้มเหลว', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
        }
    } catch (err) {
        document.getElementById('loader').style.display = 'none';
        Swal.fire('Error', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    }
}

// --- ส่วนที่ 1: แก้ไขฟังก์ชันโชว์หน้าสแกน (เพิ่ม div id="reader") ---
function showScanner(element) {
    if (element) {
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        element.classList.add('active');
    }
    
    const headerTitle = document.getElementById('header-title');
    if (headerTitle) headerTitle.innerText = "สแกนเข้าเรียนและส่งงานอัจฉริยะ";

    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="row g-4 animate__animated animate__fadeIn">
            <div class="col-lg-4">
                <div class="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                    <h6 class="fw-bold mb-3"><i class="fas fa-sliders-h me-2 text-primary"></i> ตั้งค่าโหมด</h6>
                    <div class="btn-group w-100 p-1 bg-light rounded-pill mb-4">
                        <button class="btn btn-primary rounded-pill btn-sm fw-bold" id="mode-att" onclick="switchScannerMode('attendance')">เช็คชื่อ</button>
                        <button class="btn btn-light rounded-pill btn-sm fw-bold" id="mode-ass" onclick="switchScannerMode('assignment')">ส่งงาน</button>
                    </div>
                    <div id="assignment-settings" style="display:none;">
                        <div class="mb-3">
                            <label class="small fw-bold text-muted">ชื่อใบงาน/งานที่ส่ง</label>
                            <input type="text" id="task-name" class="form-control border-0 bg-light rounded-3" placeholder="ระบุชื่อใบงาน...">
                        </div>
                        <div class="row g-2">
                            <div class="col-6">
                                <label class="small fw-bold text-muted">คะแนน</label>
                                <input type="number" id="max-score" class="form-control border-0 bg-light rounded-3 text-center" value="10">
                            </div>
                            <div class="col-6">
                                <label class="small fw-bold text-muted">หมดเวลา</label>
                                <input type="time" class="form-control border-0 bg-light rounded-3">
                            </div>
                        </div>
                        <button class="btn btn-success w-100 mt-3 rounded-pill fw-bold btn-sm" onclick="updateTask()">อัพเดทข้อมูลงาน</button>
                    </div>
                </div>
            </div>

            <div class="col-lg-5">
                <div class="card border-0 shadow-lg rounded-5 overflow-hidden bg-dark position-relative" style="aspect-ratio: 1/1;">
                    <div id="reader" style="width:100%; height:100%;"></div> 
                    <div class="scanner-line"></div>
                </div>
                <div class="alert alert-info mt-3 rounded-4 border-0 shadow-sm d-flex align-items-center">
                    <button class="btn btn-primary btn-sm rounded-pill me-3" onclick="startScanner()">เปิดกล้องสแกน</button>
                    <span class="small" id="scan-status">พร้อมใช้งาน</span>
                </div>
            </div>

            <div class="col-lg-3">
                <div class="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="fw-bold m-0">สแกนล่าสุด</h6>
                        <span class="badge bg-primary-soft text-primary rounded-pill px-2">Live</span>
                    </div>
                    <div id="scan-log" class="overflow-auto" style="max-height: 400px;">
                        <div class="text-center py-5 text-muted small">ยังไม่มีข้อมูลการสแกน</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- ส่วนที่ 2: แก้ไข Logic การสแกนให้ ID ตรงกัน ---
let html5QrCode; // ประกาศตัวแปรไว้ข้างนอกเพื่อใช้ Stop กล้องได้

function startScanner() {
    // ป้องกันการเปิดกล้องซ้อนกัน
    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => startScanner());
        return;
    }

    html5QrCode = new Html5Qrcode("reader");
    document.getElementById('scan-status').innerText = "กำลังเข้าถึงกล้อง...";

    html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
            console.log("QR Code detected:", decodedText);
            
            // แก้ไข ID ให้ตรงกับปุ่มด้านบน (mode-att ไม่ใช่ btn-mode-att)
            const isAttendance = document.getElementById('mode-att').classList.contains('btn-primary');
            
            const data = {
                studentId: decodedText,
                type: isAttendance ? 'เช็คชื่อ' : 'ส่งงาน',
                score: document.getElementById('max-score')?.value || 0,
                task: document.getElementById('task-name')?.value || 'ทั่วไป'
            };
            
            // เพิ่ม Log แสดงผลแบบ Real-time บนหน้าจอ
            updateScanLog(data);
            
            // ส่งข้อมูลไป Google Sheet (ถ้ามีฟังก์ชันนี้)
            if (typeof saveToSheet === "function") saveToSheet(data);

            // แจ้งเตือนด้วยเสียงหรือ UI
            Swal.fire({
                title: 'สแกนสำเร็จ!',
                text: `รหัส: ${decodedText} (${data.type})`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
    ).catch(err => {
        document.getElementById('scan-status').innerText = "Error: ไม่สามารถเปิดกล้องได้";
        console.error(err);
    });
}

// ฟังก์ชันเสริมสำหรับแสดงรายการสแกนล่าสุดบนหน้าจอ
function updateScanLog(data) {
    const logArea = document.getElementById('scan-log');
    const time = new Date().toLocaleTimeString();
    const newLog = `
        <div class="p-2 border-bottom small animate__animated animate__fadeInDown">
            <span class="fw-bold text-primary">${data.studentId}</span> 
            <span class="badge bg-light text-dark float-end">${time}</span>
            <div class="text-muted" style="font-size: 0.75rem;">โหมด: ${data.type}</div>
        </div>
    `;
    if (logArea.innerText.includes('ยังไม่มีข้อมูล')) logArea.innerHTML = '';
    logArea.innerHTML = newLog + logArea.innerHTML;
}

