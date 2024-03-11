import path from 'path';
import fs from 'fs';
import { UploadedFile } from "express-fileupload";
import { Uuid } from '../../config';
import { CustomError } from '../../domain';

export class FileUploadService{
    constructor(
        private readonly uuid = Uuid.v4
    ) { }
    
    private checkFolder(folderPath:string) {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
    }

    async uploadSingle(
        file: UploadedFile, 
        folder: string = 'uploads',
        validExtentions: string[] = ['png', 'jpg', 'jpeg', 'pdf']
    ) {
        console.log(file)
        try {
            //obtenemos la extensión
            console.log(file)
            const fileExtension = file.mimetype.split('/').at(1) ?? '';
            //Verificar si la extensión es válida
            if (!validExtentions.includes(fileExtension)) {
                throw CustomError.badRequest(`Invalid extension: ${fileExtension}, valid ones ${validExtentions}`);
            }


            const destination = path.resolve(__dirname, '../../../', folder);
            this.checkFolder(destination);

            const fileName = `${this.uuid()}.${fileExtension}`;
            file.mv(`${destination}/${fileName}`);
            return { fileName };
        } catch (error) {
            console.log({ error });
            throw error;
        }
    }

    async uploadMultiple(
        files:UploadedFile[], 
        folder: string = 'uploads',
        validExtentions: string[] = ['png', 'jpg', 'jpeg', 'pdf']
    ) {
        const uploadesFiles = Promise.all(files.map(file => this.uploadSingle(file, folder, validExtentions)));
        return uploadesFiles;
    }
}