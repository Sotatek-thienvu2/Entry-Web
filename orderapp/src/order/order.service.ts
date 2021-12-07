import { Injectable } from '@nestjs/common';
import { OrderEntity, Status } from './order.entity' 
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateResult, DeleteResult, Repository } from  'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {}
  /**Get all order */
  async findAll (): Promise<OrderEntity[]> {
    return await this.orderRepo.find();
  }
  /**Get 1 by orderNumber */
  async findOne (orderNumber: string): Promise<OrderEntity> {
    return await this.orderRepo.findOne({orderNumber})
  }

  add(dto: CreateOrderDto): OrderEntity {
    try {
      const order = new OrderEntity();
      order.name = dto.name;
      order.description = dto.address;
      order.price = dto.price;
      order.orderNumber = this.makeid(5);
      this.orderRepo.insert(order);
      return order;
    } catch (error) {
      return null;
    }
}

  async update(order: OrderEntity): Promise<UpdateResult> {
    return await this.orderRepo.update(order.id, order);
  }
  /**cancel order
   * @param orderNumber 
   */
  async cancel(orderNumber: string): Promise<UpdateResult> {
    return this.orderRepo.update(
        { orderNumber },
        { status: Status.CANCELLED, updateTimestamp: new Date() },
    );
  }
  /**confirm order */
  async confirm(orderNumber: string): Promise<UpdateResult> {
    return this.orderRepo.update(
        { orderNumber },
        { status: Status.CONFIRMED, updateTimestamp: new Date() },
    );
  }
  /**
   * delete (may be use)
   * @param id 
   * @returns 
   */
  async delete(id): Promise<DeleteResult> {
    return await this.orderRepo.delete(id);
  } 
  
  /**generate random code */
  makeid(length){
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
    return result;
  }
  /**call payment and handle */
  doPayment(order: OrderEntity) {
    const self = this;
    
    const http = require('http');
    const data = JSON.stringify({
        name: order.name,
        description: order.description,
        price: order.price,
        orderNumber: order.orderNumber,
    });

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/payment',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
    };
    const req = http.request(options, (res) => {
        let responseString = '';

        res.on('data', (responseData) => {
            responseString += responseData;
        });
        res.on('end', () => {
            const responseJson = JSON.parse(responseString);
            if (responseJson.status === Status.CONFIRMED) {
                self.confirm(responseJson.orderNumber);
                setTimeout(() => {
                    self.orderRepo.update(
                        { orderNumber: responseJson.orderNumber },
                        { status: Status.DELIVERED, updateTimestamp: new Date() },
                    );

                }, 5000);
            } else if(responseJson.status === Status.CANCELLED) {
                self.cancel(responseJson.orderNumber);
            }
            else{
              //
            }
        });
    });

    req.write(data);
    req.end();

}
}