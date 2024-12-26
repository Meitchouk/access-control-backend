export interface ValidatedUser {
    id: number;
    username: string;
    roles: Array<{ id: number; description: string }>;
}
