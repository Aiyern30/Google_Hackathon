function doPost(e) {
  try {
    // Parse the request payload
    const data = JSON.parse(e.postData.contents);
    const username = data.username;
    const password = data.password;

    Logger.log('Received username: ' + username);
    Logger.log('Received password: ' + password);

    // Open the spreadsheet by ID and get the specific sheet
    const sheet = SpreadsheetApp.openById('1UXlJaRPzqXaPvvu8GqkPxdz1-P1Zi1t-06MRyhazirg').getSheetByName('Sheet1');

    // Get the values from cells A1 and B1
    const cellA1 = sheet.getRange('A1').getValue();
    const cellB1 = sheet.getRange('B1').getValue();

    Logger.log('Value of A1: ' + cellA1);
    Logger.log('Value of B1: ' + cellB1);

    // Check if provided username and password match the values in A1 and B1
    const valid = (username === cellA1 && password === cellB1);

    if (valid) {
      return ContentService.createTextOutput(JSON.stringify({ valid: true }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ valid: false }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log('Error: ' + error);
    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid request' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
