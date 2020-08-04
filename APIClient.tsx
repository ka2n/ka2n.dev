import axios, { AxiosInstance, AxiosResponse } from "axios";
import { setupCache, ISetupCache } from "axios-cache-adapter";
import { Filter } from "konva/types/Node";

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

  async listCollection<
    F extends CollectionKey[] | undefined = undefined,
    EF extends EntryKey[] | undefined = undefined
  >(options?: {
    limit?: number;
    offset?: number;
    orders?: string;
    fields?: F;
    entryFields?: EF;
    filters?: string;
    draftKey?: string;
  }): Promise<
    AxiosResponse<
      CollectionResponse<
        Pick<
          Collection<FilteredEntry<EF>>,
          F extends CollectionKey[]
            ? F[number] | (EF extends EntryKey[] ? "entries" : never)
            : EF extends EntryKey[]
            ? "entries"
            : keyof Collection
        >
      >
    >
  > {
    return await this.httpClient.get("/collection", {
      params: {
        ...options,
        fields: [
          ...(options?.fields ?? []),
          ...(options?.entryFields?.map((f) => `entries.${f}`) ?? []),
        ].join(","),
      },
    });
  }

  async listEntry<F extends EntryKey[]>(options?: {
    limit?: number;
    offset?: number;
    orders?: string;
    fields?: F;
    filters?: string;
    draftKey?: string;
  }): Promise<AxiosResponse<CollectionResponse<FilteredEntry<F>>>>;
  async listEntry(options?: {
    limit?: number;
    offset?: number;
    orders?: string;
    fields?: EntryKey[];
    filters?: string;
    draftKey?: string;
  }) {
    return await this.httpClient.get("/entry", {
      params: {
        ...options,
        fields: options?.fields?.join(","),
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
  eyecatch?: ImageRef;
  excerpt?: string;
  pinned?: boolean;
};

type EntryKey = keyof Entry;

type FilteredEntry<K extends EntryKey[] | undefined> = K extends EntryKey[]
  ? Pick<Entry, K[number]>
  : Entry;

export type Collection<T extends object = Entry> = {
  id: string;
  title: string;
  description?: string;
  eyecatch?: ImageRef;
  entries: T[];
};

type CollectionKey = keyof Omit<Collection, "entries">;

export type SiteConfig = {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  title: string;
  description: string;
  top: PageConf;
  author_name: string;
  author_description: string;
  author_icon?: ImageRef;
  base_url: string;
  eyecatch?: ImageRef;
  logo?: ImageRef;
  favicon?: ImageRef;
};

export type PageConf = {
  fieldId: string;
  title: string;
  description: string;
};

type ImageRef = { url: string };
