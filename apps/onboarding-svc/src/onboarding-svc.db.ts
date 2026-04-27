import { DbService } from "@app/db";
import { Injectable } from "@nestjs/common";
import { UserDto } from "@app/db/dto/user.dto";

@Injectable()
export class OnBoardingDB {
    constructor(private readonly db: DbService) {}
    // Sample Code
    // async getAllUsers() {
    //     return this.db.query("SELECT * FROM users");
    // }

    // async getUserById(id: string) {
    //     return this.db.query(`SELECT * FROM "users" WHERE id = $1`, [id]);
    // }

    // async validateUser(email: string, password: string) {
    //     return this.db.query(`
    //         SELECT u.* FROM "users" u
    //         JOIN "user_creds" uc ON u.id = uc.user_id
    //         WHERE u.email = $1 AND uc.password = $2`,
    //         [email, password]
    //     );
    // }

    // async createUser(newUser: UserDto) {
    //     const { firstName, middleName, lastName, email, isActive } = newUser;

    //     const params = [
    //         firstName ?? null,
    //         middleName ?? null,
    //         lastName ?? null,
    //         email,
    //         typeof isActive === 'undefined' ? true : isActive,
    //     ];

    //     const [created] = await this.db.query(
    //         `INSERT INTO users (first_name, middle_name, last_name, email, is_active)
    //          VALUES ($1, $2, $3, $4, $5)
    //          RETURNING *`,
    //         params
    //     );

    //     return created;
    // }
}
