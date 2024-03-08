
export class CreateCategoryDto{
    private constructor(
        public readonly name:string,
        public readonly available:boolean,
    ) { }
    
    static create(object: { [key: string]:any }): [error?:string, createCategoryDto?:CreateCategoryDto] {
        const { name, available = false } = object;
        let availableBoolean = available;
        if (!name) return ['Name is missing'];

        if (typeof available !== 'boolean') {
            availableBoolean = (available === 'true');
        }
        
        return [undefined, new CreateCategoryDto(name, availableBoolean)];
    }
}