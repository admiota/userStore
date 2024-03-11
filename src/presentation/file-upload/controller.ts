import { Request, Response } from "express"
import { CustomError } from "../../domain";
import { FileUploadService } from "../services/file-upload.service";
import { UploadedFile } from "express-fileupload";


export class FileUploadController {

    constructor(
        public readonly fileUploadService:FileUploadService
    ) { }

    private handleError = (error: unknown, res: Response) => {
        //Si es un error mio personalizado lo devolvemos así o sino como un internal server error
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.log(`${error}`);
        return res.status(500).json({error: 'Internal server error'})
    }
    
    uploadFile = (req: Request, res: Response) => {
        const type = req.params.type;

        const file = req.body.files.at(0) as UploadedFile;
 
        this.fileUploadService.uploadSingle(file, `uploads/${type}`)
            .then(fileUploaded => res.json(fileUploaded))
            .catch(error=>this.handleError(error, res))
    }

    uploadMultipleFiles = (req: Request, res: Response) => {
        const type = req.params.type;
        const files = req.body.files as UploadedFile[];
 
        this.fileUploadService.uploadMultiple(files, `uploads/${type}`)
            .then(fileUploaded => res.json(fileUploaded))
            .catch(error=>this.handleError(error, res))
    }
}