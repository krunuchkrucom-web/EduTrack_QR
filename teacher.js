const API_URL = "YOUR_APPS_SCRIPT_WEBAPP_URL"; // URL จากการ Deploy Web App
let currentRoom = "";

// 1. ดึงข้อมูล User และตั้งค่าหน้าจอ
async function initDashboard() {
    const auth = JSON.parse(localStorage.getItem('auth'));
    if (!auth) window.location.href = 'index.html';
    document.getElementById('display-teacher-name').innerText = auth.name;
    loadRooms(); // โหลดปุ่มห้องเรียน
}

// 2. ฟังก์ชันจัดการห้องเรียน (CRUD ห้องเรียน)
async function loadRooms() {
    // ดึงข้อมูลจากแท็บ Subjects หรือสร้างจาก Classes ในแท็บ Students
    const response = await fetch(`${API_URL}?action=getRooms`);
    const rooms = await response.json();
    const area = document.getElementById('room-selection-area');
    area.innerHTML = rooms.map(room => `
        <div class="col-md-3">
            <button class="btn btn-white border w-100 p-3 rounded-4 shadow-sm fw-bold text-start position-relative" onclick="selectRoom('${room.name}')">
                ${room.name}<br><small class="text-muted fw-normal">${room.count} คน</small>
                <i class="fa-solid fa-ellipsis-vertical position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
            </button>
        </div>
    `).join('');
}

// 3. ฟังก์ชันสแกนเข้าเรียน (ทำงานร่วมกับกล้อง)
function startScanner() {
    if(!currentRoom) return Swal.fire('แจ้งเตือน', 'กรุณาเลือกห้องเรียนก่อนสแกน', 'warning');
    const modal = new bootstrap.Modal(document.getElementById('scannerModal'));
    modal.show();
    // โค้ดส่วนเปิดกล้องสแกน QR และส่งค่าไปบันทึกในแท็บ Attendance
}

// 4. ฟังก์ชันจัดการนักเรียน (Add/Edit/Delete)
async function studentModal(mode, studentData = null) {
    // แสดง SweetAlert2 หรือ Modal เพื่อกรอกข้อมูลชื่อ/รหัส
    // ส่งข้อมูลไปที่ Apps Script เพื่ออัปเดตลงแท็บ Students
}

// 5. โหลดตารางนักเรียนตามห้อง
async function selectRoom(roomName) {
    currentRoom = roomName;
    document.getElementById('current-room-name').innerText = roomName;
    const response = await fetch(`${API_URL}?action=getStudentsByRoom&room=${roomName}`);
    const data = await response.json();
    const tbody = document.getElementById('student-list-table');
    tbody.innerHTML = data.map(s => `
        <tr>
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${s.username}</td>
            <td><span class="badge ${getStatusColor(s.status)} p-2 rounded-pill">● ${s.status}</span></td>
            <td>
                <button class="btn btn-link text-primary p-0 me-2" onclick="studentModal('edit', '${s.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn btn-link text-danger p-0" onclick="deleteStudent('${s.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function getStatusColor(status) {
    if(status === 'มาเรียน') return 'text-success bg-success bg-opacity-10';
    if(status === 'สาย') return 'text-warning bg-warning bg-opacity-10';
    return 'text-danger bg-danger bg-opacity-10';
}

window.onload = initDashboard;
