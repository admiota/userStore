import { ProductModel } from "../../data";
import { CustomError, UserEntity } from "../../domain";
import { PaginationDto } from "../../domain/dtos";
import { CreateProductDto } from "../../domain/dtos/product/create-product.dto";

export class ProductService {
    constructor() { }
    
    
    async createProduct(createProductDto: CreateProductDto) {
        try {
            const productExists = await ProductModel.findOne({name: createProductDto.name});  
            if (productExists) throw CustomError.badRequest('Product already exists');
            const product = new ProductModel(createProductDto);
            
            await product.save();
            return product;

        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }


    async getProducts(paginationDto:PaginationDto) {
        const { page, limit } = paginationDto;
        try {
            const [total, products] = await Promise.all([
                ProductModel.countDocuments(),
                ProductModel.find()
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .populate('user', 'name email')
                    .populate('category')
            ]);
            //const productsMapped = products.map(product => ProductEntity.fromObject(product));
            //console.log(productsMapped);
            return {
                page: page,
                limit: limit,
                total: total,
                next: `/api/products?page=${(page+1)}&limit=${limit}`,
                prev: (page - 1 > 0) ? `/api/products?page=${(page - 1)}&limit=${limit}` : null,
                
                products: products
            }
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

}