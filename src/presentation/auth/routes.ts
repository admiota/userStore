import { Router } from 'express';
import { AuthController } from './controller';
import { AuthService } from '../services/auth.service';




export class AuthRoutes {


  static get routes(): Router {

    const router = Router();
    const authService = new AuthService();
    const authController = new AuthController(authService);
    // Definir las rutas
    router.post('/register', authController.registerUser );
    
    router.post('/login', authController.loginUser);
     
    router.get('/validate-email/:token', authController.validateEmail );


    return router;
  }


}
