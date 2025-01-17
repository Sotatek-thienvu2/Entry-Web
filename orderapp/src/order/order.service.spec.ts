import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderHistoryService } from '../order-history/order-history.service';
import { ConfigService } from '@nestjs/config';
import { Order } from './order.entity';
import { OrderMockData, OrderListMockData, CreateOrderMockDto} from './mock/mockdata';
import { OrderStatus } from '../common/enum/status.enum';
import { HttpStatus, HttpException } from '@nestjs/common';
describe('OrderService', () => {
  let service: OrderService;
  let orderHistoryService: OrderHistoryService;
  let mockOrderHistoryService = {
    insert: jest.fn().mockImplementation((status: OrderStatus, orderNumber: string)=>{
      Promise.resolve({
        id: 9,
        orderNumber: '5x5sjP3m',
        status: OrderStatus.CREATED,
        createTimestamp: new Date('2021-12-15T10:01:01.000Z'),
      })
    })
  };
  let mockOrderRepository = {
    findAll: jest.fn().mockImplementation((userID: string) =>
      Promise.resolve(OrderListMockData),
    ),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockReturnThis(),
    })),
    findOne: jest.fn().mockImplementation((id = 9) =>
      Promise.resolve(OrderMockData),
    ),
    makeid: jest.fn().mockImplementation((number = 8) =>
      "5x5sjP3m"
    ),
    insert: jest.fn().mockImplementation((order: Order )=> {
      generatedMaps: [
        {
          id: 9
        }
      ]
    }),
    update: jest.fn().mockImplementation((id, order)=>{
      Promise.resolve(order)
    }),
    delete: jest.fn().mockImplementation((id: number) => Promise.resolve({affected: 1}))
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        ConfigService,
        OrderHistoryService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
      ],
    })
      .overrideProvider(OrderHistoryService)
      .useValue({})
      .compile();

    service = module.get<OrderService>(OrderService);
    orderHistoryService = module.get<OrderHistoryService>(OrderHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it(`should get all the orders of userID and return them successfully`, async () => {
    const userID = "12"
    await service.findAll(userID);
    expect(mockOrderRepository.createQueryBuilder).toHaveBeenCalled();
  });

  it(`should get the order that has ID equal 9`, async () => {
    expect(await service.findOne(9)).toEqual(OrderMockData);
  });

  it(`should get the created order`, async () => {
    mockOrderRepository = {
      ...mockOrderRepository,
      insert: jest.fn().mockResolvedValue(OrderMockData),
    };
    mockOrderHistoryService = {
      insert: jest.fn().mockResolvedValue({
        id: 9,
        orderNumber: "5x5sjP3m",
        status: OrderStatus.CREATED,
        createTimestamp: new Date("2021-12-15T10:01:01.000Z")
      })
    }
    try {
      const res = service.create(CreateOrderMockDto, "12")
      expect(res).toEqual(OrderMockData);
    } catch (err) {
      new HttpException( err , HttpStatus.BAD_REQUEST)
    }
  });

  it(`should update order with id`, async () => {
    await mockOrderRepository.update( 9, OrderMockData)
    expect(await service.findOne(9)).toEqual(OrderMockData);
  });

  it(`should update order with id`, async () => {
    const order = await service.findOne(9)
    mockOrderHistoryService.insert( order.orderNumber , OrderStatus.CREATED)
    await service.update({
      id: 9,
      orderNumber: '5x5sjP3m',
      userID: '12',
      name: 'Bánh tráng nướng',
      category: 'Đồ ăn',
      image: 'https://yummyday.vn/uploads/images/cach-lam-banh-trang-nuong-6.jpg',
      address: 'Nhà ăn sinh viên Bách Khoa',
      description: 'Ăn ngon thì vl',
      price: 25000,
      quantity: 15,
      status: OrderStatus.DELIVERED,
      createTimestamp: new Date('2021-12-15T10:01:01.000Z'),
      updateTimestamp: new Date('2021-12-15T10:11:54.000Z')
    })
    expect(await service.findOne(9)).toEqual(OrderMockData);
  });

  it(`should cancel order with id`, async () => {
    const order = await service.findOne(9)
    mockOrderHistoryService.insert( order.orderNumber , OrderStatus.CANCELLED)
    await service.update({
      id: 9,
      orderNumber: '5x5sjP3m',
      userID: '12',
      name: 'Bánh tráng nướng',
      category: 'Đồ ăn',
      image: 'https://yummyday.vn/uploads/images/cach-lam-banh-trang-nuong-6.jpg',
      address: 'Nhà ăn sinh viên Bách Khoa',
      description: 'Ăn ngon thì vl',
      price: 25000,
      quantity: 15,
      status: OrderStatus.CANCELLED,
      createTimestamp: new Date('2021-12-15T10:01:01.000Z'),
      updateTimestamp: new Date('2021-12-15T10:11:54.000Z')
    })
    expect(await service.findOne(9)).toEqual(OrderMockData);
  });

  it(`should confirm order with id`, async () => {
    const order = await service.findOne(9)
    mockOrderHistoryService.insert( order.orderNumber , OrderStatus.CONFIRMED)
    await service.update({
      id: 9,
      orderNumber: '5x5sjP3m',
      userID: '12',
      name: 'Bánh tráng nướng',
      category: 'Đồ ăn',
      image: 'https://yummyday.vn/uploads/images/cach-lam-banh-trang-nuong-6.jpg',
      address: 'Nhà ăn sinh viên Bách Khoa',
      description: 'Ăn ngon thì vl',
      price: 25000,
      quantity: 15,
      status: OrderStatus.CONFIRMED,
      createTimestamp: new Date('2021-12-15T10:01:01.000Z'),
      updateTimestamp: new Date('2021-12-15T10:11:54.000Z')
    })
    expect(await service.findOne(9)).toEqual(OrderMockData);
  });

  it(`should delete order with id`, async () => {
    await mockOrderRepository.delete(9)
    expect(await service.delete(9)).toEqual({affected: 1});
  });

  const httpMocks = require('node-mocks-http');
  const options = {
    hostname: 'localhost',
    port: 8002,
    path: '/payment',
    method: 'POST',
    headers: {
        'DUMMY-PIN': 'SOTATEK',
    },
  };
  const req = httpMocks.createRequest(options);
  const res = httpMocks.createResponse({
    eventEmitter: require('events').EventEmitter
  });
  it('should do something', function(done) {
    res.on('end', function() {
      // expect(service.pay( OrderMockData , "12")).toBeCalled();
      done();
    });
    route(req,res);
    req.send('data sent in request');
  });

  function route(req,res){
    let data= [];
    req.on("data", chunk => {
        data.push(chunk)
    });
    req.on("end", () => {
        const newBuffer = Buffer.concat(data);
        res.write(newBuffer);
        res.end();
    });
    
}
});
