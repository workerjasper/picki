import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Picki/1.0)',
      },
      signal: AbortSignal.timeout(5000),
    });

    const html = await response.text();

    const getMetaContent = (property: string): string | null => {
      const regex = new RegExp(
        `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']|<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
        'i'
      );
      const match = html.match(regex);
      return match ? (match[1] || match[2] || null) : null;
    };

    const titleTagMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);

    let thumbnail = getMetaContent('og:image') || getMetaContent('twitter:image') || null;

    // 상대경로 썸네일을 절대경로로 변환
    if (thumbnail) {
      try {
        thumbnail = new URL(thumbnail, url).href;
      } catch {
        thumbnail = null;
      }
    }

    const data = {
      title: getMetaContent('og:title') || getMetaContent('twitter:title') || titleTagMatch?.[1] || '',
      description: getMetaContent('og:description') || getMetaContent('description') || getMetaContent('twitter:description') || '',
      thumbnail,
      site_name: getMetaContent('og:site_name') || new URL(url).hostname,
    };

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { title: '', description: '', thumbnail: null, site_name: new URL(url).hostname },
      { status: 200 }
    );
  }
}
