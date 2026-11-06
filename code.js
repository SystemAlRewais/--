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
  if (action === "saveSettings") return saveSettings(data.settings);
  if (action === "getSettings") return getSettings();
  if (action === "saveAttendanceSettings") return saveAttendanceSettings(data.settings);
  if (action === "registerAttendance") return registerAttendance(data.attendance);
  if (action === "getPosts") return getPosts();
  if (action === "addPost") return addPost(data.post);
  if (action === "sendComplaint") return sendComplaint(data.complaint);
  
  return responseJSON({ status: "error", message: "طلب غير معروف" });
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkLogin(code, pass) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Students");
  if (!sheet) return responseJSON({ status: "error", message: "تأكد من إنشاء تبويب Students" });
  
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == code && rows[i][4] == pass) {
      if (rows[i][5] === "محظور") {
        return responseJSON({ status: "error", message: "هذا الحساب محظور من الإدارة" });
      }
      return responseJSON({ status: "success", student: { code: rows[i][0], name: rows[i][1], phone: rows[i][2], grade: rows[i][3], status: rows[i][5] } });
    }
  }
  return responseJSON({ status: "error", message: "بيانات الدخول غير صحيحة أو غير مسجلة" });
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

function saveSettings(s) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SiteSettings");
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("SiteSettings");
    sheet.appendRow(["Key", "Value"]);
  }
  sheet.clear();
  sheet.appendRow(["Key", "Value"]);
  sheet.appendRow(["siteTitle", s.siteTitle]);
  sheet.appendRow(["primaryColor", s.primaryColor]);
  sheet.appendRow(["academicYear", s.academicYear]);
  sheet.appendRow(["developers", s.developers]);
  return responseJSON({ status: "success", message: "تم تحديث إعدادات المنصة بنجاح" });
}

function getSettings() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SiteSettings");
  if (!sheet) return responseJSON({ status: "success", settings: {} });
  var rows = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < rows.length; i++) {
    settings[rows[i][0]] = rows[i][1];
  }
  return responseJSON({ status: "success", settings: settings });
}

function saveAttendanceSettings(s) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  sheet.appendRow([s.subject, s.secret, s.lat, s.lng, s.radius, new Date()]);
  return responseJSON({ status: "success", message: "تم حفظ إعدادات الحضور" });
}

function registerAttendance(att) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Attendance");
  sheet.appendRow([new Date(), att.studentCode, att.studentName, att.subject, att.lat, att.lng]);
  return responseJSON({ status: "success", message: "تم تسجيل الحضور بنجاح" });
}

function getPosts() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Community");
  if (!sheet) return responseJSON({ status: "success", posts: [] });
  var rows = sheet.getDataRange().getValues();
  var posts = [];
  for (var i = 1; i < rows.length; i++) {
    posts.push({ author: rows[i][0], text: rows[i][1], date: rows[i][2] });
  }
  return responseJSON({ status: "success", posts: posts.reverse() });
}

function addPost(p) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Community");
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Community");
    sheet.appendRow(["Author", "Text", "Date"]);
  }
  sheet.appendRow([p.author, p.text, new Date()]);
  return responseJSON({ status: "success", message: "تم نشر المنشور في المنتدى" });
}

function sendComplaint(c) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Complaints");
  sheet.appendRow([new Date(), c.code, c.name, c.text]);
  return responseJSON({ status: "success", message: "تم إرسال شكواك للإدارة" });
}
