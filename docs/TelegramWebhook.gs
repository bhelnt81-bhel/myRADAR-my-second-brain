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

// Helper to initialize Tasks sheet
function getTasksSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Tasks');
  if (!sheet) {
    sheet = ss.insertSheet('Tasks');
  }
  
  // Update headers if needed
  const headers = [
    'id', 'title', 'domain', 'urgency', 'importance', 
    'energy', 'time', 'status', 'deadlineDays', 'createdAt',
    'priorityScore', 'quadrant', 'microAction', 'timeBlockSuggestion', 'subtasks'
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    // Ensure all headers exist
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (currentHeaders.length < headers.length) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }
  return sheet;
}

// Helper to initialize Metadata sheet
function getMetadataSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Metadata');
  if (!sheet) {
    sheet = ss.insertSheet('Metadata');
    sheet.appendRow(['key', 'value']);
  }
  return sheet;
}

// Serve tasks and metadata to PWA (GET request)
function doGet(e) {
  try {
    const sheet = getTasksSheet();
    const data = sheet.getDataRange().getValues();
    const tasks = [];
    
    // Header is row 0
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      
      let subtasks = [];
      try { if (data[i][14]) subtasks = JSON.parse(data[i][14]); } catch (e) {}

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
        createdAt: data[i][9],
        priorityScore: Number(data[i][10]) || 0,
        quadrant: data[i][11] || '',
        microAction: data[i][12] || '',
        timeBlockSuggestion: data[i][13] || '',
        subtasks: subtasks
      });
    }
    
    const metaSheet = getMetadataSheet();
    const metaDataRange = metaSheet.getDataRange().getValues();
    const metadata = { aiInsight: '', top3Ids: [], energyLevel: null };
    
    for (let i = 1; i < metaDataRange.length; i++) {
      const key = metaDataRange[i][0];
      const val = metaDataRange[i][1];
      if (key === 'aiInsight') metadata.aiInsight = val;
      if (key === 'top3Ids') { try { metadata.top3Ids = JSON.parse(val); } catch (e) {} }
      if (key === 'energyLevel') metadata.energyLevel = val;
    }
    
    return createJsonResponse({ tasks, metadata });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

// Update or set a metadata key
function setMetadata(key, value) {
  const sheet = getMetadataSheet();
  const data = sheet.getDataRange().getValues();
  let found = false;
  const strValue = typeof value === 'object' ? JSON.stringify(value) : value;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(strValue);
      found = true;
      break;
    }
  }
  if (!found) {
    sheet.appendRow([key, strValue]);
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
        newId, task.title, task.domain || 'BHEL', task.urgency || 'Medium',
        task.importance || 'Medium', task.energy || 'Medium', task.time || '30m',
        task.status || 'pending', task.deadlineDays || 7, createdAt,
        task.priorityScore || '', task.quadrant || '', task.microAction || '', 
        task.timeBlockSuggestion || '', task.subtasks ? JSON.stringify(task.subtasks) : ''
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
          sheet.getRange(i + 1, 8).setValue(status); // Status is column H (8th)
          updated = true;
          break;
        }
      }
      return createJsonResponse({ success: updated });
    }
    
    if (contents.action === 'updateTask') {
      const { id, updates } = contents;
      const sheet = getTasksSheet();
      const data = sheet.getDataRange().getValues();
      let updated = false;
      
      for (let i = 1; i < data.length; i++) {
        if (Number(data[i][0]) === Number(id)) {
          const r = i + 1;
          if (updates.title !== undefined) sheet.getRange(r, 2).setValue(updates.title);
          if (updates.domain !== undefined) sheet.getRange(r, 3).setValue(updates.domain);
          if (updates.urgency !== undefined) sheet.getRange(r, 4).setValue(updates.urgency);
          if (updates.importance !== undefined) sheet.getRange(r, 5).setValue(updates.importance);
          if (updates.energy !== undefined) sheet.getRange(r, 6).setValue(updates.energy);
          if (updates.time !== undefined) sheet.getRange(r, 7).setValue(updates.time);
          if (updates.status !== undefined) sheet.getRange(r, 8).setValue(updates.status);
          if (updates.deadlineDays !== undefined) sheet.getRange(r, 9).setValue(updates.deadlineDays);
          
          if (updates.priorityScore !== undefined) sheet.getRange(r, 11).setValue(updates.priorityScore);
          if (updates.quadrant !== undefined) sheet.getRange(r, 12).setValue(updates.quadrant);
          if (updates.microAction !== undefined) sheet.getRange(r, 13).setValue(updates.microAction);
          if (updates.timeBlockSuggestion !== undefined) sheet.getRange(r, 14).setValue(updates.timeBlockSuggestion);
          if (updates.subtasks !== undefined) sheet.getRange(r, 15).setValue(JSON.stringify(updates.subtasks));
          updated = true;
          break;
        }
      }
      return createJsonResponse({ success: updated });
    }
    
    if (contents.action === 'syncPriorities') {
      const { tasks, insight, top3Ids, energyLevel } = contents;
      const sheet = getTasksSheet();
      const data = sheet.getDataRange().getValues();
      
      // Update metadata
      if (insight !== undefined) setMetadata('aiInsight', insight);
      if (top3Ids !== undefined) setMetadata('top3Ids', top3Ids);
      if (energyLevel !== undefined) setMetadata('energyLevel', energyLevel);
      
      // Batch updates where possible
      for (let j = 0; j < tasks.length; j++) {
        const t = tasks[j];
        for (let i = 1; i < data.length; i++) {
          if (Number(data[i][0]) === Number(t.id)) {
            const r = i + 1;
            sheet.getRange(r, 4).setValue(t.urgency || '');
            sheet.getRange(r, 5).setValue(t.importance || '');
            sheet.getRange(r, 11).setValue(t.priorityScore || 0);
            sheet.getRange(r, 12).setValue(t.quadrant || '');
            sheet.getRange(r, 13).setValue(t.microAction || '');
            sheet.getRange(r, 14).setValue(t.timeBlockSuggestion || '');
            break;
          }
        }
      }
      return createJsonResponse({ success: true });
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
    task.id, task.title, task.domain, task.urgency, task.importance,
    task.energy, task.time, task.status, task.deadlineDays, task.createdAt,
    '', '', '', '', ''
  ]);
  
  sendMessage(chatId, `✅ Captured to myRADAR: [${domain}] ${text}`);
  return createJsonResponse({ success: true });
}

// Send message to Telegram Bot API
function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload = { chat_id: chatId, text: text };
  
  try {
    UrlFetchApp.fetch(url, { method: "post", contentType: "application/json", payload: JSON.stringify(payload) });
  } catch (err) {
    Logger.log("Failed to send Telegram message: " + err.toString());
  }
}
