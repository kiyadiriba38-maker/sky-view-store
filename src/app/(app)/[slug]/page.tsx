import Link from "next/link";
import { notFound } from "next/navigation";

import type { PropsSlug } from "@/lib/core/types/types";
import type { Metadata } from "next";

import RenderBlocks from "@/components/blocks/render-blocks";
import RenderHero from "@/components/blocks/render-hero";
import { JsonLdViewScript } from "@/components/shared/elements-ssr";
import DAL from "@/lib/core/dal";
import { CollectionName } from "@/lib/core/types/types";
import { getDecodedSlug } from "@/lib/core/util";
import { buildMetadataByModel } from "@/lib/seo/metadata";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: PropsSlug): Promise<Metadata> {
  const slug = await getDecodedSlug(params);
  const page = await DAL.queryPageBySlug(slug);
  if (!page && slug === "home") {
    return {
      title: "Sky View Store",
      description: "Discover quality products at Sky View Store.",
    };
  }
  if (!page) return { robots: "noindex" };
  return buildMetadataByModel(CollectionName.pages, page, slug);
}

export default async function PagePage({ params }: PropsSlug) {
  const slug = await getDecodedSlug(params);
  const page = await DAL.queryPageBySlug(slug);
  if (!page && slug === "home") {
    return (
      <article className="min-w-0 overflow-hidden">
        <section className="relative isolate flex min-h-[68vh] items-center bg-neutral-950 text-white">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-700 via-neutral-950 to-black" />
          <div className="container mx-auto w-full px-6 py-20 md:px-10">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-neutral-300">Welcome to Sky View Store</p>
            <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl">Find what you need. <span className="text-neutral-400">Love what you choose.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-neutral-300">Explore our collection and enjoy a simple, convenient shopping experience.</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="#discover" className="rounded-full bg-white px-7 py-3.5 font-semibold text-neutral-950 transition hover:bg-neutral-200">Explore products</Link>
              <Link href="#discover" className="rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10">Browse categories</Link>
            </div>
          </div>
        </section>
        <section id="discover" className="container mx-auto px-6 py-20 md:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500">A better way to shop</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">Welcome to your next favorite find.</h2>
            <p className="mt-5 text-base leading-7 text-neutral-600">Browse our store, discover products, and find something that fits your needs.</p>
            <Link href="#discover" className="mt-8 inline-flex rounded-full bg-neutral-900 px-7 py-3.5 font-semibold text-white transition hover:bg-neutral-700">Shop the collection</Link>
          </div>
        </section>
      </article>
    );
  }
  if (!page) return notFound();
  return (
    <article className="min-w-0 overflow-x-clip py-1">
      <JsonLdViewScript
        collection={CollectionName.pages}
        entity={page}
        slug={slug}
      />
      <h1 className="sr-only">{page.title}</h1>
      <RenderHero {...page.hero} />
      <div className="container min-w-0 px-4 md:px-8 [&>*]:my-10 sm:[&>*]:my-12 md:[&>*]:my-16">
        <RenderBlocks blocks={page.layout} />
      </div>
    </article>
  );
}
