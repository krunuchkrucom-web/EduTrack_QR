// --- การตั้งค่าเบื้องต้น ---
let html5QrCode;
let currentMode = 'attendance';
let scanHistory = [];
const scriptURL = 'https://script.google.com/macros/s/AKfycbwT2u_h9_PzFsypgh_48GXwaesdoOYdvyRlkAA8CaAT9wzr3zW7mUVE3GM3r9nmQzeaZg/exec';

window.onload = () => {
    initScanner();
};

// ฟังก์ชันเปิดกล้อง - ปรับปรุงการเลือกกล้องหลังอัตโนมัติ
async function initScanner() {
    if (html5QrCode) {
        try { await html5QrCode.clear(); } catch (e) { console.log(e); }
    }

    Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length > 0) {
            html5QrCode = new Html5Qrcode("reader");
            
            // พยายามหาเลนส์หลัง (environment) ถ้าไม่เจอให้ใช้ตัวแรก
            let cameraId = devices[0].id;
            const backCamera = devices.find(device => 
                device.label.toLowerCase().includes('back') || 
                device.label.toLowerCase().includes('environment')
            );
            if (backCamera) cameraId = backCamera.id;

            const config = { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0 
            };

            html5QrCode.start(cameraId, config, onScanSuccess)
            .catch(err => {
                document.getElementById('statusLabel').innerText = "กล้องถูกใช้งานโดยโปรแกรมอื่น";
                console.error(err);
            });
        } else {
            document.getElementById('statusLabel').innerText = "ไม่พบอุปกรณ์กล้องในเครื่องนี้";
        }
    }).catch(err => {
        document.getElementById('statusLabel').innerText = "เกิดข้อผิดพลาด: " + err;
    });
}

// เมื่อสแกนติด
function onScanSuccess(decodedText, decodedResult) {
    html5QrCode.pause();
    
    // ดึงค่าจากหน้า UI
    const className = document.getElementById('classSelect').value;
    const workName = document.getElementById('workTitle').value;
    const score = document.getElementById('fullScore').value;
    const timeStatus = document.getElementById('timeStatus').value;

    const studentData = {
        action: 'recordScan', 
        id: decodedText,
        mode: currentMode,
        room: className,
        workName: currentMode === 'assignment' ? workName : 'เช็คชื่อเข้าเรียน',
        score: currentMode === 'assignment' ? score : '-',
        status: timeStatus,
        admin: "Teacher Admin",
        timestamp: new Date().toISOString()
    };

    showSuccessUI(decodedText);
    saveToSheet(studentData);
}

// แสดง Feedback บนหน้าจอ
function showSuccessUI(id) {
    const overlay = document.getElementById('successOverlay');
    const nameDisplay = document.getElementById('scannedName');
    
    nameDisplay.innerText = "รหัส: " + id;
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');

    setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        if(html5QrCode) html5QrCode.resume();
    }, 2000);
}

// บันทึกข้อมูลลง Google Sheet - ปรับปรุงการส่งข้อมูลให้เข้ากับ Apps Script ได้ดีขึ้น
function saveToSheet(studentData) {
    updateScanHistory(studentData);

    // ใช้ URLSearchParams สำหรับการส่งแบบ Form-urlencoded
    const formData = new URLSearchParams();
    for (const key in studentData) {
        formData.append(key, studentData[key]);
    }

    // แก้ไข: เปลี่ยนการจัดการ Response เพราะโหมด no-cors จะอ่านค่าตอบกลับไม่ได้ 
    // เราจึงต้องใช้ setTimeout หรือย้าย Logic ไปไว้ที่ .then เลยเพื่อปลดล็อคหน้าจอ
    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', 
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    })
    .then(() => {
        console.log('Data sent successfully');
        // ไม่ต้องรออ่าน JSON เพราะ no-cors อ่านไม่ได้ ให้ถือว่าสำเร็จและไปต่อเลย
        document.getElementById('statusLabel').innerText = "บันทึกสำเร็จ! พร้อมสแกนต่อ";
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อ Server ได้', 'error');
        if(html5QrCode) html5QrCode.resume();
    });
}

// อัปเดตรายการประวัติข้างหน้าจอ
function updateScanHistory(data) {
    const logContainer = document.getElementById('activityLog');
    const emptyPlaceholder = document.getElementById('emptyLog');
    
    if (emptyPlaceholder) emptyPlaceholder.remove();

    const displayTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const newLog = document.createElement('div');
    newLog.className = "p-4 bg-white rounded-2xl border border-gray-100 mb-3 shadow-sm transition hover:border-blue-300 animate-pulse";
    
    newLog.innerHTML = `
        <div class="flex items-center mb-2">
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3 text-xs font-bold">
                ${data.id.substring(0,3)}
            </div>
            <span class="font-bold text-gray-800 text-sm">ID: ${data.id}</span>
        </div>
        <div class="flex justify-between items-center">
            <span class="text-xs text-green-500 font-bold"><i class="fas fa-clock mr-1"></i> ${displayTime} น.</span>
            ${data.mode === 'assignment' 
                ? `<span class="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg">คะแนน: ${data.score}</span>`
                : `<span class="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">เข้าเรียน</span>`
            }
        </div>
    `;

    logContainer.insertBefore(newLog, logContainer.firstChild);
    
    scanHistory.push(data);
    document.getElementById('scanCount').innerText = `${scanHistory.length}/40`;
    
    setTimeout(() => newLog.classList.remove('animate-pulse'), 1000);
}

// สลับโหมดการทำงาน
function toggleMode(mode) {
    currentMode = mode;
    const btnAtt = document.getElementById('btnAtt');
    const btnAss = document.getElementById('btnAss');
    const detail = document.getElementById('assignmentDetail');
    const statusLabel = document.getElementById('statusLabel');

    if (mode === 'assignment') {
        btnAss.className = "flex-1 py-3 rounded-xl font-bold transition text-blue-600 bg-white shadow-sm";
        btnAtt.className = "flex-1 py-3 rounded-xl font-bold transition text-gray-400";
        detail.classList.remove('hidden');
        statusLabel.innerText = "สแกนเพื่อบันทึกงาน...";
    } else {
        btnAtt.className = "flex-1 py-3 rounded-xl font-bold transition text-blue-600 bg-white shadow-sm";
        btnAss.className = "flex-1 py-3 rounded-xl font-bold transition text-gray-400";
        detail.classList.add('hidden');
        statusLabel.innerText = "สแกนเพื่อเช็คชื่อ...";
    }
}
