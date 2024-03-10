import { envs } from "../../config";
import { CategoryModel, MongoDatabase, ProductModel, UserModel } from "../mongo";
import { seedData } from "./data";


(async () => {
    main();
})();


const randomBetween0AndX = (x:number) => {
    return Math.floor(Math.random() * x);//entre 0 y x
}


async function main() {
    await MongoDatabase.connect({
        mongoUrl: envs.MONGO_URL,
        dbName: envs.MONGO_DB_NAME,
    });

    //0.Borrar todo!
    await Promise.all([
        CategoryModel.deleteMany(),
        ProductModel.deleteMany(),
        UserModel.deleteMany(),
    ]);

    //1.Crear usuarios
    const users = await UserModel.insertMany(seedData.users);

    //2.Crear categorias
    const categories = await CategoryModel.insertMany(
        seedData.categories.map(category => {
            return {
                ...category,
                user: users[0]._id
            }
        })
    )

    //3.Crear productos
    const products = await ProductModel.insertMany(
        seedData.products.map(product => {
            return {
                ...product,
                user: users[randomBetween0AndX(seedData.users.length - 1)]._id,
                category: categories[randomBetween0AndX(seedData.categories.length - 1)]._id,
            }
        })
    )

    console.log('BD has been Seeded')


    await MongoDatabase.disconnect();
}