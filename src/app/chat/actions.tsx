
//tested.
export async function sendHi(){
    const result = await fetch('/api/mail/write-mail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            to: 'kavya.shakya23@gmail.com',
            subject: 'Hello from Next.js',
            message: 'This is a test message from Next.js',
            isHtml: false,
        }),
    }).then((res) => res.json())
    .then((data) => {
        console.log('Email sent:', data);})
}


// not tested
export async function sendMail(recipients : string[] , subject : string, message : string , isHTML : boolean)
{
    const result = await fetch('/api/mail/write-mail',  {
        method: 'POST',
        headers : {
            'Content-Type': 'application/json',
        },
        body : JSON.stringify({
            to : recipients,
            subject : subject,
            message : message,
            isHtml : isHTML,
        })
    }).then((res) => res.json())
    .then((data) => {
        console.log('Email sent:', data);
    })
}