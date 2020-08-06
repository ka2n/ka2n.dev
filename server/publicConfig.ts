export type PublicConfig = {
  gtm: string;
  gtm_amp: string;
};

export const publicConfig = JSON.parse(
  process.env.NEXT_PUBLIC_CONFIG || ""
) as PublicConfig;
