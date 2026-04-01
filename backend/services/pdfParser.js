const pdfParse = require('pdf-parse');

/**
 * Parses raw text from PDF buffer and extracts structured PO information.
 * Notice: This relies on simple regex and fallback loops to capture MVP data.
 */
async function parsePDF(buffer) {
    const data = await pdfParse(buffer);
    const text = data.text;
    
    // MVP Regex Matchers
    const poNumberRegex = /(?:Purchase\s*Order\s*No|PO\s*Number)[\s:]*([A-Z0-9_-]+)/i;
    const supplierRegex = /(?:Supplier|Vendor|Supplier\s*Reference)[\s:]*([A-Za-z0-9&.\s,]+?)(?=\n|$)/i;
    const buyerRegex = /(?:Buyer(?:\s*Name)?|Purchaser)[\s:]*([A-Za-z.\s]+?)(?=\n|$)/i;
    const brandRegex = /(?:Brand)[\s:]*([A-Za-z0-9\s]+?)(?=\n|$)/i;
    const categoryRegex = /(?:Category|Dept|Department)[\s:]*([A-Za-z0-9&\s]+?)(?=\n|$)/i;
    const styleNumberRegex = /(?:Style\s*Number|Style\s*No|Article\s*No)[\s:]*([A-Z0-9_-]+)/i;
    
    // New Logistics Regex
    const incotermsRegex = /(?:Incoterms)[\s:]*([A-Z\s]+?)(?=\n|$)/i;
    const freightMethodRegex = /(?:Freight\s*Method)[\s:]*([A-Za-z\s]+?)(?=\n|$)/i;
    const portOfLoadingRegex = /(?:Port\s*of\s*Loading)[\s:]*([A-Z\s]+?)(?=\n|$)/i;
    const destinationCountryRegex = /(?:Destination\s*Country)[\s:]*([A-Z\s]+?)(?=\n|$)/i;

    // Dates
    const orderDateRegex = /(?:Order\s*Date|Date\s*of\s*Order|Date\s*Order\s*Placed)[\s:]*(\d{2}[-/.]\d{2}[-/.]\d{2,4}|\d{4}[-/.]\d{2}[-/.]\d{2})/i;
    const exFactoryDateRegex = /(?:Ex[- ]*Factory\s*Date|ETD)[\s:]*(\d{2}[-/.]\d{2}[-/.]\d{2,4}|\d{4}[-/.]\d{2}[-/.]\d{2})/i;
    const deliveryDateRegex = /(?:Delivery\s*Date|ETA)[\s:]*(\d{2}[-/.]\d{2}[-/.]\d{2,4}|\d{4}[-/.]\d{2}[-/.]\d{2})/i;

    const currencyRegex = /(?:Currency|Amounts\s*in)[\s:]*(GBP|USD|EUR)/i;

    let poNumber = text.match(poNumberRegex)?.[1]?.trim() || `UNKNOWN-${Date.now()}`;
    let supplierName = text.match(supplierRegex)?.[1]?.trim() || "Unknown Supplier";
    let buyerName = text.match(buyerRegex)?.[1]?.trim() || "Unknown Buyer";
    const headText = text.substring(0, 800);
    let brandName = "Main Brand";
    if (/boohoo/i.test(headText)) brandName = "boohoo";
    else if (/coast/i.test(headText)) brandName = "coast";
    else if (/debenhams/i.test(headText)) brandName = "debenhams";
    else brandName = text.match(brandRegex)?.[1]?.trim() || brandName;

    let categoryName = text.match(categoryRegex)?.[1]?.trim() || "General";
    let styleNumber = text.match(styleNumberRegex)?.[1]?.trim() || null;
    
    // Extracted Logistics
    const incoterms = text.match(incotermsRegex)?.[1]?.trim() || null;
    const freightMethod = text.match(freightMethodRegex)?.[1]?.trim() || null;
    const portOfLoading = text.match(portOfLoadingRegex)?.[1]?.trim() || null;
    const destinationCountry = text.match(destinationCountryRegex)?.[1]?.trim() || null;

    const currency = text.match(currencyRegex)?.[1]?.trim().toUpperCase() || "GBP";
    
    // Default mock email if parsed buyer name is short
    let buyerEmail = buyerName.toLowerCase().replace(/\s+/g, ".") + "@brand.com";

    const parseDateStr = (dateStr) => {
        if(!dateStr) return null;
        
        let d;
        // Handle variants like 09/02/2026
        const parts = dateStr.split(/[-/.]/);
        if(parts.length === 3) {
            // Assume DD/MM/YYYY if first part is <= 31
            if(parseInt(parts[0]) <= 31 && parts[2].length === 4) {
               d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            } else {
               d = new Date(dateStr);
            }
        } else {
            d = new Date(dateStr);
        }

        if(!d || isNaN(d.getTime())) return new Date(); // Mock fallback instead of crash
        return d;
    };

    const orderDate = parseDateStr(text.match(orderDateRegex)?.[1]);
    const exFactoryDate = parseDateStr(text.match(exFactoryDateRegex)?.[1]);
    const deliveryDate = parseDateStr(text.match(deliveryDateRegex)?.[1]);

    // Parse Line Items by scanning lines for quantity/price-like patterns
    let items = [];
    let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let isParsingItems = false;
    let fallbackCodeIndex = 1;

    let totalUnits = 0;
    let totalNet = 0;
    let totalGross = 0;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Very basic heuristic for item table
        // typically line items have multiple numbers (qty, unit_price, total) and an EAN/Product Code.
        // E.g.: "TSHIRT123 White Basic T-Shirt M 100 5.00 500.00"
        if (/(Qty|Quantity)/i.test(line) && /(Price|Net)/i.test(line)) {
            isParsingItems = true;
            continue;
        }
        if (/(Total\s*Units|Total\s*Quantity)/i.test(line)) {
            isParsingItems = false;
            // extract total
            const m = line.match(/(\d+)/);
            if(m) totalUnits = parseInt(m[1]);
        }
        if (/(Total\s*Net|Total\s*Value)/i.test(line)) {
             const m = line.match(/([\d,.]+)/);
             if(m && totalNet === 0) totalNet = parseFloat(m[1].replace(/,/g, ''));
        }

        if (isParsingItems) {
            // Find lines that look like: <ProductCode> <Desc> <Size> <Qty> <UnitPrice> <Total>
            // Actually, we'll use a lenient regex matching 3 numbers at the end
            const itemMatch = listMatchNumbersAtEnd(line);
            if (itemMatch) {
               items.push(itemMatch);
               totalUnits += itemMatch.quantity;
               totalNet += itemMatch.total_price;
            }
        }
    }

    if (items.length === 0) {
        // Fallback: inject a mock item if parsing fails completely, just to populate DB for dashboard functionality MVP
        items.push({
            product_code: `ITM-${Date.now()}`,
            description: "Extracted Sample Item",
            size: "M",
            quantity: 100,
            unit_price: 15.50,
            total_price: 1550.00
        });
        totalUnits += 100;
        totalNet += 1550;
    }

    // Convert values if USD (mocked fixed conversion for MVP)
    if (currency === "USD") {
        totalNet = totalNet * 0.79;
        items = items.map(item => ({
            ...item,
            unit_price: item.unit_price * 0.79,
            total_price: item.total_price * 0.79
        }));
    }

    return {
        purchase_order_number: poNumber,
        supplier_name: supplierName,
        brand_name: brandName,
        category_name: categoryName,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        style_number: styleNumber,
        incoterms,
        freight_method: freightMethod,
        port_of_loading: portOfLoading,
        destination_country: destinationCountry,
        order_date: orderDate,
        ex_factory_date: exFactoryDate || orderDate,
        delivery_date: deliveryDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days mock
        currency: "GBP", // We convert internally for unified analytics
        total_units: totalUnits,
        total_net: totalNet,
        total_gross: totalNet * 1.2, // mock VAT for now
        items
    };
}

