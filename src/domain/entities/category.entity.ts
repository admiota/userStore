import { CustomError } from "../errors/custom.error";

export class CategoryEntity{
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly available: boolean
    ) { 
    }

    static fromObject(object: { [key: string]:any }) {
        const { id, _id, name, available } = object;
    
        if (!_id && !id) { throw CustomError.badRequest('Missing Id') }
        if (!name) { throw CustomError.badRequest('Missing Name') }
        
        return new CategoryEntity(id || _id, name, available);
    }
}