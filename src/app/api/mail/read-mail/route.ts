import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getToken } from 'next-auth/jwt';
import { NextApiRequest, NextApiResponse } from 'next';
import { parseEmailBody } from '@/lib/mailparser';

export async function GET(request: NextApiRequest) {
    const token = await getToken({ req: request , secret : process.env.AUTH_SECRET });

    console.log("Token : ", token)
    if (!token) return { status: 401, body: "Unauthorized" };

    const clientId = process.env.GOOGLE_CLIENT_ID as string;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
    const accessToken = token.access_token;
    const refreshToken = token.refresh_token;

    const oAuth2Client = new OAuth2Client({
        clientId,
        clientSecret,
    });

    oAuth2Client.setCredentials({
        access_token: accessToken as string,
        refresh_token: refreshToken as string,
    });

    // Refresh the access token if expired
    try {
        const tokenInfo = await oAuth2Client.getAccessToken();
        if (tokenInfo.token) {
            oAuth2Client.setCredentials({
                access_token: tokenInfo.token,
                refresh_token: refreshToken as string,
            });
        }
    } catch (error) {
        return new Response('Failed to refresh token', { status: 401 });
    }

    const gmail = google.gmail({
        version: 'v1',
        auth: oAuth2Client,
    });

    const { searchParams } = new URL(request.url as string);
    const days = searchParams.get('days') || 1;

    const dateNdaysAgo = new Date();
    dateNdaysAgo.setDate(dateNdaysAgo.getDate() - Number(days));
    const formattedDate = dateNdaysAgo.toISOString().split('T')[0];

    try {
        const me = await gmail.users.getProfile({ userId: 'me' });
        const myEmail = me.data.emailAddress;

        const response = await gmail.users.messages.list({
            userId: 'me',
            q: `in:inbox after:${Math.floor(new Date(formattedDate).getTime() / 1000)} -from:${myEmail}`,
            maxResults: 10,
        });

        const messages = response.data.messages;

        if (!messages) return new Response('No messages found', { status: 404 });

        const emailContent: Record<string, any[]> = {};

        for (const message of messages) {
            const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });

            const headers = msg.data.payload.headers;
            const from = headers.find((header) => header.name === 'From')?.value || 'Unknown';
            const subject = headers.find((header) => header.name === 'Subject')?.value || 'No Subject';

            const body = parseEmailBody(msg.data);

            // Filter out emails with body length > 4000 characters
            if (body.length > 10000) {
                continue;
            }

            const senderEmail = from.match(/<(.+?)>/)?.[1] || from;

            emailContent[senderEmail] = emailContent[senderEmail] || [];
            emailContent[senderEmail].push({
                subject,
                body,
                date: headers.find((header) => header.name === 'Date')?.value,
            });
        }

        return new Response(JSON.stringify(emailContent), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error fetching Gmail data:', error);
        return new Response('Failed to fetch Gmail data', { status: 500 });
    }
}
