// ضع رابط الـ Web App المأخوذ من Google Apps Script هنا
const SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";

function switchTab(type) {
    if (type === 'student') {
        document.getElementById('studentLoginForm').style.display = 'block';
        document.getElementById('adminLoginForm').style.display = 'none';
    } else {
        document.getElementById('studentLoginForm').style.display = 'none';
        document.getElementById('adminLoginForm').style.display = 'block';
    }
}

// دخول الطالب
function handleStudentLogin(e) {
    e.preventDefault();
    const code = document.getElementById('studentCode').value;
    const pass = document.getElementById('studentPass').value;

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
    });
}

// دخول الأدمن
function handleAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById('adminPass').value;
    if (pass === "44554455") {
        window.location.href = 'admin.html';
    } else {
        alert("كلمة المرور غير صحيحة!");
    }
}

// تسجيل الحضور والغياب بالـ GPS وحساب المسافة
function registerAttendanceGPS() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            const user = JSON.parse(localStorage.getItem('user'));
            const subject = document.getElementById('subjectSelect').value;

            fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'registerAttendance',
                    attendance: {
                        studentCode: user.code,
                        studentName: user.name,
                        subject: subject,
                        lat: userLat,
                        lng: userLng
                    }
                })
            })
            .then(res => res.json())
            .then(data => alert(data.message));
        }, () => {
            alert("يرجى تفعيل صلاحية تحديد الموقع (GPS) للتسجيل!");
        });
    } else {
        alert("متصفحك لا يدعم تحديد الموقع الجغرافي.");
    }
}

// إنشاء طالب وتوليد كود عشوائي
function createStudentAccount() {
    const name = document.getElementById('newStudentName').value;
    const phone = document.getElementById('newStudentPhone').value;
    const grade = document.getElementById('newStudentGrade').value;
    const randomCode = 'AZHAR-' + Math.floor(1000 + Math.random() * 9000);
    const randomPass = Math.floor(100000 + Math.random() * 900000).toString();

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'addStudent',
            student: { code: randomCode, name: name, phone: phone, grade: grade, pass: randomPass }
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(`تم إنشاء الحساب بنجاح!\nالكود: ${randomCode}\nكلمة السر: ${randomPass}`);
    });
}
