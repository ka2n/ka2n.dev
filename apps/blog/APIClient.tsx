import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";
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

  async findEntry(
    slug: string,
    options?: { draftKey?: string },
    config?: Partial<AxiosRequestConfig>
  ) {
    const content = await Data(
      this.httpClient.get<Entry>(`/entry/${slug}`, {
        ...config,
        cache: { ignoreCache: !!options?.draftKey },
        params: {
          ...config?.params,
          ...options,
        },
      })
    );
    return {
      data: content,
    };
  }

  async listCollection<
    F extends CollectionKey[] | undefined = undefined,
    EF extends EntryKey[] | undefined = undefined
  >({
    config,
    ...options
  }: {
    limit?: number;
    offset?: number;
    orders?: string;
    fields?: F;
    entryFields?: EF;
    filters?: string;
    draftKey?: string;
    config?: Partial<AxiosRequestConfig>;
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
      ...config,
      params: {
        ...config?.params,
        ...options,
        fields: [
          ...(options?.fields ?? []),
          ...(options?.entryFields?.map((f) => `entries.${f}`) ?? []),
        ].join(","),
      },
    });
  }

  async findCollection(
    slug: string,
    options?: { draftKey?: string },
    config?: Partial<AxiosRequestConfig>
  ) {
    const k = slug;
    const ret = await Data(
      this.listCollection({
        filters: `slug[equals]${k}[or]id[equals]${k}`,
        limit: 1,
        draftKey: options?.draftKey,
        config: { ...config, cache: { ignoreCache: !!options?.draftKey } },
      })
    );
    const content: Collection<Entry> | null = ret.contents[0] || null;
    return {
      ...ret,
      contents: undefined,
      data: content,
    };
  }

  async listEntry<F extends EntryKey[]>(options?: {
    limit?: number;
    offset?: number;
    orders?: string;
    fields?: F;
    filters?: string;
    draftKey?: string;
    config?: Partial<AxiosRequestConfig>;
  }): Promise<AxiosResponse<CollectionResponse<FilteredEntry<F>>>>;
  async listEntry({
    config,
    ...options
  }: {
    limit?: number;
    offset?: number;
    orders?: string;
    fields?: EntryKey[];
    filters?: string;
    draftKey?: string;
    config?: Partial<AxiosRequestConfig>;
  } = {}) {
    return await this.httpClient.get("/entry", {
      ...config,
      params: {
        ...config?.params,
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

export type CollectionResponse<T> = {
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
  revisedAt?: string;
  slug?: string;
  title: string;
  body: string;
  eyecatch?: ImageRef;
  excerpt?: string;
  pinned?: boolean;
};

export type RenderedEntry = Entry & {
  body_plain?: string;
  og_path?: string;
};

type EntryKey = keyof Entry;

type FilteredEntry<K extends EntryKey[] | undefined> = K extends EntryKey[]
  ? Pick<Entry, K[number]>
  : Entry;

export type Collection<T extends object = Entry> = {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  eyecatch?: ImageRef;
  entries: T[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
};

type CollectionKey = keyof Omit<Collection, "entries">;

export type SiteConfig = {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  title: string;
  description: string;
  top_title?: string;
  top_description?: string;
  author_name: string;
  author_description: string;
  author_icon?: ImageRef;
  base_url: string;
  eyecatch?: ImageRef;
  logo?: ImageRef;
  logo_size?: string;
  favicon?: ImageRef;
  gtm_id?: string;
};

export type PageConf = {
  fieldId: string;
  title: string;
  description: string;
};

export type ImageRef = { url: string; width: number; height: number };
