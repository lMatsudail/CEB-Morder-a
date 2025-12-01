const axios = require('axios');
const crypto = require('crypto');

/**
 * Servicio de integración con Wompi (Bancolombia)
 * Documentación: https://docs.wompi.co/docs/en/introduction
 */

class WompiService {
  constructor() {
    // Usar variables de entorno para las llaves
    this.publicKey = process.env.WOMPI_PUBLIC_KEY || 'pub_test_QxG0jJJQQGwh3OOl1EwOHkG3CxTVhfSU'; // Test key
    this.privateKey = process.env.WOMPI_PRIVATE_KEY || ''; // Para webhooks
    this.baseURL = process.env.WOMPI_URL || 'https://sandbox.wompi.co/v1'; // sandbox o production
    this.eventSecret = process.env.WOMPI_EVENT_SECRET || ''; // Para validar webhooks
  }

  /**
   * Crear referencia de pago
   * @param {Object} orderData - Datos de la orden
   * @returns {Object} Datos de la transacción incluyendo URL de pago
   */
  async createPaymentLink(orderData) {
    try {
      const { orderId, amount, currency = 'COP', customerEmail, description, paymentMethods } = orderData;

      // Validaciones básicas antes de llamar a Wompi
      if (!orderId) throw new Error('orderId requerido');
      if (!amount || amount <= 0) throw new Error('Monto inválido');
      if (!customerEmail) throw new Error('Email de cliente requerido');
      if (!this.publicKey || !this.publicKey.startsWith('pub_')) {
        throw new Error('WOMPI_PUBLIC_KEY inválida o no configurada');
      }

      // Wompi requiere el monto en centavos
      const amountInCents = Math.round(amount * 100);

      // Referencia única para la transacción
      const reference = `ORDER-${orderId}-${Date.now()}`;

      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';

      // Crear link de pago
      const payload = {
        public_key: this.publicKey,
        currency,
        amount_in_cents: amountInCents,
        reference,
        redirect_url: `${frontendBase}/checkout?orderId=${orderId}`, // Redirigir al flujo que hace polling
        customer_email: customerEmail,
        customer_data: {
          email: customerEmail,
          full_name: orderData.customerName || 'Cliente CEB'
        }
      };

      // Métodos de pago opcionales configurables por env (e.g. CARD,PSE,NEQUI)
      // Determinar métodos de pago permitidos
      const allowed = ['CARD','PSE','NEQUI','BANCOLOMBIA_TRANSFER','CASH'];
      let methodsSource = [];
      if (paymentMethods && Array.isArray(paymentMethods) && paymentMethods.length) {
        methodsSource = paymentMethods;
      } else if (process.env.WOMPI_PAYMENT_METHODS) {
        methodsSource = process.env.WOMPI_PAYMENT_METHODS.split(',');
      }
      const normalized = methodsSource
        .map(m => m.trim().toUpperCase())
        .filter(m => allowed.includes(m));
      if (normalized.length) {
        payload.payment_method_types = normalized;
      }

      // Agregar descripción si existe
      if (description) {
        payload.payment_description = description;
      }

      // Log controlado (sin datos sensibles)
      console.log('[WOMPI] Creando payment_link', {
        reference,
        amountInCents,
        redirect_url: payload.redirect_url,
        payment_method_types: payload.payment_method_types
      });

      const response = await axios.post(
        `${this.baseURL}/payment_links`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.publicKey}`
          }
        }
      );

      return {
        success: true,
        data: {
          paymentId: response.data.data.id,
          paymentUrl: response.data.data.url,
          reference,
          expiresAt: response.data.data.expires_at
        }
      };

    } catch (error) {
      // Extraer mensajes detallados de Wompi si existen
      const wompiDetail = error.response?.data;
      console.error('Error creando link de pago Wompi:', wompiDetail || error.message);
      return {
        success: false,
        error: wompiDetail?.error?.messages || wompiDetail?.error || error.message || 'Error al crear link de pago'
      };
    }
  }

  /**
   * Consultar estado de una transacción
   * @param {string} transactionId - ID de la transacción en Wompi
   * @returns {Object} Estado de la transacción
   */
  async getTransactionStatus(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transactions/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.publicKey}`
          }
        }
      );

      const transaction = response.data.data;

      return {
        success: true,
        data: {
          id: transaction.id,
          status: transaction.status, // APPROVED, DECLINED, VOIDED, ERROR
          reference: transaction.reference,
          amount: transaction.amount_in_cents / 100,
          currency: transaction.currency,
          paymentMethod: transaction.payment_method_type,
          createdAt: transaction.created_at,
          finalizedAt: transaction.finalized_at
        }
      };

    } catch (error) {
      console.error('Error consultando transacción Wompi:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Error al consultar estado de transacción'
      };
    }
  }

  /**
   * Validar firma de evento webhook
   * @param {Object} event - Evento recibido del webhook
   * @param {string} signature - Firma enviada en el header
   * @returns {boolean} true si la firma es válida
   */
  validateWebhookSignature(event, signature) {
    if (!this.eventSecret) {
      console.warn('WOMPI_EVENT_SECRET no configurado, omitiendo validación de firma');
      return true; // En desarrollo/testing
    }

    try {
      // Wompi firma: SHA256(event_data + timestamp + secret)
      const eventString = JSON.stringify(event.data);
      const timestamp = event.timestamp || event.sent_at;
      const payload = `${eventString}${timestamp}${this.eventSecret}`;
      
      const hash = crypto
        .createHash('sha256')
        .update(payload)
        .digest('hex');

      return hash === signature;
    } catch (error) {
      console.error('Error validando firma de webhook:', error);
      return false;
    }
  }

  /**
   * Procesar evento de webhook
   * @param {Object} event - Evento recibido
   * @returns {Object} Datos procesados del evento
   */
  processWebhookEvent(event) {
    const eventType = event.event;
    const transaction = event.data?.transaction;

    if (!transaction) {
      return { success: false, error: 'Evento sin datos de transacción' };
    }

    return {
      success: true,
      data: {
        eventType,
        transactionId: transaction.id,
        reference: transaction.reference,
        status: transaction.status,
        amount: transaction.amount_in_cents / 100,
        currency: transaction.currency,
        paymentMethod: transaction.payment_method_type,
        createdAt: transaction.created_at,
        finalizedAt: transaction.finalized_at
      }
    };
  }

  /**
   * Mapear estado de Wompi a estado interno
   * @param {string} wompiStatus - Estado de Wompi (APPROVED, DECLINED, etc.)
   * @returns {string} Estado interno
   */
  mapPaymentStatus(wompiStatus) {
    const statusMap = {
      'APPROVED': 'paid',
      'DECLINED': 'cancelled',
      'VOIDED': 'cancelled',
      'ERROR': 'cancelled',
      'PENDING': 'pending'
    };

    return statusMap[wompiStatus] || 'pending';
  }
}

module.exports = new WompiService();
