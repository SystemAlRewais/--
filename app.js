const SCRIPT_URL = "ضع_رابط_ويب_أب_سكريبت_جوجل_هنا";

function switchTab(type) {
    if (type === 'student') {
        document.getElementById('studentLoginForm').style.display = 'block';
        document.getElementById('adminLoginForm').style.display = 'none';
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.remove('active');
    } else {
        document.getElementById('studentLoginForm').style.display = 'none';
        document.getElementById('adminLoginForm').style.display = 'block';
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.remove('active');
    }
}

function handleStudentLogin(e) {
    e.preventDefault();
    const code = document.getElementById('studentCode').value.trim();
    const pass = document.getElementById('studentPass').value.trim();

    // التحقق المحلي الفوري للحساب التجريبي الذي طلبته
    if (code === "admin" && pass === "5656") {
        const testStudent = { code: "admin", name: "طالب تجريبي (أحمد عمار)", phone: "01000000000", grade: "الفرقة الرابعة", status: "نشط" };
        localStorage.setItem('user', JSON.stringify(testStudent));
        window.location.href = 'dashboard.html';
        return;
    }

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'login', code: code, password: pass })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            localStorage.setItem('user', JSON.stringify(data.student));
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message);
        }
    }).catch(() => alert("تأكد من ربط سحابة جوجل بشكل صحيح!"));
}

function handleAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById('adminPass').value;
    if (pass === "44554455") {
        window.location.href = 'admin.html';
    } else {
        alert("كلمة مرور الإدارة غير صحيحة!");
    }
}

// إذا كان الطالب في صفحة الظهر يتم جلب بياناته وعرضها
window.onload = function() {
    if (window.location.pathname.includes('dashboard.html')) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            document.getElementById('displayName').innerText = user.name;
            document.getElementById('displayCode').innerText = user.code;
            document.getElementById('displayGrade').innerText = user.grade;
        } else {
            window.location.href = 'index.html';
        }
    }
    if (window.location.pathname.includes('admin.html')) {
        loadStudentsList();
    }
};

function createStudent() {
    const name = document.getElementById('newName').value;
    const phone = document.getElementById('newPhone').value;
    const grade = document.getElementById('newGrade').value;
    const code = 'AZHR-' + Math.floor(1000 + Math.random() * 9000);
    const pass = Math.floor(100000 + Math.random() * 900000).toString();

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'addStudent', student: { code, name, phone, grade, pass } })
    })
    .then(res => res.json())
    .then(data => {
        alert(`${data.message}\nالكود: ${code}\nكلمة المرور: ${pass}`);
        loadStudentsList();
    });
}

function loadStudentsList() {
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getStudents' })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            let tbody = document.getElementById('studentsTableBody');
            tbody.innerHTML = '';
            data.students.forEach(st => {
                tbody.innerHTML += `<tr>
                    <td>${st.code}</td>
                    <td>${st.name}</td>
                    <td>${st.phone}</td>
                    <td>${st.grade}</td>
                    <td><b>${st.status}</b></td>
                    <td>${st.lastLogin || 'حديث'}</td>
                    <td><button onclick="toggleBan('${st.code}', '${st.status === 'نشط' ? 'محظور' : 'نشط'}')" style="padding:6px 12px; background:${st.status === 'نشط' ? '#ef4444' : '#10b981'}">${st.status === 'نشط' ? 'حظر' : 'تفعيل'}</button></td>
                </tr>`;
            });
        }
    });
}

function toggleBan(code, newStatus) {
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'banStudent', code, status: newStatus })
    }).then(res => res.json()).then(data => {
        alert(data.message);
        loadStudentsList();
    });
}

function saveGeoSettings() {
    const subject = document.getElementById('setSubject').value;
    const secret = document.getElementById('setSecret').value;
    const lat = document.getElementById('setLat').value;
    const lng = document.getElementById('setLng').value;
    const radius = document.getElementById('setMaxMeters').value;

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'saveAttendanceSettings', settings: { subject, secret, lat, lng, radius } })
    }).then(res => res.json()).then(data => alert(data.message));
}

function verifyAndRegisterGPS() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const user = JSON.parse(localStorage.getItem('user'));
            const subject = document.getElementById('attendanceSubject').value;
            fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'registerAttendance',
                    attendance: { studentCode: user.code, studentName: user.name, subject, lat: position.coords.latitude, lng: position.coords.longitude }
                })
            }).then(res => res.json()).then(data => alert(data.message));
        }, () => alert("يرجى السماح بتحديد الموقع الجغرافي لتسجيل الحضور."));
    } else {
        alert("متصفحك لا يدعم خاصية تحديد الموقع.");
    }
}

function submitComplaint() {
    const user = JSON.parse(localStorage.getItem('user'));
    const text = document.getElementById('complaintText').value;
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'sendComplaint', complaint: { code: user.code, name: user.name, text } })
    }).then(res => res.json()).then(data => alert(data.message));
}

function publishNotice() {
    const title = document.getElementById('noticeTitle').value;
    const message = document.getElementById('noticeMsg').value;
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'sendNotice', notice: { title, message } })
    }).then(res => res.json()).then(data => alert(data.message));
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
