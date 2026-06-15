import fs from 'fs';
import csv from 'csv-parser';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES Module path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environmental variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const LOGTO_ENDPOINT = process.env.LOGTO_ENDPOINT;
const M2M_APP_ID = process.env.APP_ID;
const M2M_APP_SECRET = process.env.APP_SECRET;
const API_INDICATOR = process.env.API_INDICATOR;

const errorLogPath = path.resolve(__dirname, 'errors.log');

// Definition of your CSV file structure
interface UserRow {
    id: string;
    username: string; // In your data it contains the e-mail
    first_name: string;
    last_name: string;
    password?: string; // Contains hash $6$rounds=...
}

// Definition of target structure for Logto Management API
interface LogtoUserPayload {
    primaryEmail: string;
    username?: string;
    isEmailVerified?: boolean;
    customData: {
        old_id: string;
        first_name: string;
        last_name: string;
    };
    passwordAlgorithm?: string;
    passwordDigest?: string;
}

// Function to log errors to a file
function logError(identifier: string, error: any): void {
    const timestamp = new Date().toISOString();
    const errorMessage = error?.response?.data ? JSON.stringify(error.response.data) : error.message;
    const logEntry = `[${timestamp}] ID/Email: ${identifier} | Error: ${errorMessage}\n`;

    fs.appendFileSync(errorLogPath, logEntry);
}

// Get Access Token for Management API
async function getAccessToken(): Promise<string> {
    try {
        const response = await axios.post(`${LOGTO_ENDPOINT}/oidc/token`, {
            grant_type: 'client_credentials',
            client_id: M2M_APP_ID,
            client_secret: M2M_APP_SECRET,
            resource: API_INDICATOR,
            scope: 'all'
        });
        return response.data.access_token;
    } catch (error: any) {
        console.error('❌ Failed to get Access Token. Check M2M settings in Logto Console.');
        throw error;
    }
}

async function migrateUsers(): Promise<void> {
    console.log('🚀 Starting user migration with sha512crypt support...');

    try {
        const token = await getAccessToken();
        const results: UserRow[] = [];

        // Reading CSV file
        fs.createReadStream(path.resolve(__dirname, 'csvdata.csv'))
            .pipe(csv())
            .on('data', (data: UserRow) => results.push(data))
            .on('end', async () => {
                console.log(`📦 Loaded ${results.length} rows. Starting import to Logto...`);

                for (const row of results) {
                    try {
                        const payload: LogtoUserPayload = {
                            primaryEmail: row.username, // In your CSV, the e-mail is in the username column
                            isEmailVerified: true,
                            customData: {
                                old_id: row.id,
                                first_name: row.first_name,
                                last_name: row.last_name
                            }
                        };

                        // Implementation of migration for sha512crypt ($6$) using new modification in Core
                        if (row.password && row.password.startsWith('$6$')) {
                            // We use the new algorithm 'sha512crypt' that we added to Logto Core
                            // To avoid ZodError (too_big > 256), we send a more efficient format
                            payload.passwordAlgorithm = 'Legacy';
                            payload.passwordDigest = JSON.stringify(["sha512crypt", ["@"], row.password]);
                            console.log(`⚙️ Preparing sha512crypt import for ${row.username}`);
                        }

                        // Send request to create user
                        try {
                            await axios.post(`${LOGTO_ENDPOINT}/api/users`, payload, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            console.log(`✅ User ${row.username} successfully imported.`);
                        } catch (error: any) {
                            const errorCode = error.response?.data?.code;
                            if (errorCode === 'user.username_already_in_use' || errorCode === 'user.email_already_in_use') {
                                console.log(`ℹ️ User ${row.username} already exists, skipping.`);
                            } else {
                                throw error;
                            }
                        }

                        // Rate limiting for API protection
                        await new Promise(resolve => setTimeout(resolve, 100));

                    } catch (error: any) {
                        const errorData = error.response?.data || error.message;
                        console.error(`❌ Error importing ${row.username}:`, errorData);
                        logError(row.username, error);
                    }
                }
                console.log('🏁 Import finished. Check errors.log for any failures.');
            });
    } catch (error: any) {
        console.error('⚠️ Critical error during migration:', error.message);
    }
}

migrateUsers();
