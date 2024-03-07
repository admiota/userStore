import { JwtAdapter, bcryptAdapter, envs } from "../../config";
import { UserModel } from "../../data";
import { CustomError, RegisterUserDto, UserEntity } from "../../domain";
import { LoginUserDto } from "../../domain/dtos";
import { EmailService } from "./email.service";

export class AuthService {
    constructor(
        private readonly emailService:EmailService
    ) { }
    
    public async registerUser(registerUserDto: RegisterUserDto) {
        const existUser = await UserModel.findOne({ email: registerUserDto.email });
        if (existUser) throw CustomError.badRequest('Email already exist');
        try {
            const user = new UserModel(registerUserDto);
            //Encriptar la contraseña
            user.password = bcryptAdapter.hash(registerUserDto.password);
            await user.save();
            
            //Email de confirmación
            await this.sendValidationLink(user.email);

            //Le quitamos el password para devolverlo en la response
            const { password, ...rest } = UserEntity.fromObject(user);

            //JWT<----Para mantener la autenticación del usuario
            const token = await JwtAdapter.generateToken({ id: user.id });
            if (!token) throw CustomError.internalServer('Error while creating JWT');

            return {
                user: {...rest},
                token: token
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

    private async sendValidationLink(email:string) {
        const token = await JwtAdapter.generateToken({ email: email });
        if (!token) throw CustomError.internalServer('Error getting token');

        const link = `${envs.WEBSERVICE_URL}auth/validate-email/${token}`;

        const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Validación de Correo Electrónico</title>
            <style>
                body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                text-align: center;
                }
                .container {
                max-width: 600px;
                margin: 50px auto;
                padding: 20px;
                border: 1px solid #ccc;
                border-radius: 10px;
                background-color: #f9f9f9;
                }
                h1 {
                color: #333;
                }
                .btn {
                display: inline-block;
                padding: 10px 20px;
                margin-top: 20px;
                font-size: 16px;
                background-color: #007bff;
                color: #fff;
                text-decoration: none;
                border-radius: 5px;
                }
                .btn:hover {
                background-color: #0056b3;
                }
            </style>
            </head>
            <body>
            <div class="container">
                <h1>Valida tu correo electrónico</h1>
                <p>Para completar tu registro, por favor haz clic en el botón de abajo para confirmar tu dirección de correo electrónico.</p>
                <a href="${link}" class="btn">Confirmar Correo Electrónico</a>
            </div>
            </body>
            </html>
        `;

        const sendEmailOptions = {
            to: email,
            subject: 'Validar email',
            htmlBody: html,
            //attachments: attachements,
        }

        const isSent = this.emailService.sendEmail(sendEmailOptions);
        if (!isSent) throw CustomError.internalServer('Error sending email');

        return true;
    }

    public validateEmail = async (token:string) => {
        const payload = await JwtAdapter.validateToken(token);
        if (!payload) throw CustomError.unauthorized('Invalid token');

        const { email } = payload as { email: string };
        if (!email) throw CustomError.internalServer('Email not in token');

        const user = await UserModel.findOne({ email });
        if (!user) throw CustomError.internalServer('Email not exists');

        user.emailValidated = true;
        await user.save();
        return true;
    }


}