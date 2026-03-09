import { auth } from "@/auth";
import { sdsApi } from "@/libs/sds";
import PostPage from "./(site)/PostPage";
import ProfileCard from "@/components/profile/ProfileCard";
import MainWrapper from "@/components/wrappers/MainWrapper";

async function page({
  params,
}: {
  params: Promise<{ author: string; permlink: string }>;
}) {
  const { author, permlink } = await params;
  const session = await auth();
  const data = await sdsApi.getPost(
    author.replace("@", ""),
    permlink,
    session?.user?.name,
  );
  const account = await sdsApi.getAccountExt(
    author.replace("@", ""),
    session?.user?.name,
  );

  return (
    <MainWrapper
      endClass="w-[320px] min-w-[320px] hidden lg:block"
      end={<ProfileCard account={account} className="card" />}
    >
      <PostPage data={data} />
    </MainWrapper>
  );
}

export default page;
