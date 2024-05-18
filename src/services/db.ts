import mysql, { Connection, OkPacket } from "mysql2";
import { keys, values } from "lodash";
import { mysql_real_escape_string } from "../utils";

let connection: Connection;
const getConnection = () => {
  if (!connection) {
    connection = mysql.createConnection({
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "test" ,
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT as unknown as number || 3306,
      database: process.env.DB_DATABASE || "task_manager",
    });
    connection.on("connection", (args: any[]) => {
      const { err, connection } = args as any;
      console.error(args, "args");
      if (err) {
        console.error("error connectiong: ", err.stack);
        return;
      }
      console.log("connected with id: ", connection.threadId);
    });
  }
  return connection;
};

abstract class DatabaseConnection {
  abstract insert(
    tableName: string,
    params: Record<string, string>
  ): Promise<number | boolean>;

  abstract update(
    tableName: string,
    params: Record<string, string>,
    conditions?: Record<string, string>
  ): Promise<boolean>;

  abstract delete(
    tableName: string,
    conditions?: Record<string, string>
  ): Promise<boolean>;

  abstract findAll<T extends Object = {}>(
    tableName: string,
    conditions?: Record<string, string>
  ): Promise<Array<T>>;

  abstract findBy<T extends Object = {}>(
    tableName: string,
    columns: ReadonlyArray<string>,
    conditions: Record<string, string>
  ): Promise<T>;

  abstract executeQuery<T extends unknown>(query: string): Promise<T>;
}

export class DBConnection extends DatabaseConnection {
  private conn: Connection;
  constructor() {
    super();
    this.conn = getConnection();
  }

  insert(tableName: string, params: Object): Promise<number | boolean> {
    return new Promise((resolve, reject) => {
      const columns = keys(params).join(", ");
      const data =
        "'" +
        (values(params) as unknown as string[])
          .map((val: string) => mysql_real_escape_string(val))
          .join("', '") +
        "'";
      const query = `INSERT INTO ${tableName} (${columns}) VALUES (${data})`;
      this.conn.query<OkPacket>(query, (err, result) =>
        err
          ? reject(err)
          : resolve(result?.insertId as unknown as number | boolean)
      );
    });
  }

  update(
    tableName: string,
    params: Object,
    conditions?: Object
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const subQuery = keys(params)
        .map((k: string) => `${k}='${mysql_real_escape_string(params[k])}'`)
        .join(", ");
      const conditionQuery = conditions
        ? " WHERE " +
          keys(conditions)
            .map((k: string) => `${k}='${conditions[k]}'`)
            .join("and ")
        : "";
      const query = `UPDATE ${tableName} SET ${subQuery} ${conditionQuery}`;
      this.conn.query(query, (err, result) =>
        err ? reject(err) : resolve(result ? true : false)
      );
    });
  }

  delete(
    tableName: string,
    conditions?: Record<string, string> | undefined
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const conditionQuery = conditions
        ? " WHERE " +
          keys(conditions)
            .map((k: string) => `${k}='${conditions[k]}'`)
            .join("and ")
        : "";
      const query = `DELETE FROM ${tableName} ${conditionQuery}`;
      this.conn.query(query, (err, results) => {
        return err ? reject(err) : resolve(results ? true : false);
      });
    });
  }

  findAll<T extends Object = {}>(
    tableName: string,
    conditions?: Object
  ): Promise<Array<T>> {
    return new Promise((resolve, reject) => {
      const conditionQuery = conditions
        ? " WHERE " +
          keys(conditions)
            .map((k: string) => `${k}='${conditions[k]}'`)
            .join("and ")
        : "";
      const query = `SELECT * FROM ${tableName} ${conditionQuery}`;
      this.conn.query(query, (err, results) => {
        return err ? reject(err) : resolve(results as unknown as Array<T>);
      });
    });
  }

  findBy<T extends Object = {}>(
    tableName: string,
    columns: readonly string[],
    conditions: Object
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const conditionQuery = conditions
        ? " WHERE " +
          keys(conditions)
            .map((k: string) => `${k}='${conditions[k]}'`)
            .join("and ")
        : "";
      const query = `SELECT ${columns.join(
        ", "
      )} FROM ${tableName} ${conditionQuery}`;
      this.conn.query(query, (err, results) => {
        return err ? reject(err) : resolve(results?.[0]);
      });
    });
  }

  executeQuery<T extends unknown>(query: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.conn.query(query, (err, results) => {
        return err ? reject(err) : resolve(results as unknown as T);
      });
    });
  }
}
