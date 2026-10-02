/**
 * Service for sending data to Google Sheets via Apps Script Web App
 */

// Uses the URL provided in the .env file
const getSheetsUrl = () => import.meta.env.VITE_GOOGLE_SHEETS_URL;

export interface SheetsData {
  PlayerName: string;
  Email: string;
  Phone: string;
  TimeSeconds: number;
  Moves: number;
  Status: string; // e.g., 'completed', 'abandoned'
}

export const sendToGoogleSheets = async (data: SheetsData): Promise<boolean> => {
  const url = getSheetsUrl();
  
  if (!url) {
    console.warn('Google Sheets URL not configured. Skipping data export.');
    return false;
  }

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors', // Important for Apps Script web apps to avoid CORS issues
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Since we use no-cors, we can't read the response properly, but if it didn't throw, it likely succeeded.
    console.log('Data sent to Google Sheets successfully');
    return true;
  } catch (error) {
    console.error('Error sending data to Google Sheets:', error);
    return false;
  }
};