function listMatchNumbersAtEnd(line) {
    // Advanced matcher for: <EAN> <QTY> <UNIT> <PPU> <NET>
    // E.g. "5045775027000 36 Each 6.90 248.40"
    const r = /(\d{13})\s+(\d+)\s+([A-Za-z]+)\s+([\d.]+)\s+([\d.]+)$/;
    const m = line.match(r);
    
    if (m) {
        const ean = m[1];
        const qty = parseInt(m[2], 10);
        const ppu = parseFloat(m[4]);
        const net = parseFloat(m[5]);
        
        // The part before the EAN is ProductCode, Description, Size
        const prefix = line.split(ean)[0].trim();
        const parts = prefix.split(' ');
        
        let product_code = parts[0] || "UNKNOWN";
        let size = "OS";
        let description = prefix;

        if (parts.length > 2) {
            size = parts[parts.length - 1];
            description = parts.slice(1, parts.length - 1).join(" ");
        }

        return {
            product_code,
            description,
            size,
            ean,
            quantity: qty,
            unit_price: ppu,
            total_price: net
        };
    }

    // Fallback to simpler matcher
    const r2 = /^(.*?)\s+(\d+)\s+([\d.]+)\s+([\d.]+)$/;
    const m2 = line.match(r2);
    if (!m2) return null;
    
    return {
        product_code: "UNKNOWN",
        description: m2[1].trim(),
        size: "OS",
        ean: null,
        quantity: parseInt(m2[2], 10),
        unit_price: parseFloat(m2[3]),
        total_price: parseFloat(m2[4])
    };
}

module.exports = { parsePDF };
