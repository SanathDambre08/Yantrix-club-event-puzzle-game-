# How to Connect the Puzzle Game to Google Sheets

Since we already have a robust database (Supabase) powering the leaderboard, the easiest way to *also* collect all data into a Google Spreadsheet is to send a "Webhook" to your Google Sheet every time a student finishes a game!

## Step 1: Prepare your Google Sheet
1. Go to [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. In the first row, add these exact headers in columns A through F:
   - `Timestamp`
   - `Name`
   - `Email`
   - `School`
   - `Time (Seconds)`
   - `Moves`
   - `Score`

## Step 2: Add the Apps Script
1. In your Google Sheet menu, click **Extensions** > **Apps Script**.
2. Delete any code there and paste this exact code:

```javascript
const SHEET_NAME = 'Sheet1'; // Change this if you rename your sheet tab

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date(),           // Timestamp
      data.name,            // Name
      data.email,           // Email
      data.school,          // School
      data.time_seconds,    // Time (Seconds)
      data.moves,           // Moves
      data.score            // Score
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Step 3: Deploy and get your Webhook URL
1. Click the blue **Deploy** button at the top right, then **New deployment**.
2. Click the **gear icon** next to "Select type" and choose **Web app**.
3. Under "Execute as", choose **Me**.
4. Under "Who has access", choose **Anyone**.
5. Click **Deploy** (you will need to authorize the script).
6. Copy the **Web app URL** that it gives you.

## Step 4: Tell me the URL!
Reply to me with the **Web app URL** you copied, and I will instantly connect the game so that every time a student solves the puzzle, their exact name, email, time, and score drops right into your spreadsheet!
