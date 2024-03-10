import { CustomError } from "../errors/custom.error";

export class ProductEntity{
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly price: number,
        public readonly description: string
    ) { 
    }

    static fromObject(object: { [key: string]:any }) {
        const { id, _id, name, price, description } = object;
    
        if (!_id && !id) { throw CustomError.badRequest('Missing Id') }
        if (!name) { throw CustomError.badRequest('Missing Name') }
        if (!price) { throw CustomError.badRequest('Missing Price') }
        if (isNaN(price)) { throw CustomError.badRequest('Price has to be a number') }
        if (price<=0) { throw CustomError.badRequest('Price has to be greater than 0') }
        
        return new ProductEntity(id || _id, name, price, description);
    }
}