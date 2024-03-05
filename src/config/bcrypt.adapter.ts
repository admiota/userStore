import { compareSync, genSaltSync, hashSync } from 'bcryptjs'

export const bcryptAdapter = {
    hash: (password: string) => {
        //Da 10 vueltas
        const salt = genSaltSync();
        return hashSync(password, salt);
    },
    compare: (password: string, hashed: string) => {
        return compareSync(password, hashed)
    }
}