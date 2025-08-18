import mysql from 'mysql2/promise';
export declare class DatabaseConnection {
    private static instance;
    private connection;
    private constructor();
    static getInstance(): DatabaseConnection;
    getConnection(): Promise<mysql.Connection>;
    closeConnection(): Promise<void>;
    query<T = any>(sql: string, params?: any[]): Promise<T[]>;
    transaction<T>(callback: (connection: mysql.Connection) => Promise<T>): Promise<T>;
}
export declare const createTables: () => Promise<void>;
export default DatabaseConnection;
//# sourceMappingURL=database.d.ts.map