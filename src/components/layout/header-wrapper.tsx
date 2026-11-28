import { draftMode } from "next/headers";

import type { Media } from "@/lib/core/types/payload-types";
import type { SiteSetting } from "@/payload-types";

import RenderBlocks from "@/components/blocks/render-blocks";
import CmsLink from "@/components/shared/cms-link";
import { Header } from "@/components/shared/wrappers";
import DAL from "@/lib/core/dal";

type HeaderNavItems = NonNullable<
  NonNullable<SiteSetting["header"]>["navItems"]
>;

const DesktopNavigation = ({ navItems }: { navItems: HeaderNavItems }) => {
  if (!navItems.length) return null;

  return (
    <nav
      aria-label="Main navigation"
      className="hidden w-full border-b border-white/10 bg-[#121212]/80 shadow-[0_10px_35px_rgba(0,0,0,0.16)] backdrop-blur-2xl md:block"
    >
      <div className="container flex items-center justify-center gap-6 py-2">
        {navItems.map(({ link, id }, index) => (
          <CmsLink
            key={id ?? index}
            link={link}
            appearance="link"
            className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65 transition-colors duration-200 hover:bg-white/[0.06] hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 dark:text-white/65"
          />
        ))}
      </div>
    </nav>
  );
};

export default async function HeaderWrapper({
  logo,
  header,
}: {
  logo: Media;
  header: SiteSetting["header"];
}) {
  const { isEnabled } = await draftMode();

  const products = await DAL.queryAllProducts();
  const navItems = header?.navItems ?? [];

  return (
    <div className="sticky top-0 z-20">
      <Header
        logo={logo}
        products={products}
        navItems={navItems}
        headerContent={<RenderBlocks blocks={header?.blocks ?? []} />}
        adminBarProps={{ preview: isEnabled }}
      />
      <DesktopNavigation navItems={navItems} />
    </div>
  );
}
