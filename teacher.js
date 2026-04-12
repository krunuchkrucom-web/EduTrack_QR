const API_URL = "https://script.google.com/macros/s/AKfycbzg10Axny3si-7v3IKfSoibodqiP07m5aseWZRZYpjewmC_HiLxyTPSPR8OP9tVDvuhCw/exec";
let currentRoom = "ปวช.1/1";

window.onload = async () => {
    const auth = JSON.parse(localStorage.getItem('auth'));
    if (!auth) window.location.href = 'index.html';
    
    // ดึงรูปและชื่อจาก User ใน Google Sheets
    document.getElementById('teacher-name').innerText = auth.name;
    loadTeacherProfile(auth);
    loadRoomSelection(); // โหลดห้องเรียนพร้อมสี
    selectRoom(currentRoom); // เริ่มต้นโหลดห้องแรก
};

// ฟังก์ชันโหลดรูปโปรไฟล์ (ดึงจากแท็บ User)
function loadTeacherProfile(auth) {
    const profileArea = document.getElementById('teacher-profile-top');
    profileArea.innerHTML = `
        <div class="me-3 text-end">
            <div class="fw-bold small">${auth.name}</div>
            <div class="text-muted" style="font-size: 10px;">Teacher</div>
        </div>
        <img src="${auth.photo || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}" width="40" height="40" class="rounded-circle border shadow-sm">
    `;
}

// ฟังก์ชันโหลดห้องเรียนพร้อมสีที่กำหนด
async function loadRoomSelection() {
    // เรียกข้อมูลจากแท็บ Subjects (ที่มีคอลัมน์ Name และ Color)
    const response = await fetch(`${API_URL}?action=getRooms`);
    const rooms = await response.json();
    
    const area = document.getElementById('room-selection-area');
    area.innerHTML = rooms.map(room => `
        <div class="col-md-3">
            <button class="btn ${room.color || 'btn-primary'} w-100 p-3 rounded-4 shadow-sm fw-bold border-0" onclick="selectRoom('${room.name}')">
                ${room.name}<br><small class="fw-normal" style="font-size: 0.7rem;">${room.studentCount} คน</small>
            </button>
        </div>
    `).join('');
}

// ฟังก์ชันบันทึกห้องเรียนใหม่ลง Sheets
async function saveRoomToSheet() {
    const name = document.getElementById('input-room-name').value;
    const color = document.getElementById('input-room-color').value;
    
    if(!name) return Swal.fire('แจ้งเตือน', 'กรุณาระบุชื่อห้อง', 'warning');
    
    // ส่งข้อมูลไปบันทึกใน Google Sheets (แท็บ Subjects)
    const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'addRoom', roomName: name, roomColor: color })
    });
    
    if(res.ok) {
        Swal.fire('สำเร็จ', 'เพิ่มห้องเรียนเรียบร้อย', 'success');
        loadRoomSelection();
    }
}
