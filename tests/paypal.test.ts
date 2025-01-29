import { generateAccessToken, paypal } from "../lib/paypal";

// Test to generate access token from paypal
test('generates token from paypal', async() => {
  const tokenResponse = await generateAccessToken();
  console.log(tokenResponse);
  expect(typeof tokenResponse).toBe('string');
  expect(tokenResponse.length).toBeGreaterThan(0);
  
})

// Test to create a paypal order
test('creates a paypal order', async () => {
  const price = 10.0;

  const orderResponse = await paypal.createOrder(price);
  console.log(orderResponse);
  expect(orderResponse).toHaveProperty('id');
  expect(orderResponse).toHaveProperty('status');
  expect(orderResponse.status).toBe('CREATED');
});

// Test to capture payment with mock order
// test('simulate capturing a payment from an order', async () => {
//   const orderId = '100'

//   const mockCapturePayment = jest
//     .spyOn(paypal, 'capturePayment')
//     .mockResolvedValue({
//       status: 'COMPLETED',
//     });

//     const captureResponse = await paypal.capturePayment(orderId);
//     expect(captureResponse).toHaveProperty('status', 'COMPLETED');

//     mockCapturePayment.mockRestore();
// });

test('capturePayment calls fetch with correct parameters and handles response', async () => {
  // fetch のオリジナル関数を保存
  const originalFetch = global.fetch;

  // fetch をモック化
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ status: 'COMPLETED' }),
    })
  ) as jest.Mock;

  const orderId = '100';
  const captureResponse = await paypal.capturePayment(orderId);

  // fetch が正しく呼び出されたことを検証
  expect(global.fetch).toHaveBeenCalledWith(
    `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        Authorization: expect.stringContaining('Bearer '), // トークンが含まれているかチェック
      }),
    })
  );

  // 期待されるレスポンスを取得できたか確認
  expect(captureResponse).toHaveProperty('status', 'COMPLETED');

  // モックを元の fetch に戻す
  global.fetch = originalFetch;
});