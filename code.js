function doGet(e) {
  return ContentService.createTextOutput("Media Faculty API Running");
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  
  if (action === "login") return checkLogin(data.code, data.password);
  if (action === "addStudent") return addStudent(data.student);
  if (action === "getStudents") return getStudents();
  if (action === "banStudent") return banStudent(data.code, data.status);
  if (action === "saveAttendanceSettings") return saveAttendanceSettings(data.settings);
  if (action === "registerAttendance") return registerAttendance(data.attendance);
  if (action === "sendNotice") return sendNotice(data.notice);
  if (action === "sendComplaint") return sendComplaint(data.complaint);
  
  return responseJSON({ status: "error", message: "طلب غير معروف" });
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkLogin(code, pass) {
  // الحساب التجريبي السريع المباشر الذي طلبته
  if (code === "admin" && pass === "5656") {
    return responseJSON({
      status: "success",
      student: {
        code: "admin",
        name: "طالب تجريبي (أحمد عمار)",
        phone: "01000000000",
        grade: "الفرقة الرابعة - كلية الإعلام",
        status: "نشط"
      }
    });
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Students");
  if (!sheet) return responseJSON({ status: "error", message: "تأكد من إنشاء تبويب Students في شيت جوجل" });
  
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == code && rows[i][4] == pass) {
      if (rows[i][5] === "محظور") {
        return responseJSON({ status: "error", message: "هذا الحساب محظور من الإدارة" });
      }
      return responseJSON({ status: "success", student: { code: rows[i][0], name: rows[i][1], phone: rows[i][2], grade: rows[i][3], status: rows[i][5] } });
    }
  }
  return responseJSON({ status: "error", message: "بيانات الدخول غير صحيحة" });
}

function addStudent(st) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Students");
  sheet.appendRow([st.code, st.name, st.phone, st.grade, st.pass, "نشط", new Date()]);
  return responseJSON({ status: "success", message: "تم إضافة الطالب بنجاح" });
}

function getStudents() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Students");
  var rows = sheet.getDataRange().getValues();
  var students = [];
  for (var i = 1; i < rows.length; i++) {
    students.push({ code: rows[i][0], name: rows[i][1], phone: rows[i][2], grade: rows[i][3], status: rows[i][5], lastLogin: rows[i][6] });
  }
  return responseJSON({ status: "success", students: students });
}

function banStudent(code, status) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Students");
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == code) {
      sheet.getRange(i + 1, 6).setValue(status);
      return responseJSON({ status: "success", message: "تم تحديث حالة الطالب" });
    }
  }
  return responseJSON({ status: "error", message: "الطالب غير موجود" });
}

function saveAttendanceSettings(s) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  sheet.appendRow([s.subject, s.secret, s.lat, s.lng, s.radius, new Date()]);
  return responseJSON({ status: "success", message: "تم حفظ إعدادات المحاضرة بنجاح" });
}

function registerAttendance(att) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Attendance");
  sheet.appendRow([new Date(), att.studentCode, att.studentName, att.subject, att.lat, att.lng]);
  return responseJSON({ status: "success", message: "تم تسجيل الحضور بنجاح" });
}

function sendNotice(n) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Notices");
  sheet.appendRow([new Date(), n.title, n.message]);
  return responseJSON({ status: "success", message: "تم إرسال التنبيه للطلاب" });
}

function sendComplaint(c) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Complaints");
  sheet.appendRow([new Date(), c.code, c.name, c.text]);
  return responseJSON({ status: "success", message: "تم إرسال الشكوى للإدارة بنجاح" });
}
