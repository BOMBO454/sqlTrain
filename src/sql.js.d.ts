declare module 'sql.js' {
  export type SqlValue = string | number | null | Uint8Array

  export interface QueryExecResult {
    columns: string[]
    values: SqlValue[][]
  }

  export interface Statement {
    step(): boolean
    get(): SqlValue[]
    getColumnNames(): string[]
    free(): boolean
    bind(values?: SqlValue[]): boolean
  }

  export interface Database {
    run(sql: string, params?: SqlValue[]): Database
    exec(sql: string): QueryExecResult[]
    prepare(sql: string): Statement
    getRowsModified(): number
    export(): Uint8Array
    close(): void
  }

  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | null) => Database
  }

  export default function initSqlJs(config?: {
    locateFile?: (file: string) => string
  }): Promise<SqlJsStatic>
}
