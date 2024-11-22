import parse from "node-html-parser";
import { ToastAndroid } from "react-native";
import { FetchUrlMetadataOut } from "./types";

export function showToast(message: string, duration: number) {
  ToastAndroid.show(message, duration);
}

function extractTitle(html: string): string | null {
  const root = parse(html);
  return root.querySelector("head > title")?.text.trim() || null;
}

export async function fetchUrlMetadata(
  url: string
): Promise<FetchUrlMetadataOut> {
  // TODO: avoid fetching large pdfs, etc.
  try {
    const html = await fetch(url, { method: "GET" }).then((res) => res.text());
    return {
      title: extractTitle(html) || null,
    };
  } catch (e) {
    console.error("fetchUrlMetadata", e);
    return {
      title: null,
    };
  }
}
