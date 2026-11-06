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

window.onload = function() {
    if (window.location.pathname.includes('dashboard.html')) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            document.getElementById('displayName').innerText = user.name;
            document.getElementById('displayCode').innerText = user.code;
            document.getElementById('displayGrade').innerText = user.grade;
            loadCommunityPosts();
        } else {
            window.location.href = 'index.html';
        }
    }
    if (window.location.pathname.includes('admin.html')) {
        loadStudentsList();
    }
};

function toggleChatbot() {
    const modal = document.getElementById('chatbotModal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function submitChatbotComplaint() {
    const user = JSON.parse(localStorage.getItem('user'));
    const text = document.getElementById('botComplaintText').value;
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'sendComplaint', complaint: { code: user.code, name: user.name, text } })
    }).then(res => res.json()).then(data => {
        alert(data.message);
        document.getElementById('botComplaintText').value = '';
        toggleChatbot();
    });
}

function publishPost() {
    const user = JSON.parse(localStorage.getItem('user'));
    const text = document.getElementById('postText').value;
    const isAnonymous = document.getElementById('anonymousCheck').checked;
    const author = isAnonymous ? "طالب مجهول (مستعار)" : user.name;

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'addPost', post: { author, text } })
    }).then(res => res.json()).then(data => {
        alert(data.message);
        document.getElementById('postText').value = '';
        loadCommunityPosts();
    });
}

function loadCommunityPosts() {
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getPosts' })
    }).then(res => res.json()).then(data => {
        if (data.status === 'success') {
            let feed = document.getElementById('communityFeed');
            feed.innerHTML = '';
            data.posts.forEach(p => {
                feed.innerHTML += `<div style="background:#f8fafc; padding:12px 16px; border-radius:10px; margin-bottom:10px; border-right:4px solid #0284c7;">
                    <b>${p.author}</b> <span style="font-size:11px; color:#64748b; float:left;">${p.date}</span>
                    <p style="margin:8px 0 0; font-size:14px;">${p.text}</p>
                </div>`;
            });
        }
    });
}

function createStudent() {
    const name = document.getElementById('newName').value;
    const phone = document.getElementById('newPhone').value;
    const grade = document.getElementById('newGrade').value;
    const code = 'AZHR-' + Math.floor(1000 + Math.random() * 9000);
    const pass = Math.floor(100000 + Math.random() * 900000).toString();

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'addStudent', student: { code, name, phone, grade, pass } })
    }).then(res => res.json()).then(data => {
        alert(`${data.message}\nالكود: ${code}\nكلمة المرور: ${pass}`);
        loadStudentsList();
    });
}

function loadStudentsList() {
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getStudents' })
    }).then(res => res.json()).then(data => {
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
                    <td>${st.lastLogin || 'نشط'}</td>
                    <td><button onclick="toggleBan('${st.code}', '${st.status === 'نشط' ? 'محظور' : 'نشط'}')" style="padding:5px 10px; background:${st.status === 'نشط' ? '#ef4444' : '#10b981'}">${st.status === 'نشط' ? 'حظر' : 'تفعيل'}</button></td>
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

function saveSiteSettings() {
    const siteTitle = document.getElementById('adminSiteTitle').value;
    const primaryColor = document.getElementById('adminPrimaryColor').value;
    const academicYear = document.getElementById('adminAcademicYear').value;
    const developers = document.getElementById('adminDevelopers').value;

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'saveSettings', settings: { siteTitle, primaryColor, academicYear, developers } })
    }).then(res => res.json()).then(data => alert(data.message));
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
        }, () => alert("يرجى السماح بتحديد الموقع الجغرافي."));
    } else {
        alert("متصفحك لا يدعم خاصية تحديد الموقع.");
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
