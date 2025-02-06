export async function mailSender(
  content = { subject: "", body: "", html: "" },
  receiverEmail = ""
) {
  try {
    const response = await fetch("http://localhost:3000/api/mail/write-mail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: receiverEmail,
        subject: content.subject,
        message: content.html || content.body,
        isHtml: !!content.html, // true if HTML content is provided
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send email");
    }

    return data.success || false;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export async function fetchAndParseEmails(days = 1) {
  try {
    const response = await fetch(`http://localhost:3000/api/mail/read-mail?days=${days}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch emails");
    }

    return true; // Returns parsed emails
  } catch (error) {
    console.error("Error fetching emails:", error);
    return null;
  }
}

const myMailDirectory = {
    "Kavya Shakya" : 'kavya.shakya23@gmail.com',
    "Ben Affleck" : 'con.kavya@gmail.com'
}

// STILL A TESTING FUNCTION - NOT FINAL

export function directoryScanner(query = "") {
    // Trim and create case-insensitive regex with flexible matching
    const sanitizedQuery = query.trim().replace(/\s+/g, '.*');
    const queryRegex = new RegExp(sanitizedQuery, 'i');

    // Enhanced matching using regex
    const matches = Object.entries(myMailDirectory).filter(([name, email]) => 
        queryRegex.test(name.replace(/\s+/g, ''))
    );

    if (matches.length === 0) return 'not found';
    if (matches.length === 1) return matches[0][1];
    
    // Return multiple matches with names and emails
    return matches.map(([name, email]) => `${name}: ${email}`).join('; ');
}

// (async () => {
//   const n = 2; // Last 7 days
//   const emailData = await fetchAndParseEmails(n);
//   console.log(JSON.stringify(emailData, null, 2));
// })();
