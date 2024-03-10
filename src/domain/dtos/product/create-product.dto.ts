import { Validators } from "../../../config";
import { UserEntity } from "../../entities/user.entity";

export class CreateProductDto {
    private constructor(
        public readonly name:string,
        public readonly available:boolean,
        public readonly price:number,
        public readonly description :string,
        public readonly user :string, //ID
        public readonly category :string, //ID
    ) {}
    
    static create(object: {[key:string]:any}): [error?:string, createProductDto?:CreateProductDto] {
        const { name, available=false, price, description, user, category } = object;
        let availableBoolean = available;

        if (!name) return ['Name is missing'];

        if (typeof available !== 'boolean') {
            availableBoolean = (available === 'true');
        }

        //if (!price) return ['Missing price'];
        //if (isNaN(price)) return ['Price must be a number'];
        //if (price <= 0) return ['Price must be greater than 0'];

        if (!user) return ['Missing user'];
        if (!Validators.isMongoID(user)) return ['Invalid user ID'];
        
        if (!category) return ['Missing category'];
        if (!Validators.isMongoID(category)) return ['Invalid category ID'];
        
        return [undefined, new CreateProductDto(name, availableBoolean, price, description, user, category)];
    }
}