const mongoose = require('mongoose');

const SaleSchema = mongoose.Schema({
    cliente: { type: String, required: true },
    clientecorreo: { type: String },
    vendedor: { type: String, required: true },
    cantidadaves: { type: Number, required: true },
    cantidadkilos: { type: Number, required: true },
    preciokilo: { type: Number, required: true },
    fecha: { type: Date },
    numerofactura: { type: Number, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Sale = mongoose.model('Sale', SaleSchema);

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
    const sale = await Sale.find().where("numerofactura").equals(numeroFactura);
    return sale;
};


module.exports = Sale;