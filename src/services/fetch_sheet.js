const { google } = require('googleapis');

const CREDENTIALS = {
    type: process.env.GOOGLE_CREDENTIALS_TYPE,
    project_id: process.env.GOOGLE_CREDENTIALS_PROJECT_ID,
    private_key_id: process.env.GOOGLE_CREDENTIALS_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_CREDENTIALS_PRIVATE_KEY,
    client_email: process.env.GOOGLE_CREDENTIALS_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CREDENTIALS_CLIENT_ID,
    auth_uri: process.env.GOOGLE_CREDENTIALS_AUTH_URI,
    token_uri: process.env.GOOGLE_CREDENTIALS_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_CREDENTIALS_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CREDENTIALS_CLIENT_X509_CERT_URL,
    universe_domain: process.env.GOOGLE_CREDENTIALS_UNIVERSE_DOMAIN,
  };

  
const { SPREADSHEET_ID } = require('@root/config.json');

async function fetchSheetData(range) {
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
            console.log('No data found.');
            return [];
        }

        // Get the headers from the first row
        const headers = rows[0];

        // Map each row to an object with column names as keys
        const data = rows.slice(1).map(row => {
            const rowObject = {};
            row.forEach((cell, index) => {
                rowObject[headers[index]] = cell;
            });
            return rowObject;
        });

        console.log('Sheet data fetched:', data);
        return data;
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        return [];
    }
}

module.exports = { fetchSheetData };