const express = require('express');
const cors = require('cors');
const path = require('path');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Servir la carpeta actual para entregar index.html
app.use(express.static(__dirname));

// Configuración de Credenciales de Mercado Pago
// Reemplaza con tu Access Token real de Producción (APP_USR-...)
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'TU_ACCESS_TOKEN_AQUI';

const client = new MercadoPagoConfig({ 
    accessToken: ACCESS_TOKEN 
});

const payment = new Payment(client);

// Ruta principal para servir la terminal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint de procesamiento de pagos
app.post('/api/process-payment', async (req, res) => {
    try {
        const {
            transaction_amount,
            token,
            description,
            installments,
            payment_method_id,
            issuer_id,
            payer
        } = req.body;

        // Validación estricta en servidor
        if (!transaction_amount || isNaN(transaction_amount) || transaction_amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'El monto de la transacción debe ser un número válido mayor a 0.'
            });
        }

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Falta el token de seguridad de la tarjeta.'
            });
        }

        const body = {
            transaction_amount: Number(transaction_amount),
            token: token,
            description: description || "Cobro Terminal Web",
            installments: Number(installments || 1),
            payment_method_id: payment_method_id,
            issuer_id: issuer_id,
            payer: {
                email: payer?.email || "cliente@email.com",
                identification: payer?.identification || {}
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
        console.error("Error al procesar el pago en Mercado Pago:", error);
        
        // Manejo detallado de errores de la API de Mercado Pago
        const errorMessage = error.message || error.cause?.[0]?.description || 'Error interno al procesar el pago';
        
        res.status(500).json({ 
            success: false, 
            error: errorMessage 
        });
    }
});

// Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[Farmacia Gabinoe Terminal] Servidor activo en puerto ${PORT}`);
});
