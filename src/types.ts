/* -------------------------------- Entities -------------------------------- */

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

/* ------------------------------ Other types ------------------------------- */

export interface FetchUrlMetadataOut {
  title: string | null;
}

export interface SaveLinkMutationFnIn {
  url: string;
  status: LinkEntity["status"];
  date: Date;
}

export interface SaveMetadataMutationFnIn {
  linkId: number;
  metadata: FetchUrlMetadataOut;
}
