"use client";

import { getMetadata, updateMetadata } from "@/utils/metadata";
import { useSession } from "next-auth/react";
import { Key, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";
import { useAppSelector } from "@/hooks/redux/store";
import STabs from "@/components/ui/STabs";
import { Wallet, Users, Bell, Rss, Newspaper } from "lucide-react";
import NotificationsCard from "@/components/profile/NotificationsCard";
import { FeedList } from "@/components/FeedList";
import WalletTab from "../wallet/WalletTab";
import CommunitiesTab from "../communities/page";

const ICON_SIZE = 20;

// No props needed — account data is read from Redux store (seeded by the layout)
function ProfilePage() {
  const { username, tab } = useParams() as { username: string; tab: string };
  const initialTab = tab ?? "blog";
  const loginData = useAppSelector((s) => s.loginReducer.value);
  const otherProfileData = useAppSelector(
    (s) => s.profileReducer.values[username],
  );
  const [selectedKey, setSelectedKey] = useState(initialTab);
  const { data: session } = useSession();
  const { useSmaller } = useDeviceInfo();
  const isMobile = useSmaller("sm");
  const isMe = session?.user?.name === username;
  const profileData = isMe ? loginData : otherProfileData;

  const handleSelectionChange = (key: Key) => {
    if (!key) return;
    setSelectedKey(key.toString());
    const { title, description } = getMetadata.home(key.toString());
    updateMetadata({ title, description });
  };

  const apiParams = `/${username}`;

  const profilePostsTab = useMemo(
    () => [
      { id: "posts", title: "Posts", api: "getPostsByAuthor" + apiParams },
      {
        id: "friends",
        title: "Friends",
        api: "getAccountFriendsFeed" + apiParams,
      },
      {
        id: "comments",
        title: "Comments",
        api: "getCommentsByAuthor" + apiParams,
      },
      {
        id: "replies",
        title: "Replies",
        api: "getCommentsByParentAuthor" + apiParams,
      },
    ],
    [apiParams],
  );

  const profileTabs = useMemo(
    () => [
      {
        id: "blog",
        title: "Blog",
        api: "getAccountBlog" + apiParams,
        icon: <Rss size={ICON_SIZE} />,
      },
      {
        id: "posts",
        title: "Posts",
        api: "getPostsByAuthor" + apiParams,
        icon: <Newspaper size={ICON_SIZE} />,
        children: (
          <STabs
            key={`tabs-posts-${session?.user?.name || "anonymous"}`}
            classNames={{ tabList: "pt-0" }}
            selectedKey={selectedKey}
            onSelectionChange={handleSelectionChange}
            items={profilePostsTab}
            tabHref={(tab) => `/@${username}/${tab.id}`}
            tabTitle={(tab) => tab.title}
            variant="underlined"
            color="primary"
          >
            {(tab) => (
              <FeedList
                apiPath={tab.api}
                observer={session?.user?.name || ""}
              />
            )}
          </STabs>
        ),
      },
      {
        id: "notifications",
        title: "Notifications",
        icon: <Bell size={ICON_SIZE} />,
        children: <NotificationsCard username={username} />,
      },
      {
        id: "communities",
        title: "Communities",
        icon: <Users size={ICON_SIZE} />,
        children: profileData ? <CommunitiesTab account={profileData} /> : null,
      },
      {
        id: "wallet",
        title: "Wallet",
        icon: <Wallet size={ICON_SIZE} />,
        children: profileData ? <WalletTab account={profileData} /> : null,
      },
    ],
    [apiParams, isMobile, profileData, selectedKey],
  );

  const normalizedTab = ["posts", "friends", "comments", "replies"].includes(
    tab,
  )
    ? "posts"
    : (tab ?? "blog");

  return (
    <STabs
      key={`tabs-profile-${session?.user?.name || "anonymous"}`}
      variant="bordered"
      selectedKey={normalizedTab}
      onSelectionChange={handleSelectionChange}
      items={profileTabs}
      className="md:mt-3"
      tabHref={(tab) => `/@${username}/${tab.id}`}
      tabTitle={(tab) => (
        <div className="flex items-center space-x-2">
          {tab.icon}
          {!isMobile || selectedKey === tab.id ? (
            <span>{tab.title}</span>
          ) : null}
        </div>
      )}
    >
      {(tab) =>
        tab?.children ? (
          tab.children
        ) : (
          <FeedList
            apiPath={tab.api || ""}
            observer={session?.user?.name || ""}
          />
        )
      }
    </STabs>
  );
}

export default ProfilePage;
