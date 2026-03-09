import { Suspense } from "react";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import PostLoading from "./PostLoading";

interface LayoutProps {
  children: React.ReactNode;
}

async function layout({ children }: LayoutProps) {
  return <Suspense fallback={<PostLoading />}>{children}</Suspense>;
}

export default layout;

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { author, permlink } = await params;
  const username = author.replace("@", "");

  const { title, description, thumbnail, keywords, alternates } =
    await getMetadata.postAsync(username, permlink);

  return {
    title,
    description,
    keywords: keywords.join(", "),
    alternates,
    openGraph: {
      images: thumbnail ? [thumbnail] : [],
    },
    twitter: {
      images: thumbnail ? [thumbnail] : [],
    },
  };
}
