import { User } from 'src/user/schema/user.entity';
export declare class RefreshToken {
    id: string;
    token: string;
    user: User;
    userId: string;
    expires_at: Date;
    is_revoked: boolean;
    created_at: Date;
}
