export class CreatePaymentDto {
    readonly orderId: number;
    readonly name: string;
    readonly description: string;
    readonly address: string;
    readonly price: number;
    readonly orderNumber: string;
}