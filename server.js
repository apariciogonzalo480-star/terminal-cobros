const express = require('express');
const cors = require('cors');
const path = require('path');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(express.json());
app.use(cors());

// Servir archivos estáticos
app.use(express.static(__dirname));

// Tu Access Token de Producción
const client = new MercadoPagoConfig({ 
    accessToken: 'APP_USR-7033303816063781-102314-3e1ec47a077283a1660b4d6865c123a8-513347548' 
});

const payment = new Payment(client);

app.post('/api/process-payment', async (req, res) => {
    try {
        const paymentData = req.body;

        const body = {
            transaction_amount: Number(paymentData.transaction_amount),
            token: paymentData.token,
            description: paymentData.description || "Cobro Terminal Web",
            installments: Number(paymentData.installments || 1),
            payment_method_id: paymentData.payment_method_id,
            issuer_id: paymentData.issuer_id,
            payer: {
                email: paymentData.email || paymentData.payer?.email,
                identification: paymentData.payer?.identification
            }
        };

        const response = await payment.create({ body });

        res.json({ 
            success: true, 
            status: response.status, 
            status_detail: response.status_detail,
            id: response.id 
        });
    } catch (error) {
        console.error("Error de Mercado Pago:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Error al procesar el pago' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
