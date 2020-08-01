import axios, { AxiosInstance, AxiosResponse } from "axios";

export class APIClient {
  private static _instance: APIClient;

  static get current() {
    if (!this._instance) {
      this._instance = new APIClient();
    }
    return this._instance;
  }

  private httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: process.env.MICROCMS_ENDPOINT,
      headers: {
        "X-API-KEY": process.env.MICROCMS_KEY,
      },
    });
  }

  async author() {
    return await this.httpClient.get<SiteConfig>("/config");
  }

  async findEntry(slug: string) {
    const k = slug;
    const ret = await this.httpClient.get<CollectionResponse<Entry>>("/entry", {
      params: {
        filters: `slug[equals]${k}[or]id[equals]${k}`,
      },
    });
    const content: Entry | null = ret.data.contents[0] || null;
    return {
      ...ret,
      data: content,
    };
  }

  async listEntry<F extends EntryKeys[]>(options?: {
    limit?: number;
    offset?: number;
    orders?: string;
    fields: F;
  }): Promise<AxiosResponse<CollectionResponse<Pick<Entry, F[number]>>>>;
  async listEntry(options?: {
    limit?: number;
    offset?: number;
    orders?: string;
    fields?: never;
  }): Promise<AxiosResponse<CollectionResponse<Entry>>>;
  async listEntry(options?: {
    limit?: number;
    offset?: number;
    orders?: string;
    fields?: EntryKeys[];
  }) {
    const fields = options?.fields;
    const topEntries = await this.httpClient.get("/entry", {
      params: {
        limit: 50,
        offset: 0,
        orders: "-publishedAt",
        fields: fields?.join(","),
      },
    });
    return topEntries;
  }
}

export function Result<T = any>(
  p: Promise<T>
): Promise<{ result: T; error: null } | { result: null; error: any }> {
  return p
    .then((r) => ({ result: r, error: null }))
    .catch((e) => ({ result: null, error: e }));
}

type CollectionResponse<T> = {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
};

export type Entry = {
  id: string;
  updatedAt: string;
  createdAt: string;
  slug?: string;
  title: string;
  body: string;
};
type EntryKeys = keyof Entry;

export type SiteConfig = {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  title: string;
  description: string;
  top: PageConf;
  author_name: string;
  author_description: string;
};

export type PageConf = {
  fieldId: string;
  title: string;
  description: string;
};
