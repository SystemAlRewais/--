// كود الخلفية للربط مع Google Sheets
function doGet(e) {
  return ContentService.createTextOutput("Media Faculty API Running");
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  var sheet = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "login") {
    return checkLogin(data.code, data.password);
  } else if (action === "adminLogin") {
    if(data.password === "44554455") {
      return responseJSON({ status: "success", role: "admin" });
    }
    return responseJSON({ status: "error", message: "كلمة المرور غير صحيحة" });
  } else if (action === "addStudent") {
    return addStudent(data.student);
  } else if (action === "registerAttendance") {
    return registerAttendance(data.attendance);
  }
  
  return responseJSON({ status: "error", message: "طلب غير معروف" });
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkLogin(code, pass) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Students");
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == code && rows[i][4] == pass) { // الكود وكلمة السر
      return responseJSON({
        status: "success",
        student: {
          code: rows[i][0],
          name: rows[i][1],
          phone: rows[i][2],
          grade: rows[i][3],
          status: rows[i][5]
        }
      });
    }
  }
  return responseJSON({ status: "error", message: "بيانات الدخول غير صحيحة" });
}

function addStudent(student) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Students");
  sheet.appendRow([student.code, student.name, student.phone, student.grade, student.pass, "نشط"]);
  return responseJSON({ status: "success" });
}

function registerAttendance(att) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Attendance");
  sheet.appendRow([new Date(), att.studentCode, att.studentName, att.subject, att.lat, att.lng]);
  return responseJSON({ status: "success", message: "تم تسجيل الحضور بنجاح" });
}
