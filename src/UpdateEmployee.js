function doPost(e) {
    const sheet = SpreadsheetApp.openById('1UXlJaRPzqXaPvvu8GqkPxdz1-P1Zi1t-06MRyhazirg').getSheetByName('Sheet2');
  const requestBody = JSON.parse(e.postData.contents);
  
  if (requestBody.action === "update") {
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
}

function findRowById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      return i + 1;
    }
  }
  return -1;
}
