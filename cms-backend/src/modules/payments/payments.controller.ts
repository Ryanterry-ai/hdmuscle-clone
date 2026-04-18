import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-order')
  async createOrder(@Body() data: any) {
    return this.paymentsService.createOrder(data);
  }

  @Post('verify')
  async verifyPayment(@Body() body: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
    const isValid = await this.paymentsService.verifyPayment(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature
    );
    return { valid: isValid };
  }

  @Post('confirm')
  async confirmPayment(@Body() data: { orderId: string; razorpayId: string; amount: any; method: string }) {
    return this.paymentsService.confirmPayment(data.orderId, data.razorpayId, data);
  }

  @Get('transaction/:razorpayId')
  async getTransaction(@Param('razorpayId') razorpayId: string) {
    return this.paymentsService.getTransaction(razorpayId);
  }
}
