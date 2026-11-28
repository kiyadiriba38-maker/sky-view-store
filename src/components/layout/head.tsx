import appConfig from "@/lib/core/config";

export default function Head() {
  const urls = [
    ...new Set(
      [appConfig.SERVER_URL, appConfig.STORAGE_URL].filter(
        (url): url is string => Boolean(url),
      ),
    ),
  ];

  return (
    // eslint-disable-next-line @next/next/no-head-element -- App Router: intentional <head> merge, not Pages Router next/head
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      {urls.flatMap((url) => [
        <link
          key={`preconnect-${url}`}
          rel="preconnect"
          href={url}
          crossOrigin="anonymous"
        />,
        <link key={`dns-prefetch-${url}`} rel="dns-prefetch" href={url} />,
      ])}

      <script
        id="theme-script"
        dangerouslySetInnerHTML={{
          __html:
            "(function(){try{var k='payload-theme';var t=localStorage.getItem(k);var next=(t==='dark'||t==='light')?t:'light';document.documentElement.setAttribute('data-theme',next);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();",
        }}
      />
    </head>
  );
}
