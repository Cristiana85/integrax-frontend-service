
export class Account {
    id?: number;

    tenantId?: number;

    uniqueId?: string;

    password?: string;

    active?: boolean;

    name?: string;

    surname?: string;

    loginDateTime?: Date;

    accountExpired?: Date;

    passwordInsertDateTime?: Date;

    failedAttempts?: number;

    mustChangePassword?: boolean;

    lockId?: number;

    defaultRoleId?: number;
}
