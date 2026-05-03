import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json() as { text: string };
    if (!text?.trim()) return NextResponse.json({ translated: '' });

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ar`;
    const res = await fetch(url);
    const data = await res.json() as { responseData?: { translatedText?: string }; responseStatus?: number };

    if (!res.ok || data.responseStatus === 403) {
      return NextResponse.json({ error: 'Translation limit reached. Try again later.' }, { status: 429 });
    }

    const translated = data.responseData?.translatedText ?? '';
    return NextResponse.json({ translated });
  } catch {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
