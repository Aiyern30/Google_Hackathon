function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById('1UXlJaRPzqXaPvvu8GqkPxdz1-P1Zi1t-06MRyhazirg').getSheetByName('Resume');
    if (!sheet) {
      throw new Error('Sheet not found');
    }
    const data = sheet.getDataRange().getValues();

    // Exclude the first row (header) and map the data to key-value pairs
    const headers = data[0];
    const result = data.slice(1).map(row => {
      let obj = {};
      row.forEach((cell, index) => {
        obj[headers[index]] = cell;
      });
      return obj;
    });

    // Log the resulting JSON
    Logger.log('Resulting data:', JSON.stringify(result));

    // Return all data as JSON
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error:', error.message);
    return ContentService.createTextOutput(JSON.stringify({ error: 'Internal Server Error' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
