import { google } from 'googleapis';

const CREDENTIALS = {
    type: process.env.GOOGLE_CREDENTIALS_TYPE!,
    project_id: process.env.GOOGLE_CREDENTIALS_PROJECT_ID!,
    private_key_id: process.env.GOOGLE_CREDENTIALS_PRIVATE_KEY_ID!,
    private_key: process.env.GOOGLE_CREDENTIALS_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CREDENTIALS_CLIENT_EMAIL!,
    client_id: process.env.GOOGLE_CREDENTIALS_CLIENT_ID!,
    auth_uri: process.env.GOOGLE_CREDENTIALS_AUTH_URI!,
    token_uri: process.env.GOOGLE_CREDENTIALS_TOKEN_URI!,
    auth_provider_x509_cert_url: process.env.GOOGLE_CREDENTIALS_AUTH_PROVIDER_X509_CERT_URL!,
    client_x509_cert_url: process.env.GOOGLE_CREDENTIALS_CLIENT_X509_CERT_URL!,
    universe_domain: process.env.GOOGLE_CREDENTIALS_UNIVERSE_DOMAIN!,
};

import { SPREADSHEET_ID } from '../../config.json';


async function fetchSheetData(range: string): Promise<RowObject[]> {
    const auth = new google.auth.GoogleAuth({
        credentials: CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });

        const rows = response.data.values || [];
        if (rows.length === 0) {
            return [];
        }

        // Get the headers from the first row
        const headers = rows[0];

        // Map each row to an object with column names as keys
        const data = rows.slice(1).map(row => {
            const rowObject: RowObject = {};
            row.forEach((cell, index) => {
                rowObject[headers[index]] = cell;
            });
            return rowObject;
        });

        return data;
    } catch (error) {
        return [];
    }
}

export { fetchSheetData };