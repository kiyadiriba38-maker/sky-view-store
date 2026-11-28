import type { SiteSetting } from "@/payload-types";

import RenderBlocks from "@/components/blocks/render-blocks";

export default function Footer({ footer }: { footer: SiteSetting["footer"] }) {
  if (!footer) return null;

  return (
    <footer className="relative mt-auto w-full overflow-hidden border-t border-white/10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.09),transparent_55%),#101010] px-4 py-12 text-white sm:py-16">
      {footer.blocks?.length ? (
        <div className="container grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/10 pt-8 text-white/75 sm:grid-cols-3 md:grid-cols-4 [&>[data-block-type=content]]:col-span-full [&>[data-block-type=footerIcons]]:col-span-full [&_a]:transition-colors [&_a:hover]:text-amber-300 [&_h2]:font-semibold [&_h2]:tracking-wide">
          <RenderBlocks blocks={footer.blocks} />
        </div>
      ) : null}
    </footer>
  );
}
