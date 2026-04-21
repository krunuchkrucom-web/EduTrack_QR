<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

<script>
    let qrcode = null;

    // ฟังก์ชันสร้าง QR Code
    function generateQR(stdId, stdName) {
        // ล้างค่าเก่า
        document.getElementById('canvasQR').innerHTML = "";
        document.getElementById('placeholderQR').style.display = "none";
        
        // ข้อมูลที่จะใส่ใน QR (เช่น URL หรือ JSON)
        // ตัวอย่าง: ส่งเป็น JSON สตริงให้นักเรียนไปสแกนผ่านแอป EduTrack
        const qrData = JSON.stringify({ id: stdId, name: stdName });

        qrcode = new QRCode(document.getElementById("canvasQR"), {
            text: qrData,
            width: 200,
            height: 200,
            colorDark : "#0d6efd", // สีน้ำเงินตาม Theme
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });

        document.getElementById('qrStudentName').innerText = stdName;
        document.getElementById('qrStudentId').innerText = "รหัสนักเรียน: " + stdId;
        document.getElementById('btnDownload').disabled = false;
    }

    // ฟังก์ชันดาวน์โหลดภาพ
    function downloadQR() {
        const img = document.querySelector('#canvasQR img');
        const link = document.createElement('a');
        link.href = img.src;
        link.download = `QR_${document.getElementById('qrStudentId').innerText}.png`;
        link.click();
    }

    // การดึงข้อมูลห้องเรียนและนักเรียน ใช้ฟังก์ชันเดียวกับหน้าจัดการเดิมของคุณ
    // เพียงแต่เปลี่ยนการแสดงผลใน tbody มาเป็นปุ่ม "สร้าง QR" แทนปุ่ม แก้ไข/ลบ ครับ
</script>
