import { SQLiteDatabase } from "expo-sqlite";
import { seedData } from "./constants";
import { FetchUrlMetadataOut, LinkEntity, LinkMetadataEntity } from "./types";
import { fetchUrlMetadata } from "./utils";

export class LinkMetadataRepository {
  static insertMetadata(
    db: SQLiteDatabase,
    linkId: number,
    metadata: FetchUrlMetadataOut
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

    const metadataFetchPromises: Promise<{
      insertedId: number;
      metadata: FetchUrlMetadataOut;
    }>[] = [];
    for (const { url, status, read_at } of seedData) {
      let insertedId: number;
      if (status === "read" && read_at != null)
        insertedId = (
          await this.saveReadLink(db, url, status, new Date(read_at))
        ).lastInsertRowId;
      else if (status === "later")
        insertedId = (await this.saveLaterLink(db, url, status))
          .lastInsertRowId;
      else throw new Error("Unreachable");

      metadataFetchPromises.push(
        new Promise((resolve, reject) => {
          fetchUrlMetadata(url).then((metadata) =>
            resolve({
              insertedId,
              metadata,
            })
          );
        })
      );
    }
    const metadatas = await Promise.all(metadataFetchPromises);
    for (const { insertedId, metadata } of metadatas) {
      await LinkMetadataRepository.insertMetadata(db, insertedId, metadata);
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
