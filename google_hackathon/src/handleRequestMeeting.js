function doPost(e) {
  const sheet = SpreadsheetApp.openById('1UXlJaRPzqXaPvvu8GqkPxdz1-P1Zi1t-06MRyhazirg').getSheetByName('Resume');
  const requestBody = JSON.parse(e.postData.contents);

  // Inner function to find the row by ID
  function findRowById(sheet, id) {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == id) {
        return i + 1;
      }
    }
    return -1;
  }

  // Inner function to update employee details
  function updateEmployee(sheet, requestBody) {
    const row = findRowById(sheet, requestBody.id);

    if (row !== -1) {
      sheet.getRange(row, 2).setValue(requestBody.name);
      sheet.getRange(row, 3).setValue(requestBody.position);
      sheet.getRange(row, 4).setValue(requestBody.department);
      sheet.getRange(row, 5).setValue(requestBody.email);
      sheet.getRange(row, 6).setValue(requestBody.phone);
      sheet.getRange(row, 7).setValue(requestBody.hireDate);
      sheet.getRange(row, 8).setValue(requestBody.status);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ error: "Employee not found" })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Inner function to update status
  function updateStatus(sheet, requestBody) {
    const row = findRowById(sheet, requestBody.id);

    if (row !== -1) {
      sheet.getRange(row, 8).setValue(requestBody.status);
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ error: "Employee not found" })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Inner function to request meeting
  function requestMeeting(sheet, requestBody) {
    const row = findRowById(sheet, requestBody.recruitment.id);

    if (row !== -1) {
      sheet.getRange(row, 8).setValue('in progress');
      sheet.getRange(row, 9).setValue(requestBody.recruitment.date);
      sheet.getRange(row, 10).setValue(requestBody.recruitment.time);
      sheet.getRange(row, 11).setValue(requestBody.recruitment.message);
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ error: "Employee not found" })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Handle different actions
  switch (requestBody.action) {
    case "update":
      return updateEmployee(sheet, requestBody);
    case "updateStatus":
      return updateStatus(sheet, requestBody);
    case "requestMeeting":
      return requestMeeting(sheet, requestBody);
    default:
      return ContentService.createTextOutput(JSON.stringify({ error: "Invalid action" })).setMimeType(ContentService.MimeType.JSON);
  }
}
