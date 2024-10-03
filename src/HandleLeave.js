function doPost(e) {
  try {
    Logger.log('doPost started');
    const requestBody = JSON.parse(e.postData.contents);
    const { name, email, employeeID, status, startDate, endDate, action } = requestBody;

    Logger.log(`Received Employee ID: ${employeeID}`);

    const spreadsheetId = '1UXlJaRPzqXaPvvu8GqkPxdz1-P1Zi1t-06MRyhazirg';

    // Update Take Leave Sheet
    const takeLeaveSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Take Leave');
    const takeLeaveData = takeLeaveSheet.getDataRange().getValues();
    const takeLeaveStatusColumnIndex = takeLeaveData[0].indexOf('Status'); // Get the index of the "Status" column

    if (takeLeaveStatusColumnIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Status column not found in Take Leave sheet' })).setMimeType(ContentService.MimeType.JSON);
    }

    let takeLeaveUpdated = false;

    for (let i = 1; i < takeLeaveData.length; i++) { // Start from 1 to skip header row
      if (String(takeLeaveData[i][3]) === String(employeeID)) { // Assuming Employee ID is in the 4th column (index 3)
        // Update the status based on action
        if (action === 'Approve') {
          takeLeaveSheet.getRange(i + 1, takeLeaveStatusColumnIndex + 1).setValue('Approved');
          Logger.log(`Updated row ${i + 1} in Take Leave sheet with new status: Approved`);
        } else if (action === 'Reject') {
          takeLeaveSheet.getRange(i + 1, takeLeaveStatusColumnIndex + 1).setValue('Rejected');
          Logger.log(`Updated row ${i + 1} in Take Leave sheet with new status: Rejected`);
        }
        takeLeaveUpdated = true;
        break;
      }
    }

    if (!takeLeaveUpdated) {
      Logger.log(`Employee ID ${employeeID} not found in Take Leave sheet`);
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Employee ID not found in Take Leave sheet' })).setMimeType(ContentService.MimeType.JSON);
    }

    // Update Sheet2 Leave Status
    const sheet2 = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Sheet2');
    const sheet2Data = sheet2.getDataRange().getValues();
    const sheet2StatusColumnIndex = 7; // Assuming status column index is 7

    let sheet2Updated = false;

    for (let i = 1; i < sheet2Data.length; i++) {
      if (String(sheet2Data[i][0]) === String(employeeID)) { // Assuming Employee ID is in the 1st column (index 0)
        if (action === 'Approve') {
          sheet2.getRange(i + 1, sheet2StatusColumnIndex + 1).setValue('On Leave');
          Logger.log(`Updated row ${i + 1} in Sheet2 with Leave Status: On Leave`);
        } else if (action === 'Reject') {
          sheet2.getRange(i + 1, sheet2StatusColumnIndex + 1).setValue('Active');
        }
        sheet2Updated = true;
        break;
      }
    }

    if (!sheet2Updated) {
      Logger.log(`Employee ID ${employeeID} not found in Sheet2`);
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Employee ID not found in Sheet2' })).setMimeType(ContentService.MimeType.JSON);
    }

    // Send Email based on action
    try {
      const subject = action === 'Approve' ? "Leave Approved" : "Leave Request Rejected";
      
      // Format the start and end dates
      const formattedStartDate = formatDate(new Date(startDate));
      const formattedEndDate = formatDate(new Date(endDate));
      
      const message = `Dear ${name},\n\n` +
                      `Your leave request has been ${action === 'Approve' ? 'approved' : 'rejected'}.\n` +
                      `Start Date: ${formattedStartDate}\n` +
                      `End Date: ${formattedEndDate}\n\n` +
                      `Thank you,\n` +
                      `Your HR Team`;
      
      MailApp.sendEmail(email, subject, message);
    } catch (error) {
      Logger.log(`Error sending email: ${error.message}`);
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: `Failed to send email: ${error.message}` })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', newStatus: action === 'Approve' ? 'On Leave' : 'Active' })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log(`Error in doPost: ${error.message}`);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper function to format the date
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}
