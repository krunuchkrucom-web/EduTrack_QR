function showDashboard() {
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <div class="row g-4 mb-5">
            <div class="col-md-4">
                <div class="card p-4 border-0 shadow-sm rounded-4 text-white" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                    <div class="d-flex align-items-center">
                        <div class="bg-white bg-opacity-25 p-3 rounded-circle me-3"><i class="fa-solid fa-camera fs-3"></i></div>
                        <div><h5 class="mb-0 fw-bold">สแกนเข้าเรียน</h5><small>เริ่มสแกน QR Code</small></div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card p-4 border-0 shadow-sm rounded-4 text-white" style="background: linear-gradient(135deg, #10b981, #059669);">
                    <div class="d-flex align-items-center">
                        <div class="bg-white bg-opacity-25 p-3 rounded-circle me-3"><i class="fa-solid fa-user-plus fs-3"></i></div>
                        <div><h5 class="mb-0 fw-bold">เพิ่มนักเรียน</h5><small>ลงทะเบียนนักเรียนใหม่</small></div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card p-4 border-0 shadow-sm rounded-4 text-white" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                    <div class="d-flex align-items-center">
                        <div class="bg-white bg-opacity-25 p-3 rounded-circle me-3"><i class="fa-solid fa-chart-pie fs-3"></i></div>
                        <div><h5 class="mb-0 fw-bold">ดูรายงาน</h5><small>สรุปข้อมูลการเข้าเรียน</small></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-8">
                <h6 class="fw-bold mb-3">เลือกห้องเรียน</h6>
                <div class="row g-3 mb-4">
                    <div class="col-md-3"><button class="btn btn-primary w-100 p-3 rounded-4 shadow-sm fw-bold">ปวช.1/1<br><small class="fw-normal">32 คน</small></button></div>
                    <div class="col-md-3"><button class="btn btn-success w-100 p-3 rounded-4 shadow-sm fw-bold">ปวช.1/2<br><small class="fw-normal">28 คน</small></button></div>
                    <div class="col-md-3"><button class="btn btn-warning w-100 p-3 rounded-4 shadow-sm fw-bold text-white">ปวช.3/5<br><small class="fw-normal">30 คน</small></button></div>
                    <div class="col-md-3"><button class="btn btn-danger w-100 p-3 rounded-4 shadow-sm fw-bold">ปวช.3/1<br><small class="fw-normal">25 คน</small></button></div>
                </div>

                <div class="card border-0 shadow-sm rounded-4 p-4">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h5 class="fw-bold mb-0">ห้องเรียน: ปวช.1/1 <span class="badge bg-light text-primary rounded-pill">32 คน</span></h5>
                        <div>
                            <button class="btn btn-primary btn-sm rounded-pill px-3"><i class="fa-solid fa-camera me-1"></i> สแกนเข้าเรียน</button>
                            <button class="btn btn-success btn-sm rounded-pill px-3"><i class="fa-solid fa-plus me-1"></i> เพิ่มนักเรียน</button>
                        </div>
                    </div>
                    <table class="table align-middle">
                        <thead class="table-light">
                            <tr><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>USERNAME</th><th>สถานะ</th><th>จัดการ</th></tr>
                        </thead>
                        <tbody id="student-list-area">
                            <tr><td>S001</td><td>นายกิตติพงษ์ ใจดี</td><td>S001</td><td><span class="text-success">● มาเรียน</span></td><td><i class="fa-solid fa-pen-to-square text-primary me-2"></i><i class="fa-solid fa-trash text-danger"></i></td></tr>
                            <tr><td>S002</td><td>สมศักดิ์ มีเกียรติ</td><td>S002</td><td><span class="text-success">● มาเรียน</span></td><td><i class="fa-solid fa-pen-to-square text-primary me-2"></i><i class="fa-solid fa-trash text-danger"></i></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
                    <h6 class="fw-bold">สรุปภาพรวมวันนี้</h6>
                    <small class="text-muted mb-3 d-block">23 พฤษภาคม 2567</small>
                    <div class="text-center py-3">
                        <img src="https://quickchart.io/chart?c={type:'doughnut',data:{labels:['มา','สาย','ขาด','ลา'],datasets:[{data:[132,12,8,6],backgroundColor:['%2310b981','%23f59e0b','%23ef4444','%233b82f6']}]},options:{plugins:{legend:{display:false}}}}" width="150">
                        <h4 class="mt-2 mb-0">158</h4><small class="text-muted">คน</small>
                    </div>
                </div>
                <div class="card border-0 shadow-sm rounded-4 p-4">
                    <h6 class="fw-bold mb-3">กิจกรรมล่าสุด</h6>
                    <div class="recent-list">
                        <div class="d-flex mb-3 small">
                            <div class="bg-success bg-opacity-10 text-success p-2 rounded me-3"><i class="fa-solid fa-camera"></i></div>
                            <div><strong>สแกนเข้าเรียน</strong><br><span class="text-muted">นายสมศักดิ์ มีเกียรติ</span></div>
                            <div class="ms-auto text-muted">08:15</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
