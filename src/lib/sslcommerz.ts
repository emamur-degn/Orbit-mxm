export interface SSLCommerzInitParams {
  tran_id: string;
  total_amount: number;
  currency?: string;
  product_name: string;
  product_category: string;
  cus_name: string;
  cus_email: string;
  cus_phone: string;
  cus_add1?: string;
  cus_city?: string;
  cus_country?: string;
}

export interface SSLCommerzInitResponse {
  status: 'SUCCESS' | 'FAILED';
  failedreason?: string;
  sessionkey?: string;
  GatewayPageURL?: string;
  directPaymentURL?: string;
}

export interface SSLCommerzValidationResponse {
  status: 'VALID' | 'VALIDATED' | 'INVALID_TRANSACTION' | 'FAILED';
  tran_date?: string;
  tran_id?: string;
  val_id?: string;
  amount?: string;
  store_amount?: string;
  currency?: string;
  bank_tran_id?: string;
  card_type?: string;
  card_no?: string;
  card_issuer?: string;
  card_brand?: string;
  currency_type?: string;
  currency_amount?: string;
  error?: string;
}

class SSLCommerzService {
  private storeId: string;
  private storePassword: string;
  private isLive: boolean;
  private baseUrl: string;
  private appUrl: string;

  constructor() {
    this.storeId = process.env.SSLCZ_STORE_ID || 'testbox';
    this.storePassword = process.env.SSLCZ_STORE_PASSWORD || 'qwerty';
    this.isLive = process.env.SSLCZ_IS_LIVE === 'true';
    this.baseUrl = this.isLive
      ? 'https://securepay.sslcommerz.com'
      : 'https://sandbox.sslcommerz.com';
    this.appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  }

  /**
   * Step 1: Initiate a payment session with SSLCommerz
   */
  async initPayment(params: SSLCommerzInitParams): Promise<SSLCommerzInitResponse> {
    const formData = new URLSearchParams();
    formData.append('store_id', this.storeId);
    formData.append('store_passwd', this.storePassword);
    formData.append('total_amount', params.total_amount.toFixed(2));
    formData.append('currency', params.currency || 'BDT');
    formData.append('tran_id', params.tran_id);

    // Callback URLs
    formData.append('success_url', `${this.appUrl}/api/payment/success`);
    formData.append('fail_url', `${this.appUrl}/api/payment/fail`);
    formData.append('cancel_url', `${this.appUrl}/api/payment/cancel`);
    formData.append('ipn_url', `${this.appUrl}/api/payment/ipn`);

    // Product Metadata
    formData.append('shipping_method', 'NO');
    formData.append('product_name', params.product_name);
    formData.append('product_category', params.product_category || 'SaaS');
    formData.append('product_profile', 'non-physical-goods');

    // Customer Information
    formData.append('cus_name', params.cus_name);
    formData.append('cus_email', params.cus_email);
    formData.append('cus_add1', params.cus_add1 || 'Dhaka');
    formData.append('cus_city', params.cus_city || 'Dhaka');
    formData.append('cus_postcode', '1212');
    formData.append('cus_country', params.cus_country || 'Bangladesh');
    formData.append('cus_phone', params.cus_phone);

    const response = await fetch(`${this.baseUrl}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`SSLCommerz gateway HTTP error: ${response.status}`);
    }

    const data = (await response.json()) as SSLCommerzInitResponse;
    return data;
  }

  /**
   * Step 2: Validate completed transaction via SSLCommerz Order Validation API
   */
  async validateTransaction(valId: string): Promise<SSLCommerzValidationResponse> {
    const url = new URL(`${this.baseUrl}/validator/api/validationserverAPI.php`);
    url.searchParams.set('val_id', valId);
    url.searchParams.set('store_id', this.storeId);
    url.searchParams.set('store_passwd', this.storePassword);
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`SSLCommerz validation HTTP error: ${response.status}`);
    }

    return (await response.json()) as SSLCommerzValidationResponse;
  }
}

export const sslcommerz = new SSLCommerzService();
