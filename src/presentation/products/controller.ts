
import { Request, Response } from "express";
import { CustomError } from "../../domain";
import { ProductService } from '../services/product.service';
import { CreateProductDto, PaginationDto } from '../../domain/dtos';

export class ProductController {
    constructor(
        public readonly productService: ProductService
    ) { }
    
    private handleError = (error: unknown, res: Response) => {
        //Si es un error mio personalizado lo devolvemos así o sino como un internal server error
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.log(`${error}`);
        return res.status(500).json({error: 'Internal server error'})
    }
    
    createProduct = (req: Request, res: Response) => {
        const [error, createProductDto] = CreateProductDto.create({
            ...req.body,
            user: req.body.user.id
        });
        if (error) res.status(400).json({ error });
        
        this.productService.createProduct(createProductDto!)
        .then(product => res.json(product))
        .catch(error=> this.handleError(error, res))
    }

    getProducts = (req: Request, res: Response) => {
        const { page = 1, limit = 10 } = req.query;
        const [error, paginationDto] = PaginationDto.create(Number(page), Number(limit));
        if (error) return res.status(400).json({ error });

        this.productService.getProducts(paginationDto!)
            .then(products => res.json(products))
            .catch(error => this.handleError(error, res))
    }
}