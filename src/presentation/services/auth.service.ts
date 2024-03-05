import { JwtAdapter, bcryptAdapter } from "../../config";
import { UserModel } from "../../data";
import { CustomError, RegisterUserDto, UserEntity } from "../../domain";
import { LoginUserDto } from "../../domain/dtos";

export class AuthService {
    constructor() { }
    
    public async registerUser(registerUserDto: RegisterUserDto) {
        const existUser = await UserModel.findOne({ email: registerUserDto.email });
        if (existUser) throw CustomError.badRequest('Email already exist');
        try {
            const user = new UserModel(registerUserDto);
            //Encriptar la contraseña
            user.password = bcryptAdapter.hash(registerUserDto.password);
            await user.save();
            //JWT<----Para mantener la autenticación del usuario

            //Email de confirmación

            //Le quitamos el password para devolverlo en la response
            const {password, ...rest} = UserEntity.fromObject(user)

            return {
                user: {...rest},
                token:'abc'
            };
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    public async loginUser(loginUserDto: LoginUserDto) {
        try {
            const user = await UserModel.findOne({ email: loginUserDto.email });
            if (!user) throw CustomError.badRequest('Email not exist');
            const isMatch = bcryptAdapter.compare(loginUserDto.password, user.password);
            if (!isMatch) throw CustomError.badRequest('Password not valid');
            const { password, ...rest } = UserEntity.fromObject(user);
            const token = await JwtAdapter.generateToken({ id: user.id });
            if (!token) throw CustomError.internalServer('Error while creating JWT');

            return {
                user: { ...rest },
                token: token
            };
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }
}