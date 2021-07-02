import rison from "rison";
import { isNotEmpty } from "typesafe-utils";
import b64 from "base64url";

export type InputURL = [url: string, title?: string];

export const validateRawInput = (input: string) => {
  const inputRows = parseRawInput(input);
  if (inputRows.length === 0) return false;
  return true;
};
export const validateInput = (input: InputURL[]) => {
  if (input.length === 0) return false;
  return true;
};

export const marshallRawInput = (contents: InputURL[]) => {
  return contents
    .map((v) => [v[1], v[0]].filter(isNotEmpty).join(" "))
    .join("\n");
};

export const parseRawInput = (input: string): InputURL[] => {
  return input
    .split(/\r?\n/)
    .filter(isNotEmpty)
    .map((v: string) => {
      if (v.indexOf(" ") !== -1) {
        const [title, url] = v.split(" ", 2);
        return [url, title] as InputURL;
      } else {
        return [v] as InputURL;
      }
    })
    .filter(([url]) => {
      try {
        new URL(url);
      } catch {
        return false;
      }
      return true;
    });
};
export const encodeInput = (input: InputURL[], title: string | null) => {
  return rison.encode_object({
    v: "1",
    d: b64.encode(JSON.stringify([title, input])),
  });
};

export const decodeInput = (
  raw: any
): [title: string | null, contents: InputURL[]] => {
  if (typeof raw !== "string") throw new Error("invalid input");
  const { v: version, d: data } = rison.decode_object(raw);

  switch (version) {
    case "1": {
      const parsed = JSON.parse(b64.decode(data));
      if (!(Array.isArray(parsed) && parsed.length === 2))
        throw new Error("invalid input");
      return parsed as any;
    }
    default: {
      throw new Error("invalid input version");
    }
  }
};
