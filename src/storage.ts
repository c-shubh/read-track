import { SQLiteDatabase } from "expo-sqlite";

// the way it's stored in the db
export type LinkEntity = {
  id: number;
  url: string;
  status: "read" | "later";
  read_at: string | null;
  created_at: string;
};

export class LinkRepository {
  static getSqliteVersion(db: SQLiteDatabase) {
    return db.getFirstAsync("SELECT sqlite_version();");
  }

  static getAllLinks(db: SQLiteDatabase) {
    return db.getAllAsync<LinkEntity>(`
SELECT id, url, status, read_at, created_at FROM links;`);
  }

  static async saveLink(
    db: SQLiteDatabase,
    url: string,
    status: LinkEntity["status"],
    date: Date
  ) {
    if (status === "read") {
      return await db.runAsync(
        `
INSERT INTO links (url, status, read_at, created_at)
VALUES (?, ?, ?, ?);
  `,
        url,
        status,
        date.toISOString(),
        new Date().toISOString()
      );
    } else if (status === "later") {
      return await db.runAsync(
        `
INSERT INTO links (url, status, created_at)
VALUES (?, ?, ?);
  `,
        url,
        status,
        new Date().toISOString()
      );
    }
    throw new Error("Unreachable");
  }

  static async deleteAllLinks(db: SQLiteDatabase) {
    const ret = await db.runAsync(`DELETE FROM links;`);
    console.log("[DB] deleted all links");
    return ret;
  }
}
