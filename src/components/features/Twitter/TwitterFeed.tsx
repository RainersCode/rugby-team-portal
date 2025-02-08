"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

interface TwitterAccount {
  username: string;
  category: string;
}

interface TwitterFeedProps {
  usernames: TwitterAccount[]; // Array of Twitter usernames with categories
}

const TwitterFeed = ({ usernames }: TwitterFeedProps) => {
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const [loadingAccount, setLoadingAccount] = useState<string | null>(null);

  useEffect(() => {
    if (expandedAccount) {
      setLoadingAccount(expandedAccount);
      if ((window as any).twttr) {
        // Create a mutation observer to watch for when Twitter adds the iframe
        const observer = new MutationObserver((mutations, obs) => {
          const twitterFrame = document.querySelector(
            `iframe[id*="twitter-widget"]`
          );
          if (twitterFrame) {
            // Once the iframe is found, wait a bit more for content to load
            setTimeout(() => {
              setLoadingAccount(null);
              obs.disconnect();
            }, 500);
          }
        });

        // Start observing the document for Twitter iframe
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        (window as any).twttr.widgets.load();

        // Cleanup observer if component unmounts
        return () => observer.disconnect();
      }
    } else {
      setLoadingAccount(null);
    }
  }, [expandedAccount]);

  // Split usernames into two columns
  const midpoint = Math.ceil(usernames.length / 2);
  const leftColumnAccounts = usernames.slice(0, midpoint);
  const rightColumnAccounts = usernames.slice(midpoint);

  const renderTwitterAccount = (account: TwitterAccount) => (
    <div
      key={account.username}
      className="border border-rugby-teal/20 rounded-lg overflow-hidden bg-white dark:bg-gray-800 mb-3 hover:border-rugby-teal/40 transition-colors"
    >
      <button
        onClick={() =>
          setExpandedAccount(
            expandedAccount === account.username ? null : account.username
          )
        }
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-full bg-rugby-teal/10 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-rugby-teal"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
            </svg>
          </div>
          <div className="flex flex-col items-start">
            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              @{account.username}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {account.category}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            expandedAccount === account.username ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {expandedAccount === account.username && (
        <div className="border-t border-rugby-teal/20">
          <div className="h-[400px] overflow-hidden relative">
            {loadingAccount === account.username && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 z-10">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-6 h-6 border-2 border-rugby-teal border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Loading tweets...
                  </span>
                </div>
              </div>
            )}
            <div
              className={`transition-opacity duration-300 ${
                loadingAccount === account.username
                  ? "opacity-0"
                  : "opacity-100"
              }`}
            >
              <a
                className="twitter-timeline"
                data-height="400"
                data-theme="light"
                data-chrome="noheader nofooter noborders transparent"
                href={`https://twitter.com/${account.username}?ref_src=twsrc%5Etfw`}
                style={{ opacity: 0 }}
              >
                <span className="sr-only">Tweets by @{account.username}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderColumn = (accounts: TwitterAccount[]) => {
    let currentCategory = "";
    return accounts.map((account, index) => {
      const isNewCategory = currentCategory !== account.category;
      currentCategory = account.category;
      return (
        <div key={account.username}>
          {isNewCategory && (
            <h3 className="font-semibold text-rugby-teal mb-3 mt-4 first:mt-0">
              {account.category}
            </h3>
          )}
          {renderTwitterAccount(account)}
        </div>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="afterInteractive"
      />
      {/* Left Column */}
      <div>{renderColumn(leftColumnAccounts)}</div>
      {/* Right Column */}
      <div>{renderColumn(rightColumnAccounts)}</div>
    </div>
  );
};

export default TwitterFeed;
