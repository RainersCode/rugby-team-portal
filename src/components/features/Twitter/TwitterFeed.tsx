"use client";

import Script from "next/script";
import { useEffect, useState, useCallback } from "react";

interface TwitterAccount {
  username: string;
  category: string;
}

interface TwitterFeedProps {
  usernames: TwitterAccount[];
}

const TwitterFeed = ({ usernames }: TwitterFeedProps) => {
  const [selectedAccount, setSelectedAccount] = useState<string>(usernames[0]?.username || "");
  const [loadingAccount, setLoadingAccount] = useState<string | null>(null);
  const [isTwitterScriptLoaded, setIsTwitterScriptLoaded] = useState(false);

  const loadTwitterTimeline = useCallback((username: string) => {
    if (!isTwitterScriptLoaded || !username) return;

    setLoadingAccount(username);
    
    // Clear existing timeline
    const container = document.getElementById(`timeline-container-${username}`);
    if (container) {
      container.innerHTML = '';
    }

    // Create new timeline
    const anchor = document.createElement('a');
    anchor.className = 'twitter-timeline';
    anchor.setAttribute('data-height', '600');
    anchor.setAttribute('data-theme', 'light');
    anchor.setAttribute('data-chrome', 'noheader nofooter noborders transparent');
    anchor.href = `https://twitter.com/${username}?ref_src=twsrc%5Etfw`;
    
    if (container) {
      container.appendChild(anchor);
    }

    // Load the timeline
    if ((window as any).twttr) {
      (window as any).twttr.widgets.load(container);

      const observer = new MutationObserver((mutations, obs) => {
        const twitterFrame = container?.querySelector('iframe');
        if (twitterFrame) {
          setTimeout(() => {
            setLoadingAccount(null);
            obs.disconnect();
          }, 500);
        }
      });

      observer.observe(container || document.body, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
  }, [isTwitterScriptLoaded]);

  useEffect(() => {
    if (selectedAccount) {
      loadTwitterTimeline(selectedAccount);
    }
  }, [selectedAccount, loadTwitterTimeline]);

  const handleScriptLoad = useCallback(() => {
    setIsTwitterScriptLoaded(true);
    if (selectedAccount) {
      loadTwitterTimeline(selectedAccount);
    }
  }, [selectedAccount, loadTwitterTimeline]);

  const renderAccountList = () => {
    let currentCategory = "";
    return usernames.map((account, index) => {
      const isNewCategory = currentCategory !== account.category;
      if (isNewCategory) {
        currentCategory = account.category;
      }
      
      return (
        <div key={`account-${account.username}-${index}`}>
          {isNewCategory && (
            <h3 className="font-semibold text-rugby-teal mb-3 mt-4 first:mt-0">
              {account.category}
            </h3>
          )}
          <button
            onClick={() => setSelectedAccount(account.username)}
            className={`w-full mb-2 px-4 py-3 flex items-center justify-between rounded-lg border transition-all duration-200 ${
              selectedAccount === account.username
                ? "border-rugby-teal bg-rugby-teal/10 text-rugby-teal"
                : "border-rugby-teal/20 bg-white dark:bg-gray-800 hover:border-rugby-teal/40"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-full bg-rugby-teal/10 flex items-center justify-center">
                <svg
                  className={`w-4 h-4 ${
                    selectedAccount === account.username
                      ? "text-rugby-teal"
                      : "text-rugby-teal/60"
                  }`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
                </svg>
              </div>
              <div className="flex flex-col items-start">
                <span className={`font-medium text-sm ${
                  selectedAccount === account.username
                    ? "text-rugby-teal"
                    : "text-gray-900 dark:text-gray-100"
                }`}>
                  @{account.username}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {account.category}
                </span>
              </div>
            </div>
          </button>
        </div>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      
      {/* Main Tweet Feed */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-rugby-teal/20 overflow-hidden">
        <div className="h-[600px] overflow-hidden relative">
          {loadingAccount === selectedAccount && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 z-10">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-6 h-6 border-2 border-rugby-teal border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Loading tweets...
                </span>
              </div>
            </div>
          )}
          <div className="relative h-full">
            {usernames.map((account, index) => (
              <div
                key={`timeline-${account.username}-${index}`}
                id={`timeline-container-${account.username}`}
                className={`absolute inset-0 transition-opacity duration-300 ${
                  account.username === selectedAccount ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Account Selection Sidebar */}
      <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Select Rugby Account
        </h3>
        <div className="space-y-2 overflow-y-auto max-h-[540px] pr-2 scrollbar-thin scrollbar-thumb-rugby-teal/20 scrollbar-track-transparent">
          {renderAccountList()}
        </div>
      </div>
    </div>
  );
};

export default TwitterFeed;
