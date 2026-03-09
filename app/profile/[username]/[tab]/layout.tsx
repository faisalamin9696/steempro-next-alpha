import { Suspense } from "react";
import ProfileHeaderSkeleton from "@/components/skeleton/ProfileHeaderSkeleton";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import { getResizedAvatar } from "@/utils/image";
import { auth } from "@/auth";
import { sdsApi } from "@/libs/sds";
import MainWrapper from "@/components/wrappers/MainWrapper";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileHeader from "@/components/profile/ProfileHeader";

async function layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth();
  const account = await sdsApi.getAccountExt(username, session?.user?.name);

  return (
    <Suspense fallback={<ProfileHeaderSkeleton />}>
      <MainWrapper
        endClass="w-[320px] min-w-[320px] 1md:hidden! lg:block!"
        end={<ProfileCard account={account} className="card" />}
      >
        <ProfileHeader account={account} />
        {children}
      </MainWrapper>
    </Suspense>
  );
}

export default layout;

export async function generateMetadata({ params }: any): Promise<Metadata> {
  let { username, tab } = await params;
  const { title, description, keywords, alternates } =
    await getMetadata.profileAsync(username, tab);

  return {
    title,
    description,
    keywords: keywords.join(", "),
    alternates,
    openGraph: {
      images: [getResizedAvatar(username, "medium")],
    },
    twitter: {
      images: [getResizedAvatar(username, "medium")],
    },
  };
}
