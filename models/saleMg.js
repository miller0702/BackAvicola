const mongoose = require('mongoose');

const SaleSchema = mongoose.Schema({
    cliente_id: { type: Number, required: true },
    lote_id: { type: Number, required: true },
    user_id: { type: String, required: true },
    cantidadaves: { type: Number, required: true },
    canastas_vacias: [{ type: Number, required: true }],
    canastas_llenas: [{ type: Number, required: true }],
    preciokilo: { type: Number, required: true },
    fecha: { type: Date, required: true },
    numerofactura: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Sale = mongoose.model('Sales', SaleSchema);

Sale.getAll = async () => {
    const sales = await Sale.find();
    return sales;
};

Sale.getById = async (saleId) => {
    const sale = await Sale.findById(saleId);
    return sale;
};

Sale.createSale = async (saleData) => {
    const newSale = new Sale(saleData);
    await newSale.save();
    return newSale;
};

Sale.updateSale = async (saleId, updatedData) => {
    const updatedSale = await Sale.findByIdAndUpdate(saleId, { ...updatedData, updatedAt: Date.now() }, { new: true });
    return updatedSale;
};

Sale.deleteSale = async (saleId) => {
    await Sale.findByIdAndRemove(saleId);
};

Sale.findByNumeroFactura = async (numeroFactura) => {
    const sale = await Sale.findOne({ numerofactura: numeroFactura });
    return sale;
};

module.exports = Sale;
