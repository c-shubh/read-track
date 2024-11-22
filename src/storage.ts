import { SQLiteDatabase } from "expo-sqlite";
import { parse } from "node-html-parser";
import { seedData } from "./constants";

// the way it's stored in the db
export type LinkEntity = {
  id: number;
  url: string;
  status: "read" | "later";
  read_at: string | null;
  created_at: string;
};

export type LinkMetadataEntity = {
  id: number;
  link_id: number;
  title: string | null;
  metadata_updated_at: string;
};

export interface GetAllLinksJoinedMetadataOut {
  created_at: string;
  link_id: number;
  metadata_id: number;
  metadata_updated_at: string;
  // read_at:
  // status:
  // title:
  // url:
}

export interface FetchedMetadata {
  title: string | null;
}

function extractTitle(html: string): string | null {
  const root = parse(html);
  return root.querySelector("head > title")?.text.trim() || null;
}

export async function fetchUrlMetadata(url: string): Promise<FetchedMetadata> {
  try {
    const html = await fetch(url, { method: "GET" }).then((res) => res.text());
    return {
      title: extractTitle(html) || null,
    };
  } catch (e) {
    console.error("fetchUrlMetadata", e);
    return {
      title: null,
    };
  }
}

export class LinkMetadataRepository {
  static insertMetadata(
    db: SQLiteDatabase,
    linkId: number,
    metadata: FetchedMetadata
  ) {
    return db.runAsync(
      `
INSERT INTO link_metadata (link_id, title, metadata_updated_at)
VALUES (?, ?, ?);`,
      linkId,
      metadata.title,
      new Date().toISOString()
    );
  }
}

export class LinkRepository {
  static async getAllLinksJoinedMetadata(db: SQLiteDatabase) {
    return db.getAllAsync<{
      link_id: LinkEntity["id"];
      url: LinkEntity["url"];
      status: LinkEntity["status"];
      read_at: LinkEntity["read_at"];
      created_at: LinkEntity["created_at"];
      metadata_id: number | null;
      title: LinkMetadataEntity["title"] | null;
      metadata_updated_at: LinkMetadataEntity["metadata_updated_at"] | null;
    }>(`
SELECT links.id link_id, links.url, links.status, links.read_at, links.created_at, 
       link_metadata.id metadata_id, link_metadata.title, link_metadata.metadata_updated_at
FROM links
LEFT JOIN link_metadata ON links.id = link_metadata.link_id;
`);
  }

  static getSqliteVersion(db: SQLiteDatabase) {
    return db.getFirstAsync("SELECT sqlite_version();");
  }

  static getAllLinks(db: SQLiteDatabase) {
    return db.getAllAsync<LinkEntity>(`
SELECT id, url, status, read_at, created_at FROM links;`);
  }

  static async clearDbAndSeedData(db: SQLiteDatabase) {
    await this.deleteAllLinks(db);
    for (const { url, status, read_at } of seedData) {
      if (status === "read" && read_at != null)
        await this.saveReadLink(db, url, status, new Date(read_at));
      else if (status === "later") await this.saveLaterLink(db, url, status);
      else throw new Error("Unreachable");
    }
  }

  static saveReadLink(
    db: SQLiteDatabase,
    url: string,
    status: LinkEntity["status"],
    readAt: Date,
    createdAt: Date = new Date()
  ) {
    return db.runAsync(
      `
INSERT INTO links (url, status, read_at, created_at)
VALUES (?, ?, ?, ?);
`,
      url,
      status,
      readAt.toISOString(),
      createdAt.toISOString()
    );
  }

  static saveLaterLink(
    db: SQLiteDatabase,
    url: string,
    status: LinkEntity["status"],
    createdAt: Date = new Date()
  ) {
    return db.runAsync(
      `
INSERT INTO links (url, status, created_at)
VALUES (?, ?, ?);
`,
      url,
      status,
      createdAt.toISOString()
    );
  }

  static async deleteAllLinks(db: SQLiteDatabase) {
    const ret = await db.runAsync(`DELETE FROM links;`);
    console.log("[DB] deleted all links");
    return ret;
  }
}
