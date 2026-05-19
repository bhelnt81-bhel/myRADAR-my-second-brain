// ==========================================
// myRADAR - Telegram & PWA to Google Sheets Backend
// ==========================================
// 1. Create a Google Sheet named "myRADAR_Tasks"
// 2. Go to Extensions > Apps Script
// 3. Paste this code
// 4. Deploy > New Deployment > Web App (Execute as: You, Access: Anyone)
// 5. Copy the Web App URL and paste it into myRADAR Settings
// 6. Set your Telegram Bot Webhook to point to this URL:
//    https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_WEB_APP_URL>

const TELEGRAM_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Extract from your Google Sheet URL

// Helper to return JSON response with CORS headers
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper to initialize sheet with headers if empty
function getTasksSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Tasks');
  if (!sheet) {
    sheet = ss.insertSheet('Tasks');
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'id', 
      'title', 
      'domain', 
      'urgency', 
      'importance', 
      'energy', 
      'time', 
      'status', 
      'deadlineDays', 
      'createdAt'
    ]);
  }
  return sheet;
}

// Serve tasks to PWA (GET request)
function doGet(e) {
  try {
    const sheet = getTasksSheet();
    const data = sheet.getDataRange().getValues();
    const tasks = [];
    
    // Header is row 0
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      tasks.push({
        id: Number(data[i][0]),
        title: data[i][1],
        domain: data[i][2],
        urgency: data[i][3],
        importance: data[i][4],
        energy: data[i][5],
        time: data[i][6],
        status: data[i][7],
        deadlineDays: Number(data[i][8] || 7),
        createdAt: data[i][9]
      });
    }
    
    return createJsonResponse(tasks);
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

// Handle writes from PWA and Webhook from Telegram (POST request)
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ success: false, error: "Empty request body" });
    }
    
    const contents = JSON.parse(e.postData.contents);
    
    // 1. Handle Telegram Webhook
    if (contents.message && contents.message.text) {
      return handleTelegramMessage(contents.message);
    }
    
    // 2. Handle PWA actions
    if (contents.action === 'addTask') {
      const task = contents.task;
      const sheet = getTasksSheet();
      
      const newId = task.id || new Date().getTime();
      const createdAt = task.createdAt || new Date().toISOString();
      
      sheet.appendRow([
        newId,
        task.title,
        task.domain || 'BHEL',
        task.urgency || 'Medium',
        task.importance || 'Medium',
        task.energy || 'Medium',
        task.time || '30m',
        task.status || 'pending',
        task.deadlineDays || 7,
        createdAt
      ]);
      
      return createJsonResponse({ success: true, task: { ...task, id: newId, status: task.status || 'pending', createdAt } });
    }
    
    if (contents.action === 'updateTaskStatus') {
      const { id, status } = contents;
      const sheet = getTasksSheet();
      const data = sheet.getDataRange().getValues();
      let updated = false;
      
      for (let i = 1; i < data.length; i++) {
        if (Number(data[i][0]) === Number(id)) {
          sheet.getRange(i + 1, 8).setValue(status); // Status is column H (8th column)
          updated = true;
          break;
        }
      }
      
      return createJsonResponse({ success: updated });
    }
    
    return createJsonResponse({ success: false, error: "Unknown action" });
    
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

// Telegram Message Processing
function handleTelegramMessage(message) {
  const text = message.text;
  const chatId = message.chat.id;
  
  // Smart domain heuristics
  let domain = "Personal";
  if (text.toLowerCase().includes("bhel") || text.toLowerCase().includes("ac") || text.toLowerCase().includes("note")) {
    domain = "BHEL";
  } else if (text.toLowerCase().includes("client") || text.toLowerCase().includes("intimus")) {
    domain = "Intimus";
  } else if (text.toLowerCase().includes("study") || text.toLowerCase().includes("emba") || text.toLowerCase().includes("case")) {
    domain = "Academic";
  }
  
  const task = {
    id: new Date().getTime(),
    title: text,
    domain: domain,
    urgency: "Medium",
    importance: "Medium",
    energy: "Medium",
    time: "30m",
    status: "pending",
    deadlineDays: 7,
    createdAt: new Date().toISOString()
  };
  
  const sheet = getTasksSheet();
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
  
  sendMessage(chatId, `✅ Captured to myRADAR: [${domain}] ${text}`);
  return createJsonResponse({ success: true });
}

// Send message to Telegram Bot API
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
  
  try {
    UrlFetchApp.fetch(url, options);
  } catch (err) {
    Logger.log("Failed to send Telegram message: " + err.toString());
  }
}
