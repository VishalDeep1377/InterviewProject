// c:\InterviewProject\test_upload.js
const fs = require('fs');
const path = require('path');
const { parsePDF } = require('./backend/services/pdfParser.js');
const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function test() {
    try {
        const filePath = path.join(__dirname, "AMP0200A_PrettyLittleThing_Multi_0070034454_v1.pdf");
        const buffer = fs.readFileSync(filePath);
        console.log("File loaded:", buffer.length, "bytes.");

        console.log("Parsing PDF...");
        const parsedData = await parsePDF(buffer);
        console.log("Parsed Data:", JSON.stringify(parsedData, null, 2));

        console.log("Database connection...");
        // Upsert Supplier
        const supplier = await prisma.supplier.upsert({
            where: { name: parsedData.supplier_name },
            update: {},
            create: { name: parsedData.supplier_name }
        });
        console.log("Supplier:", supplier);
        console.log("DONE!");
    } catch(err) {
        console.error("Test Error:", err);
    }
}
test();
