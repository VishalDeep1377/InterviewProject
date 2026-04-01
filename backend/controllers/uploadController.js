const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { parsePDF } = require('../services/pdfParser');

exports.uploadFiles = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded.' });
        }

        const results = [];
        
        for (const file of req.files) {
            try {
                const parsedData = await parsePDF(file.buffer);

                // Use transaction for atomic PO processing
                const order = await prisma.$transaction(async (tx) => {
                    // Upsert Supplier
                    const supplier = await tx.supplier.upsert({
                        where: { name: parsedData.supplier_name },
                        update: {},
                        create: { name: parsedData.supplier_name }
                    });

                    // Upsert Brand
                    const brand = await tx.brand.upsert({
                        where: { name: parsedData.brand_name || 'Main Brand' },
                        update: {},
                        create: { name: parsedData.brand_name || 'Main Brand' }
                    });

                    // Upsert Category
                    const category = await tx.category.upsert({
                        where: { name: parsedData.category_name || 'General' },
                        update: {},
                        create: { name: parsedData.category_name || 'General' }
                    });

                    // Find Buyer
                    let buyer = await tx.buyer.findFirst({
                        where: { name: parsedData.buyer_name }
                    });

                    if (!buyer) {
                        buyer = await tx.buyer.create({
                            data: {
                                name: parsedData.buyer_name,
                                email: parsedData.buyer_email
                            }
                        });
                    }

                    // Prepare Order Data
                    const orderData = {
                        supplier_id: supplier.id,
                        brand_id: brand.id,
                        category_id: category.id,
                        buyer_id: buyer.id,
                        style_number: parsedData.style_number || null,
                        incoterms: parsedData.incoterms || null,
                        freight_method: parsedData.freight_method || null,
                        port_of_loading: parsedData.port_of_loading || null,
                        destination_country: parsedData.destination_country || null,
                        order_date: parsedData.order_date || new Date(),
                        ex_factory_date: parsedData.ex_factory_date || new Date(),
                        delivery_date: parsedData.delivery_date || new Date(),
                        currency: parsedData.currency,
                        total_units: parsedData.total_units || 0,
                        total_net: parsedData.total_net || 0,
                        total_gross: parsedData.total_gross || 0,
                    };

                    // Upsert Order (Top-level)
                    const existingOrder = await tx.order.upsert({
                        where: { purchase_order_number: parsedData.purchase_order_number },
                        update: orderData,
                        create: {
                            purchase_order_number: parsedData.purchase_order_number,
                            ...orderData
                        }
                    });

                    // Always Replace Line Items to stay in sync with PDF
                    await tx.orderItem.deleteMany({ where: { order_id: existingOrder.id }});
                    await tx.orderItem.createMany({
                        data: parsedData.items.map(i => ({
                            order_id: existingOrder.id,
                            product_code: i.product_code || null,
                            description: i.description || null,
                            size: i.size || null,
                            ean: i.ean || null,
                            quantity: Number(i.quantity) || 0,
                            unit_price: Number(i.unit_price) || 0,
                            total_price: Number(i.total_price) || 0
                        }))
                    });

                    return await tx.order.findUnique({
                        where: { id: existingOrder.id },
                        include: { items: true, supplier: true, brand: true, category: true, buyer: true }
                    });
                });

                results.push({ filename: file.originalname, status: 'success', data: order });
            } catch (err) {
                console.error(`[PDF Processing Error] File: ${file.originalname}`, err);
                results.push({ filename: file.originalname, status: 'failed', error: err.message });
            }
        }

        const successCount = results.filter(r => r.status === 'success').length;
        if(successCount === 0 && results.length > 0) {
            return res.status(500).json({ error: 'All files failed to process.', results });
        }

        res.json({ message: 'Processing completed', results });
    } catch (outerError) {
        console.error('Critical Upload System Error:', outerError);
        res.status(500).json({ error: 'Critical system failure during upload.' });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                supplier: true,
                brand: true,
                category: true,
                buyer: true
            },
            orderBy: {
                order_date: 'desc'
            }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
             where: { id: parseInt(id) },
             include: {
                  items: true,
                  supplier: true,
                  brand: true,
                  category: true,
                  buyer: true
             }
        });
        if(!order) return res.status(404).json({error: "Not found"});
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        // Prisma cascade is set in schema.prisma for OrderItem
        await prisma.order.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.clearAllOrders = async (req, res) => {
    try {
        // Delete all orders (will cascade to OrderItems)
        await prisma.order.deleteMany({});
        // Optional: clear related models if they have no other orders
        // For MVP prototype, we just clear the main transaction table
        res.json({ message: 'All order data cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
