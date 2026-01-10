export declare class User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    created_at: Date;
    updated_at: Date;
    last_login?: Date;
    is_active: boolean;
}
