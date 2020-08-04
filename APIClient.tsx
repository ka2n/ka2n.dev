import axios, { AxiosInstance, AxiosResponse } from "axios";
import { setupCache, ISetupCache } from "axios-cache-adapter";

export class APIClient {
  private static _instance: APIClient;

  static get current() {
    if (!this._instance) {
      this._instance = new APIClient();
    }
    return this._instance;
  }

  private httpClient: AxiosInstance;
  private cache?: ISetupCache;

  constructor() {
    this.cache = setupCache({ maxAge: 1000 * 5 });
    this.httpClient = axios.create({
      adapter: this.cache?.adapter,
      baseURL: process.env.MICROCMS_ENDPOINT,
      headers: {
        "X-API-KEY": process.env.MICROCMS_KEY,
      },
    });
  }

  async preview(id: string, key: string) {
    return await this.httpClient.get(`/entry/${id}`, {
      params: {
        fields: "id",
        draftKey: key,
      },
    });
  }

  async author() {
    return await this.httpClient.get<SiteConfig>("/config");
  }

  async findEntry(slug: string, options?: { draftKey?: string }) {
    const k = slug;
    const ret = await Data(
      this.listEntry({
        filters: `slug[equals]${k}[or]id[equals]${k}`,
        limit: 1,
        draftKey: options?.draftKey,
      })
    );
    const content: Entry | null = ret.contents[0] || null;
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
    filters?: string;
    draftKey?: string;
  }): Promise<AxiosResponse<CollectionResponse<Pick<Entry, F[number]>>>>;
  async listEntry(options?: {
    limit?: number;
    offset?: number;
    orders?: string;
    fields?: never;
    filters?: string;
    draftKey?: string;
  }): Promise<AxiosResponse<CollectionResponse<Entry>>>;
  async listEntry(options?: {
    limit?: number;
    offset?: number;
    orders?: string;
    fields?: EntryKeys[];
    filters?: string;
    draftKey?: string;
  }) {
    return await this.httpClient.get("/entry", {
      params: {
        limit: 50,
        offset: 0,
        orders: options?.orders,
        fields: options?.fields?.join(","),
        filters: options?.filters,
        draftKey: options?.draftKey,
      },
    });
  }
}

export function Result<T = any>(
  p: Promise<T>
): Promise<{ result: T; error: null } | { result: null; error: any }> {
  return p
    .then((r) => ({ result: r, error: null }))
    .catch((e) => ({ result: null, error: e }));
}

export function Data<T>(r: Promise<AxiosResponse<T>>): Promise<T> {
  return r.then((r) => r.data);
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
  publishedAt?: string;
  slug?: string;
  title: string;
  body: string;
  eyecatch?: string;
  excerpt?: string;
  pinned?: boolean;
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
  base_url: string;
};

export type PageConf = {
  fieldId: string;
  title: string;
  description: string;
};
