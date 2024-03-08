import { Request, Response } from "express"
import { CreateCategoryDto, CustomError } from "../../domain";
import { CategoryService } from "../services/category.service";
import { PaginationDto } from "../../domain/dtos";

export class CategoryController {

    constructor(
        public readonly categoryService:CategoryService
    ) { }

    private handleError = (error: unknown, res: Response) => {
        //Si es un error mio personalizado lo devolvemos así o sino como un internal server error
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.log(`${error}`);
        return res.status(500).json({error: 'Internal server error'})
    }
    
    createCategory = (req: Request, res: Response) => {
        const [error, createCategoryDto] = CreateCategoryDto.create(req.body);
        if (error) return res.status(400).json({ error });
        this.categoryService.createCategory(createCategoryDto!, req.body.user)
            .then(category => res.status(201).json(category))
            .catch(error => this.handleError(error, res));
    }

    getCategories = (req: Request, res: Response) => {
        const { page = 1, limit = 10 } = req.query;
        const [error, paginationDto] = PaginationDto.create(Number(page), Number(limit));
        if (error) return res.status(400).json({ error });

        this.categoryService.getCategories(paginationDto!)
            .then(allCategories => res.json(allCategories))
            .catch(error => this.handleError(error, res))
    }
}