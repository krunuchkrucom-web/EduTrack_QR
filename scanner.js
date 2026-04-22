// ฟังก์ชันบันทึกข้อมูลลง Google Sheet
function saveToSheet(studentData) {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbx-_wojFp6rkj_FRyfWo2K1eQvjyiLKeEQbjDTolRcvPzInyC6q5CmWpE0M2cC-pMPIhQ/exec';
    
    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(studentData)
    })
    .then(response => {
        Swal.fire('สำเร็จ!', 'บันทึกข้อมูลลงฐานข้อมูลแล้ว', 'success');
        updateScanHistory(studentData); // อัปเดตประวัติหน้าเว็บ
    })
    .catch(error => {
        console.error('Error!', error.message);
        Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    });
}
