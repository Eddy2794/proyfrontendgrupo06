export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  baseUrl: 'http://localhost:4200',
  mercadopago: {
    publicKey: 'TEST-0f0dab6c-82a0-4221-8b9b-40ec5bac9283' // Clave pública de prueba
  },
  redirectUrls: {
    success: 'http://localhost:4200/pagos/historial?status=success',
    failure: 'http://localhost:4200/pagos/historial?status=failure',
    pending: 'http://localhost:4200/pagos/historial?status=pending'
  }
};
