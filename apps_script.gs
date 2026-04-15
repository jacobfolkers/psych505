/**
 * Balloon Session logger
 *
 * Deploy this file as a Google Apps Script web app, then paste the deployed
 * web app URL into APPS_SCRIPT_URL inside bart.html.
 *
 * Required Google setup:
 * 1. Create a Google Sheet.
 * 2. Paste your spreadsheet ID below.
 * 3. Deploy this Apps Script as a web app with access for anyone who has the link.
 *
 * The client sends only human participant data. Simulated player data is kept
 * separate in the browser and should never be posted here.
 */

const SPREADSHEET_ID = "1qJIPNIjrJ22HZefH9njjTSyPtCah869nXjei5zrDWTI";
const SHEET_NAME = "BalloonSessionLog";
const LOG_HEADERS = [
  "timestamp",
  "type",
  "participantId",
  "displayName",
  "round",
  "condition",
  "trial",
  "isPractice",
  "pumps",
  "popped",
  "pointsEarned",
  "teamScoreAfterTrial",
  "selfReportRiskTotal",
  "selfReportRiskAverage",
  "adjustedPumps",
  "popRate",
  "averageCashOut",
  "totalScore",
  "behavioralRiskIndividual",
  "behavioralRiskGroup3",
  "behavioralRiskGroup6",
  "overallBehavioralRisk",
  "popRateIndividual",
  "popRateGroup3",
  "popRateGroup6",
  "avgPointsIndividual",
  "avgPointsGroup3",
  "avgPointsGroup6",
  "selfReportPercent",
  "behaviorPercent",
  "differenceSelfReportVsBehavior"
];

function doGet(e) {
  try {
    const request = e && e.parameter ? e.parameter : {};
    const requestedSheet = String(request.sheet || "").trim();

    if (/^participants$/i.test(requestedSheet)) {
      const participantRows = getParticipantSummaryRows_();
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, rows: participantRows }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (/^trials$/i.test(requestedSheet)) {
      const trialRows = readSheetRows_(getOrCreateSheet_()).filter((row) => row.type === "trial");
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, rows: trialRows }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        message: "Balloon Session logger is live.",
        supportedSheets: ["Participants", "Trials"]
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse((e.postData && e.postData.contents) || "{}");
    const records = Array.isArray(payload.records) ? payload.records : [payload];
    const sheet = ensureLogSheetHeaders_(getOrCreateSheet_());

    records.forEach((record) => {
      sheet.appendRow([
        new Date(),
        record.type || "",
        record.participantId || "",
        record.displayName || "",
        record.round || "",
        record.condition || "",
        record.trial || "",
        record.isPractice === true ? true : record.isPractice === false ? false : "",
        record.pumps || "",
        record.popped === true ? true : record.popped === false ? false : "",
        record.pointsEarned || record.points || "",
        record.teamScoreAfterTrial || record.teamScoreAfter || "",
        record.selfReportRiskTotal || record.questionnaireTotal || "",
        record.selfReportRiskAverage || record.questionnaireAverage || "",
        record.adjustedPumps || "",
        record.popRate || "",
        record.averageCashOut || "",
        record.totalScore || "",
        record.behavioralRiskIndividual || "",
        record.behavioralRiskGroup3 || "",
        record.behavioralRiskGroup6 || "",
        record.overallBehavioralRisk || "",
        record.popRateIndividual || "",
        record.popRateGroup3 || "",
        record.popRateGroup6 || "",
        record.avgPointsIndividual || "",
        record.avgPointsGroup3 || "",
        record.avgPointsGroup6 || "",
        record.selfReportPercent || "",
        record.behaviorPercent || "",
        record.differenceSelfReportVsBehavior || ""
      ]);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, rowCount: records.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getParticipantSummaryRows_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const participantsSheet = spreadsheet.getSheetByName("Participants");

  if (participantsSheet && participantsSheet.getLastRow() > 1) {
    return readSheetRows_(participantsSheet);
  }

  const logSheet = ensureLogSheetHeaders_(getOrCreateSheet_());
  const summaryRows = readSheetRows_(logSheet).filter((row) => row.type === "summary");

  const latestByParticipant = {};
  summaryRows.forEach((row) => {
    const key = String(row.participantId || row.displayName || "");
    if (!key) {
      return;
    }
    latestByParticipant[key] = row;
  });

  return Object.keys(latestByParticipant).map((key) => latestByParticipant[key]);
}

function readSheetRows_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow < 2 || lastColumn === 0) {
    return [];
  }

  const values = sheet.getRange(1, 1, lastRow, lastColumn).getValues();
  const headers = values[0].map((header) => String(header || "").trim());

  return values.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index];
    });
    return record;
  }).filter((row) => Object.values(row).some((value) => value !== ""));
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const existingSheet = spreadsheet.getSheetByName(SHEET_NAME);
  return existingSheet || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureLogSheetHeaders_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = Math.max(sheet.getLastColumn(), LOG_HEADERS.length);

  if (lastRow === 0) {
    sheet.getRange(1, 1, 1, LOG_HEADERS.length).setValues([LOG_HEADERS]);
    return sheet;
  }

  const firstRow = sheet.getRange(1, 1, 1, lastColumn).getValues()[0]
    .slice(0, LOG_HEADERS.length)
    .map((value) => String(value || "").trim());
  const headersMatch = LOG_HEADERS.every((header, index) => firstRow[index] === header);

  if (!headersMatch) {
    sheet.insertRows(1, 1);
    sheet.getRange(1, 1, 1, LOG_HEADERS.length).setValues([LOG_HEADERS]);
  }

  return sheet;
}
