const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(express.json());
app.use(cors());

// Servir archivos estáticos
app.use(express.static(__dirname));

// Configuración de Mercado Pago con tu Token de producción
const client = new MercadoPagoConfig({ 
    accessToken: 'APP_USR-4126115447875625-102316-ab8889ed41bd37674ae7c583195d34c8-3790163076' 
});

const payment = new Payment(client);

app.post('/api/process-payment', async (req, res) => {
    try {
        const body = {
            transaction_amount: Number(req.body.transaction_amount),
            token: req.body.token,
            description: req.body.description || "Cobro Terminal Web",
            installments: Number(req.body.installments || 1),
            payment_method_id: req.body.payment_method_id,
            issuer_id: req.body.issuer_id,
            payer: {
                email: req.body.payer?.email || "cliente@email.com",
                identification: req.body.payer?.identification
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
