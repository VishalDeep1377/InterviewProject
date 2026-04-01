// c:\InterviewProject\test_upload_endpoint.js
const fs = require('fs');
const path = require('path');

async function test() {
    try {
        const formData = new FormData();
        const blob = new Blob(["dummy pdf buffer"], { type: 'application/pdf' });
        formData.append("files", blob, "dummy.pdf");

        // mock the JWT login to get token
        const resLogin = await fetch(`http://localhost:5000/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@po-insight.com', password: 'admin' })
        });
        const { token } = await resLogin.json();

        const resUpload = await fetch(`http://localhost:5000/api/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        
        const txt = await resUpload.text();
        console.log("Status:", resUpload.status);
        console.log("Response:", txt);
    } catch(err) {
        console.error("Test Error:", err);
    }
}
test();
