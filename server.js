const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Configuración con tu Access Token de Producción
const client = new MercadoPagoConfig({ 
    accessToken: 'APP_USR-4126115447875625-102316-ab8889ed41bd37674ae7c583195d34c8-3790163076' 
});

const payment = new Payment(client);

app.post('/api/process-payment', async (req, res) => {
    try {
        const { token, transaction_amount, payment_method_id, installments, email, identification } = req.body;

        const body = {
            transaction_amount: Number(transaction_amount),
            token: token,
            description: "Cobro Terminal Web",
            installments: Number(installments || 1),
            payment_method_id: payment_method_id,
            payer: {
                email: email || "cliente@email.com",
                identification: {
                    type: identification?.type || "DNI",
                    number: identification?.number || "11111111"
                }
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
        console.error("Error en MP:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Error al procesar el pago' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
});
