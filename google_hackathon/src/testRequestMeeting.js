function doPost(e) {
  const sheet = SpreadsheetApp.openById('1UXlJaRPzqXaPvvu8GqkPxdz1-P1Zi1t-06MRyhazirg').getSheetByName('Resume');
  const requestBody = JSON.parse(e.postData.contents);
  
  const emailAddress = requestBody.emailAddress;
  const newStatus = requestBody.status;

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) { // Start from 1 to skip header row
    if (data[i][1] === emailAddress) { // Assuming email is in the second column (index 1)
      sheet.getRange(i + 1, 10).setValue(newStatus); // Assuming status is in the tenth column (index 9)
      return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Email not found'})).setMimeType(ContentService.MimeType.JSON);
}
