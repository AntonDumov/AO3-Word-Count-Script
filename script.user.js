// ==UserScript==
// @name         AO3 Word Count Script
// @namespace    ao3chapterwordcounter
// @version      3
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
    const cacheDurationMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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

    const setCachedWordCount = (link, wordCount) => {
        const cacheKey = cacheKeyPrefix + link.href;
        const cacheValue = JSON.stringify({ timestamp: Date.now(), wordCount });
        localStorage.setItem(cacheKey, cacheValue);
    };

    const chapterLinks = document.querySelectorAll("ol.chapter.index.group li a");

    let maxWidth = 0;
    chapterLinks.forEach(link => {
        const width = link.getBoundingClientRect().width;
        if (width > maxWidth) {
            maxWidth = width;
        }
    });

    chapterLinks.forEach(link => {
        const cachedWordCount = getCachedWordCount(link);
        let wordCount
        if (cachedWordCount) {
            wordCount = cachedWordCount
        } else {
            fetch(link.href).then(response => response.text())
                .then(text => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, "text/html");
                    const article = doc.querySelector("div[role=article]");
                    wordCount = article ? article.textContent.trim().split(wordCountRegex).length : 0;
                    setCachedWordCount(link, wordCount);
                })
                .catch(error => console.log(error));
        }
        const spanElement = link.parentElement.querySelector('span.datetime');
        const wordCountElement = document.createElement("span");
        wordCountElement.textContent = `(${wordCount} words)`;
        const margin = maxWidth - link.getBoundingClientRect().width + 7;
        wordCountElement.style.marginLeft = `${margin}px`;
        spanElement.parentNode.insertBefore(wordCountElement, spanElement.nextSibling);
    });

})();
