const express = require('express');
const cors = require('cors');
const path = require('path');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(express.json());
app.use(cors());

// Configurar la carpeta actual para que lea el archivo index.html
app.use(express.static(__dirname));

// Reemplazá con tu Access Token de Producción (APP_USR-...)
const client = new MercadoPagoConfig({ 
    accessToken: 'APP_USR-7033303816063781-102314-3e1ec47a077283a1660b4d6865c123a8-513347548' 
});

const payment = new Payment(client);

app.post('/api/process-payment', async (req, res) => {
    try {
        const paymentData = req.body;
        
        const response = await payment.create({
            body: {
                transaction_amount: Number(paymentData.transaction_amount),
                token: paymentData.token,
                description: paymentData.description || "Cobro Terminal Web",
                installments: Number(paymentData.installments),
                payment_method_id: paymentData.payment_method_id,
                payer: {
                    email: paymentData.email
                }
            }
        });

        res.json({ success: true, status: response.status, id: response.id });
    } catch (error) {
        console.error("Error al procesar cobro:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de cobros ejecutándose en el puerto ${PORT}`);
});
