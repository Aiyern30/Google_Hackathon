function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById('1UXlJaRPzqXaPvvu8GqkPxdz1-P1Zi1t-06MRyhazirg').getSheetByName('Sheet2');
    const data = sheet.getDataRange().getValues();

    // Exclude the first row (header)
    const result = data.slice(1);

    // Check if an ID parameter is provided
    const id = e.parameter.id;

    if (id) {
      // Filter data by the provided ID
      const filteredData = result.filter(row => row[0].toString() === id.toString()); // Adjust index based on your sheet layout
      return ContentService.createTextOutput(JSON.stringify(filteredData))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Return all data if no ID is provided
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error:', error);
    return ContentService.createTextOutput(JSON.stringify({ error: 'Internal Server Error' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
