import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getToken } from 'next-auth/jwt';
import { NextApiRequest, NextApiResponse } from 'next';

export async function POST(request: NextApiRequest, response: NextApiResponse) {
    try {
        // Get the user's OAuth token from the session
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        console.log("Token : ", token);

        if (!token || !token.access_token) {
            return new Response('Unauthorized', { status: 401 });
        }

        // Google OAuth2 Client Setup
        const clientId = process.env.GOOGLE_CLIENT_ID as string;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
        const oAuth2Client = new OAuth2Client(clientId, clientSecret);
        oAuth2Client.setCredentials({
            access_token: token.access_token as string,
            refresh_token: token.refresh_token as string,
        });

        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

        // Parse request body
        const body = await request.json();
        const { to, subject, message, isHtml } = body as {to : string[] | string | null | undefined , subject : string | null | undefined , message : string | null | undefined , isHtml : boolean | null | undefined};

        if ((!to || to.length == 0) || !subject || !message) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Set content type based on whether HTML is used
        const contentType = isHtml ? 'text/html' : 'text/plain';
        const recipientList = Array.isArray(to) ? to.join(',') : to;

        // Encode the email content in Base64
        const emailContent = [
            `To: ${recipientList}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            `Content-Type: ${contentType}; charset="UTF-8"`,
            '',
            message,
        ].join('\n');

        const encodedMessage = Buffer.from(emailContent)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        // Send email
        const sendResponse = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });

        return new Response(JSON.stringify({ success: true, data: sendResponse.data }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error sending email:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}