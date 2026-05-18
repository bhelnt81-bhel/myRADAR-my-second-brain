// ==========================================
// myRADAR - Telegram to Google Sheets Webhook
// ==========================================
// 1. Create a Google Sheet named "myRADAR_Tasks"
// 2. Go to Extensions > Apps Script
// 3. Paste this code
// 4. Deploy > New Deployment > Web App (Execute as: You, Access: Anyone)
// 5. Copy the Web App URL
// 6. Set your Telegram Bot Webhook to point to this URL:
//    https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_WEB_APP_URL>

const TELEGRAM_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Extract from your Google Sheet URL

// This handles incoming messages from Telegram
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const message = contents.message;
    
    // Only process text messages
    if (message && message.text) {
      const text = message.text;
      const chatId = message.chat.id;
      
      // Auto-assign domain based on keywords
      let domain = "Personal";
      let domainColor = "#ec4899";
      
      if (text.toLowerCase().includes("bhel") || text.toLowerCase().includes("ac") || text.toLowerCase().includes("note")) {
        domain = "BHEL";
        domainColor = "var(--accent-bhel)";
      } else if (text.toLowerCase().includes("client") || text.toLowerCase().includes("intimus")) {
        domain = "Intimus";
        domainColor = "var(--accent-intimus)";
      } else if (text.toLowerCase().includes("study") || text.toLowerCase().includes("emba") || text.toLowerCase().includes("case")) {
        domain = "Academic";
        domainColor = "var(--accent-academic)";
      }
      
      // Default to medium urgency and importance for quick capture
      const task = {
        id: new Date().getTime(),
        title: text,
        domain: domain,
        domainColor: domainColor,
        urgency: "Medium",
        importance: "Medium",
        energy: "Medium",
        time: "15m",
        status: "pending",
        deadlineDays: 7,
        createdAt: new Date().toISOString()
      };
      
      // Save to Google Sheet
      const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Tasks');
      // Format: [id, title, domain, urgency, importance, energy, time, status, deadlineDays, createdAt]
      sheet.appendRow([
        task.id, 
        task.title, 
        task.domain, 
        task.urgency, 
        task.importance, 
        task.energy, 
        task.time, 
        task.status, 
        task.deadlineDays, 
        task.createdAt
      ]);
      
      // Send confirmation back to Telegram
      sendMessage(chatId, `✅ Captured to myRADAR: [${domain}] ${text}`);
    }
    
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    
  } catch (error) {
    return ContentService.createTextOutput("Error").setMimeType(ContentService.MimeType.TEXT);
  }
}

// Helper to send message back to Telegram
function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text
  };
  
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };
  
  UrlFetchApp.fetch(url, options);
}

// Function to serve tasks to the PWA (to replace localStorage eventually)
function doGet(e) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Tasks');
  const data = sheet.getDataRange().getValues();
  
  // Skip header row if exists
  const startIndex = data[0][0] === 'id' ? 1 : 0;
  
  const tasks = [];
  for (let i = startIndex; i < data.length; i++) {
    tasks.push({
      id: data[i][0],
      title: data[i][1],
      domain: data[i][2],
      urgency: data[i][3],
      importance: data[i][4],
      energy: data[i][5],
      time: data[i][6],
      status: data[i][7],
      deadlineDays: data[i][8],
      createdAt: data[i][9]
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify(tasks))
    .setMimeType(ContentService.MimeType.JSON);
}
