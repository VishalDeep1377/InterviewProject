const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Exports all orders to a detailed line-level CSV.
 * Includes both high-level order metadata and individual item details.
 */
exports.exportToCSV = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                supplier: true,
                brand: true,
                category: true,
                buyer: true,
                items: true
            }
        });

        // Create CSV Header - Expanded for full Business Intelligence
        let headers = [
            'PO Number', 'Supplier', 'Brand', 'Category', 'Style Number', 
            'Buyer', 'Incoterms', 'Freight Method', 'Port of Loading', 'Destination',
            'Order Date', 'Ex-Factory Date', 'Delivery Date', 'Currency',
            'Product Code', 'Description', 'Size', 'EAN', 'Item Qty', 'Unit Price', 'Line Total'
        ].join(',');
        
        let csv = headers + '\n';

        // Add Data Rows (Flattened per Item)
        orders.forEach(o => {
            const commonData = [
                o.purchase_order_number,
                o.supplier?.name || '',
                o.brand?.name || '',
                o.category?.name || '',
                o.style_number || '',
                o.buyer?.name || '',
                o.incoterms || '',
                o.freight_method || '',
                o.port_of_loading || '',
                o.destination_country || '',
                o.order_date ? o.order_date.toISOString().split('T')[0] : '',
                o.ex_factory_date ? o.ex_factory_date.toISOString().split('T')[0] : '',
                o.delivery_date ? o.delivery_date.toISOString().split('T')[0] : '',
                o.currency || '£'
            ];

            if (o.items && o.items.length > 0) {
                o.items.forEach(item => {
                    const rowData = [
                        ...commonData,
                        item.product_code || '',
                        item.description || '',
                        item.size || '',
                        item.ean || '',
                        item.quantity,
                        item.unit_price,
                        item.total_price
                    ];
                    const row = rowData.map(v => `"${(v === undefined || v === null) ? '' : v.toString().replace(/"/g, '""')}"`).join(',');
                    csv += row + '\n';
                });
            } else {
                const rowData = [...commonData, '', '', '', '', 0, 0, 0];
                const row = rowData.map(v => `"${(v === undefined || v === null) ? '' : v.toString().replace(/"/g, '""')}"`).join(',');
                csv += row + '\n';
            }
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=purchase_orders.csv');
        // Add UTF-8 BOM for Excel
        res.status(200).send('\ufeff' + csv);

    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).json({ error: 'Export failed' });
    }
};
