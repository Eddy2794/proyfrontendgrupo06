export const environment = {
  production: true,
  apiUrl: 'https://trabajo-final-psw.onrender.com/api', // Reemplazar con la URL real del backend en Render
  baseUrl: 'https://proyfrontendgrupo06-1.onrender.com', // URL del frontend en producción
  mercadopago: {
    publicKey: 'TEST-0f0dab6c-82a0-4221-8b9b-40ec5bac9283' // Reemplazar con la clave pública de producción de MercadoPago
  },
  redirectUrls: {
    success: 'https://proyfrontendgrupo06-1.onrender.com/pagos/historial?status=success',
    failure: 'https://proyfrontendgrupo06-1.onrender.com/pagos/historial?status=failure',
    pending: 'https://proyfrontendgrupo06-1.onrender.com/pagos/historial?status=pending'
  }
};
