function convertSheetToJsonInR2() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  
  const data = sheet.getRange(2, 1, lastRow - 1, 16).getValues();
  
  const result = [];
  
  let currentAssociation = "";
  let currentDepartment = "";
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    if (row[0] && row[0].toString().trim() !== "") {
      currentAssociation = row[0].toString().trim();
    }
    
    if (row[1] && row[1].toString().trim() !== "") {
      currentDepartment = row[1].toString().trim();
    }
    
    const societyName = row[2] ? row[2].toString().trim() : "";
    if (!societyName) continue;
    
    const item = {
      "association": currentAssociation,
      "department": currentDepartment,
      "society-name": societyName,
      "society-chair": row[3] ? row[3].toString().trim() : "",
      "society-secretary": row[4] ? row[4].toString().trim() : "",
      "society-publicity": row[5] ? row[5].toString().trim() : "",
      "society-founder": row[6] ? row[6].toString().trim() : "",
      "desc1": row[7] ? row[7].toString().trim() : "",
      "desc2": row[8] ? row[8].toString().trim() : "",
      "desc3": row[9] ? row[9].toString().trim() : "",
      "link-teacher": row[10] ? row[10].toString().trim() : "",
      "meetingroom": row[11] ? row[11].toString().trim() : "",
      "meetingtime": row[12] ? row[12].toString().trim() : "",
      "signup-form": row[13] ? row[13].toString().trim() : "",
      "media-links": row[14] ? row[14].toString().trim() : "",
      "color": row[15] ? row[15].toString().trim() : "",
    };
    
    result.push(item);
  }
  
  sheet.getRange("R2").setValue(JSON.stringify(result, null, 2));
}
