export  function parseEmailBody(emailPayload) {
    let plainText = '';
  
    // Helper function to recursively process parts
    function extractTextFromParts(parts) {
      for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body.data) {
          // Decode Base64-encoded body and append it to plainText
          plainText += Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.mimeType === 'text/html' && part.body.data) {
          // Decode Base64 HTML and strip tags for clean plain text
          const htmlContent = Buffer.from(part.body.data, 'base64').toString('utf-8');
          plainText += stripHtmlTags(htmlContent);
        } else if (part.parts) {
          // Recursively handle nested parts
          extractTextFromParts(part.parts);
        }
      }
    }
  
    // Utility to strip HTML tags and decode common HTML entities
    function stripHtmlTags(html) {
      const cleanText = html
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .trim() // Trim leading/trailing whitespace
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&rsquo;/g, "'")
        .replace(/&lsquo;/g, "'")
        .replace(/&rdquo;/g, '"')
        .replace(/&ldquo;/g, '"')
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')
        .replace(/&hellip;/g, '...')
        .replace(/&trade;/g, '™')
        .replace(/&copy;/g, '©')
        .replace(/&reg;/g, '®')
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
  
      return cleanText;
    }
  
    // Start processing email payload parts
    if (emailPayload.payload.parts) {
      extractTextFromParts(emailPayload.payload.parts);
    } else if (emailPayload.payload.body.data) {
      // Handle cases where there's no "parts" array, but only one plain-text body
      plainText += Buffer.from(emailPayload.payload.body.data, 'base64').toString('utf-8');
    }
  
    return plainText;
  }