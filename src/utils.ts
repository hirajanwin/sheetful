import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
  GoogleSpreadsheetRow
} from 'google-spreadsheet'

import * as types from './types'

export async function getDocument(
  documentId: string,
  accessToken: string
): Promise<GoogleSpreadsheet> {
  if (!accessToken) {
    throw { message: 'Missing required access token', status: 400 }
  }

  const doc = new GoogleSpreadsheet(documentId)
  doc.useAccessToken(accessToken)

  try {
    await doc.loadInfo()
  } catch (err) {
    throw {
      message: `Error loading document "${documentId}": ${err.message}`,
      status: 400
    }
  }

  return doc
}

export async function getSheet(
  doc: GoogleSpreadsheet,
  sheetId: string
): Promise<GoogleSpreadsheetWorksheet> {
  const sheetIndex = parseInt(sheetId)
  const sheet =
    doc.sheetsById[sheetId] ||
    (isNaN(sheetIndex) ? undefined : doc.sheetsByIndex[sheetIndex])

  if (!sheet) {
    throw { message: `Sheet not found "${sheetId}"`, status: 404 }
  }

  return sheet
}

export async function getSheetRows(
  sheet: GoogleSpreadsheetWorksheet,
  opts?: types.SheetGetRowsOptions
): Promise<object[]> {
  const { headerValues } = sheet
  const rows: GoogleSpreadsheetRow[] = await sheet.getRows(opts)

  return rows.map((row) => {
    const json = {}
    for (const header of headerValues) {
      json[header] = row[header]
    }

    return json
  })
}
