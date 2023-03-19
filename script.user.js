// ==UserScript==
// @name         AO3 Word Count Script
// @namespace    ao3chapterwordcounter
// @version      3.4
// @description  Adds word counts to chapter links on AO3 Chapter Index pages.
// @author       Anton Dumov
// @license      MIT
// @match        https://archiveofourown.org/*/navigate
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const wordCountRegex = /\s+/g;
    const cacheKeyPrefix = "ao3-word-count-cache-";
    const cacheDurationMs = 30 * 24 * 60 * 60 * 1000;

    const getCachedWordCount = link => {
        const cacheKey = cacheKeyPrefix + link.href;
        const cachedValue = localStorage.getItem(cacheKey);
        if (cachedValue) {
            const { timestamp, wordCount } = JSON.parse(cachedValue);
            if (Date.now() - timestamp < cacheDurationMs) {
                return wordCount;
            } else {
                localStorage.removeItem(cacheKey);
            }
        }
        return null;
    };

    const setCachedWordCount = (url, wordCount) => {
        const cacheKey = cacheKeyPrefix + url;
        const cacheValue = JSON.stringify({ timestamp: Date.now(), wordCount });
        localStorage.setItem(cacheKey, cacheValue);
    };

    let fetchInProgress = false;

    const fetchWordCount = async (url) => {
        try {
            if (fetchInProgress) {
                // Wait for the previous request to complete
                await new Promise(resolve => {
                    const interval = setInterval(() => {
                        if (!fetchInProgress) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 2000);
                });
            }
            fetchInProgress = true;

            const response = await fetch(url);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "text/html");
            const article = doc.querySelector("div[role=article]");
            const wordCount = article ? article.textContent.trim().split(wordCountRegex).length : 0;
            setCachedWordCount(url, wordCount);
            fetchInProgress = false;
            return wordCount;
        } catch (error) {
            console.log(error);
            fetchInProgress = false;
        }
    }

    const getWordCount = async (link) => {
        const cachedWordCount = getCachedWordCount(link);
        let wordCount;
        if (cachedWordCount) {
            wordCount = cachedWordCount;
        } else {
            wordCount = await fetchWordCount(link.href);
        }
        const spanElement = link.parentElement.querySelector('span.datetime');
        const wordCountElement = document.createElement("span");
        wordCountElement.textContent = `(${wordCount} words)`;
        const margin = maxWidth - link.getBoundingClientRect().width + 7;
        wordCountElement.style.marginLeft = `${margin}px`;
        spanElement.parentNode.insertBefore(wordCountElement, spanElement.nextSibling);
    }

    const chapterLinks = document.querySelectorAll("ol.chapter.index.group li a");

    const parentWidth = chapterLinks[0].parentElement.getBoundingClientRect().width;
    let maxWidth = 0;

    chapterLinks.forEach(link => {
        const width = link.getBoundingClientRect().width;
        if (width > maxWidth && width <= parentWidth) {
            maxWidth = width;
        }
    });

    chapterLinks.forEach(link => {
        getWordCount(link);
    });

})();
