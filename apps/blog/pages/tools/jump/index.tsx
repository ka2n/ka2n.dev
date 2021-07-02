import { Footer } from "components/Footer";
import { siteConfig } from "lib/site-config";
import { NextSeo } from "next-seo";
import { useRouter } from "next/dist/client/router";
import { ParsedUrlQuery } from "querystring";
import React, { useCallback, useEffect, useRef, useState } from "react";
import rison from "rison";
import { useThrottledCallback } from "use-debounce";
import {
  validateRawInput,
  parseRawInput,
  validateInput,
  encodeInput,
  InputURL,
  marshallRawInput,
} from "../../../lib/jump/InputURL";

export type QueryNew = {
  // n: new from scratch
  o: "n";
};

export type QueryEdit = {
  o: "e";
  v: {
    title: string | null;
    contents: InputURL[];
  };
};

type Query = QueryNew | QueryEdit;

const JumpPage = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [valid, setValid] = useState(false);
  const validate = useThrottledCallback(
    useCallback(() => {
      if (!inputRef.current) return;
      setValid(validateRawInput(inputRef.current.value));
      rememberInput({ body: inputRef, title: titleInputRef });
    }, [inputRef, titleInputRef, setValid]),
    500
  );
  const onClick = useCallback(
    (e) => {
      const contents = parseRawInput(inputRef.current?.value ?? "");
      if (!validateInput(contents)) {
        return;
      }
      const title = titleInputRef.current?.value ?? null;

      router.push(`/tools/jump/to/${encodeInput(contents, title)}`);
    },
    [router, inputRef, titleInputRef]
  );

  // Restore last value
  useEffect(() => {
    if (typeof window !== "object") return;
    try {
      loadRememberedInput(router.query, {
        body: inputRef,
        title: titleInputRef,
      });
      validate();
    } catch (e) {
      console.error(e);
    }
  }, [validate, inputRef, titleInputRef, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="py-2 px-4 w-full space-y-6 max-w-xl mx-auto flex-grow">
        <NextSeo title="Jump" description="簡単なジャンプページを作成します" />
        <div className="space-y-2">
          <h1 className="text-lg font-bold">Jump</h1>
          <p className="text-gray-700">
            簡単にリンク集を作成します。下のテキストボックスにURLを貼り付けてください。
            <br />
            あんまり大量だとうまく動かないかもしれません。
          </p>
        </div>
        <div className="space-y-4 w-full">
          <div className="w-full">
            <textarea
              name="urls"
              ref={inputRef}
              className="border-2 w-full p-1"
              rows={10}
              onChange={validate}
              onBlur={validate}
              placeholder={`https://example.com/1\nサンプルページ2 https://example.com/2`}
            />
            <p className="text-xs text-gray-500">
              1行1URL、先頭にタイトルを入力してスペースで区切るとタイトルを指定できます。
            </p>
          </div>
          <label className="flex align-center space-x-2">
            <span>ページ名 :</span>
            <div className="flex-grow">
              <input
                name="page-title"
                placeholder="リンク集"
                className="border-2 p-1 w-full"
                ref={titleInputRef}
              />
              <p className="text-xs text-gray-500">
                オプションでページ名を指定することができます。
              </p>
            </div>
          </label>
          <div className="w-full text-right pt-4">
            <button
              onClick={onClick}
              disabled={!valid}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded self-center disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-default"
            >
              この内容でリンク集を作る
            </button>
          </div>
        </div>
      </div>
      <Footer site={siteConfig} />
    </div>
  );
};

const rememberInput = (
  inputs: Record<
    string,
    React.RefObject<HTMLInputElement | HTMLTextAreaElement>
  >
) => {
  if (!(typeof window === "object" && "localStorage" in window)) return;

  localStorage.setItem(
    "jump:lastinput",
    JSON.stringify(
      Object.entries(inputs).map(([key, ref]) => [
        key,
        ref.current?.value ?? "",
      ])
    )
  );
};

const loadRememberedInput = (
  query: ParsedUrlQuery,
  inputs: Record<
    "body" | "title",
    React.RefObject<HTMLInputElement | HTMLTextAreaElement>
  >
) => {
  if (!(typeof window === "object" && "localStorage" in window)) return;

  const q = (query["q"] || "")?.toString();
  if (!q) {
    // Load from storage
    let raw: [key: string, value: string][];
    try {
      raw = JSON.parse(localStorage.getItem("jump:lastinput") ?? "");
    } catch {
      return;
    }

    raw.forEach(([key, value]) => {
      if (!value) return;
      const input = inputs[key].current;
      if (!input) {
        return;
      }
      input.value = value;
    });
    return;
  }

  const decoded = rison.decode_object(q) as Query;
  if (decoded.o === "n") return;
  if (decoded.o === "e") {
    if (decoded.v.title && inputs.title.current) {
      inputs.title.current.value = decoded.v.title;
    }
    if (decoded.v.contents.length > 0 && inputs.body.current) {
      inputs.body.current.value = marshallRawInput(decoded.v.contents);
    }
  }
};

export default JumpPage;
