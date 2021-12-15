import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderHistoryService } from '../order-history/order-history.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('OrderController', () => {
  let orderController: OrderController;
  let orderService: OrderService;
  let orderHistoryService: OrderHistoryService;

  const mockService = {

  }

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
        controllers: [OrderController],
        providers: [OrderService,OrderHistoryService ],
      })
      .overrideProvider(OrderService)
      .useValue(mockService)
      .compile();
      orderController = moduleRef.get<OrderController>(OrderController);
      orderService = moduleRef.get<OrderService>(OrderService);
      orderHistoryService = moduleRef.get<OrderHistoryService>(OrderHistoryService);
  });

  it('should be defined', ()=>{
    expect(orderController).toBeDefined();
  });

  // describe('OrderController: findAll', () => {
  //   it('should return an array of orders', async () => {
  //     jest
  //       .spyOn(orderService, 'findAll')
  //       .mockImplementation(jest.fn().mockResolvedValueOnce([Order]));
  //     const userID = "12";
  //     expect(await orderController.findAll(userID)).toStrictEqual([Order]);
  //   });
  // });
});