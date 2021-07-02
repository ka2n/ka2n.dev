import { Footer } from "components/Footer";
import { siteConfig } from "lib/site-config";
import { NextSeo } from "next-seo";
import React, { useCallback, useRef, useState } from "react";
import { useCopyButton } from "../../components/hooks/useCopyButton";

const ShufflePage = () => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);
  const { result, onClick: onClickShuffleButton } = useShuffleButton(
    inputRef,
    outputRef
  );
  const { copied, onClick: onClickCopyButton } = useCopyButton(outputRef);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="py-2 px-4 w-full space-y-6 max-w-xl mx-auto flex-grow">
        <NextSeo
          title="テキストシャッフル君"
          description="テキストエリアに入力した内容を行ごとにシャッフルします。"
        />
        <div className="space-y-2">
          <h1 className="text-lg font-bold">テキストシャッフル君</h1>
          <p className="text-gray-700">
            テキストエリアに入力した内容を行ごとにシャッフルします。
          </p>
        </div>
        <div className="flex space-x-2 w-full">
          <div className="w-full text-center space-y-2">
            <h2>入力欄</h2>
            <textarea
              ref={inputRef}
              className="border-2 w-full p-1"
              rows={10}
            />
          </div>
          <div className="flex">
            <button
              onClick={onClickShuffleButton}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded self-center"
            >
              シャッフル
            </button>
          </div>
          <div className="w-full text-center space-y-2">
            <h2>結果</h2>
            <textarea
              ref={outputRef}
              readOnly
              className="border-2 w-full p-1"
              rows={10}
              value={result}
            />
            <button
              disabled={copied}
              onClick={onClickCopyButton}
              className="text-sm underline"
            >
              {!copied && "結果をコピー"}
              {copied && "コピーしました"}
            </button>
          </div>
        </div>
      </div>
      <Footer site={siteConfig} />
    </div>
  );
};

export default ShufflePage;

const useShuffleButton = (
  inputRef: React.RefObject<HTMLTextAreaElement>,
  outputRef: React.RefObject<HTMLTextAreaElement>
) => {
  const [result, setResult] = useState<string>("");

  const onClick = useCallback(() => {
    if (!inputRef.current) return;
    const input = inputRef.current.value;
    const inputRows = input.split(/\r?\n/);
    const output = shuffle(inputRows);
    setResult(output.join("\n"));

    outputRef.current?.focus();
    outputRef.current?.select();
  }, [inputRef, outputRef]);

  return { result, onClick };
};

const shuffle = (input: any[]) => {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
};
