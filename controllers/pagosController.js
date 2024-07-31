const axios = require("axios");
const SHA256 = require("crypto-js/sha256");

const saleMg = require("../models/saleMg")
const sale = require("../models/sale")


module.exports = {

  async obtenerBancos(req, res, next) {
    const data = await axios.post(
      "https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi",
      {
        language: "es",
        command: "GET_BANKS_LIST",
        merchant: {
          apiLogin: "pRRXKOl8ikMmt9u",
          apiKey: "4Vj8eK4rloUd272L48hsrarnUA",
        },
        test: true,
        bankListInformation: {
          paymentMethod: "PSE",
          paymentCountry: "CO",
        },
      }
    ).then(response => {
      // Maneja la respuesta de la API
      // console.log('Respuesta de la API:', response.data);
      return res.status(201).json(response.data)
    })
      .catch(error => {
        // Maneja los errores
        console.error('Error al hacer la solicitud a la API:', error);
      });

    return data
  },

  async obtenerMetodos(req, res, next) {
    const data = await axios.post(
      "https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi",
      {
        test: false,
        language: "en",
        command: "GET_PAYMENT_METHODS",
        merchant: {
          apiLogin: "pRRXKOl8ikMmt9u",
          apiKey: "4Vj8eK4rloUd272L48hsrarnUA"
        }
      }
    ).then(response => {
      // Maneja la respuesta de la API
      // console.log('Respuesta de la API:', response.data);
      return res.status(201).json(response.data)
    })
      .catch(error => {
        // Maneja los errores
        console.error('Error al hacer la solicitud a la API:', error);
      });

    return data
  },

  async obtenerFirma(req, res, next) {
    const numeroFactura = req.body.numeroFactura
    const total = req.body.total
    const firma = `071pf0zgv2scWH0wg6JH1EqFn5~508029~${numeroFactura}~${total}~COP`
    const encriptado = SHA256(firma).toString();
    return res.status(200).json({ encriptado })
  },

  async confirmacion(req, res, next) {
    return res.status(200).json({ succes: true })
  },
  
  async getFactura(req, res, next) {
    const numeroFactura = req.body.numerofactura

    const facturaMg = await saleMg.findByNumeroFactura(numeroFactura)
    const facturaPg = await sale.findByNumeroFactura(numeroFactura)

    if (facturaPg.numeroFactura !== null) {
      return res.status(200).json({ succes: true, factura: facturaPg })
    } else if (facturaMg[0].numeroFactura !== null) {
      return res.status(200).json({ succes: true, factura: facturaMg[0] })
    } else {
      return res.status(501).json({
        success: false,
        message: "Error al obtener el factura",
      });
    }



  },

}

