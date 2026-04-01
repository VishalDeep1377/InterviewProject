const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSummary = async (req, res) => {
    try {
        const totalOrders = await prisma.order.count();
        const aggregations = await prisma.order.aggregate({
             _sum: {
                 total_net: true,
                 total_units: true
             }
        });
        res.json({
            total_orders: totalOrders,
            total_revenue: aggregations._sum.total_net || 0,
            total_quantity: aggregations._sum.total_units || 0
        });
    } catch(err) { res.status(500).json({ error: err.message }); }
};
exports.getSupplierData = async (req, res) => {
    try {
        const suppliers = await prisma.supplier.findMany({
             include: {
                  orders: {
                       select: {
                           total_net: true,
                           total_units: true
                       }
                  }
             }
        });

        const data = suppliers.map(s => {
             const revenue = s.orders.reduce((acc, o) => acc + (o.total_net || 0), 0);
             const qty = s.orders.reduce((acc, o) => acc + (o.total_units || 0), 0);
             return {
                 name: s.name,
                 order_count: s.orders.length,
                 total_revenue: revenue,
                 total_quantity: qty
             };
        });
        res.json(data);
    } catch(err) { res.status(500).json({ error: err.message }); }
};

exports.getBrandData = async (req, res) => {
    try {
        const brands = await prisma.brand.findMany({
             include: {
                  orders: {
                       select: {
                           total_net: true,
                           total_units: true
                       }
                  }
             }
        });

        const data = brands.map(b => {
             const revenue = b.orders.reduce((acc, o) => acc + (o.total_net || 0), 0);
             const qty = b.orders.reduce((acc, o) => acc + (o.total_units || 0), 0);
             return {
                 name: b.name,
                 order_count: b.orders.length,
                 total_revenue: revenue,
                 total_quantity: qty
             };
        });
        res.json(data);
    } catch(err) { res.status(500).json({ error: err.message }); }
};

exports.getTimelineData = async (req, res) => {
     try {
         const orders = await prisma.order.findMany({
             select: { 
                 ex_factory_date: true, 
                 delivery_date: true, 
                 total_net: true,
                 purchase_order_number: true
             }
         });
         
         const data = orders.map(o => ({
             po: o.purchase_order_number,
             ex_factory: o.ex_factory_date ? o.ex_factory_date.toISOString().split('T')[0] : null,
             delivery: o.delivery_date ? o.delivery_date.toISOString().split('T')[0] : null,
             revenue: o.total_net || 0
         }));
         
         res.json(data);
     } catch(err) { res.status(500).json({ error: err.message }); }
};

exports.getAIInsights = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: { brand: true, supplier: true }
        });

        if (orders.length === 0) return res.json({ insights: ["Welcome! Upload some POs to see AI insights."] });

        const insights = [];

        // 1. Calculate Top Performer
        const brandRevenue = {};
        orders.forEach(o => {
            const name = o.brand?.name || 'Unknown';
            brandRevenue[name] = (brandRevenue[name] || 0) + (o.total_net || 0);
        });
        const topBrand = Object.entries(brandRevenue).sort((a,b) => b[1] - a[1])[0];
        insights.push(`🚀 **${topBrand[0]}** is leading with a total value of ${orders[0]?.currency || '£'}${topBrand[1].toLocaleString()}.`);

        // 2. Identify Logistics Risk
        const lateOrders = orders.filter(o => {
            if(!o.ex_factory_date || !o.delivery_date) return false;
            const diff = (o.delivery_date - o.ex_factory_date) / (1000*3600*24);
            return diff > 30; // Alert for > 30 days lead time
        });
        if(lateOrders.length > 0) {
            insights.push(`⚠️ **Logistics Alert**: ${lateOrders.length} orders have a lead time variance $>30$ days.`);
        } else {
            insights.push(`✅ **Logistics Optimized**: All active POs are within standard lead-time windows.`);
        }

        // 3. Volume Check
        const totalUnits = orders.reduce((acc, o) => acc + (o.total_units || 0), 0);
        const avgValue = orders.reduce((acc, o) => acc + (o.total_net || 0), 0) / orders.length;
        insights.push(`📈 **Volume Surge**: Average PO value is current hovering at **${o.currency || '£'}${avgValue.toFixed(2)}**.`);

        res.json({ insights });
    } catch(err) { res.status(500).json({ error: err.message }); }
}

exports.getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch(err) { res.status(500).json({ error: err.message }); }
}
