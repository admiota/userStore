import { PaginationDto } from './../../domain/dtos/shared/pagination.dto';
import { CategoryModel } from '../../data';
import { CustomError, UserEntity } from '../../domain';
import { CategoryEntity } from '../../domain/entities/category.entity';
import { CreateCategoryDto } from './../../domain/dtos/category/create-category.dto';
export class CategoryService {

    constructor() { }
    
    async createCategory(createCategoryDto: CreateCategoryDto, user: UserEntity) {
        const categoryExists = await CategoryModel.findOne({ name: createCategoryDto.name });
        if (categoryExists) throw CustomError.badRequest('Category already exists');
        try {
            const category = new CategoryModel({
                //pongo todas las primeras propiedades y luego la última que es la de user
                ...createCategoryDto,
                user:user.id
            })

            await category.save();
            return {
                id: category.id,
                name: category.name,
                available: category.available
            }
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    async getCategories(paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        try {
            const [total, categories] = await Promise.all([
                CategoryModel.countDocuments(),
                CategoryModel.find()
                    .skip((page - 1) * limit)
                    .limit(limit)
            ]);

            return {
                page: page,
                limit: limit,
                total: total,
                next: `/api/categories?page=${(page+1)}&limit=${limit}`,
                prev: ( page-1 >0)? `/api/categories?page=${(page-1)}&limit=${limit}` : null,
                categories: categories.map(category => CategoryEntity.fromObject(category))
            }
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

}