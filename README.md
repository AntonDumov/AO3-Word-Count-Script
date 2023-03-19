# AO3 Word Count Script

## [![Install AO3 Word Count Script](https://img.shields.io/badge/Install-AO3_Word_Count_Script-blue.svg)](https://github.com/AntonDumov/AO3-Word-Count-Script/raw/main/script.user.js)

The script adds word counts to chapter links on AO3 Chapter Index pages. The script uses regular expressions and DOM manipulation to extract the word count from the HTML content of each chapter and adds it as a span element to the chapter link.

The script also implements caching of word counts to reduce the number of HTTP requests made to AO3. Cached word counts are stored in the user's local storage and are retrieved and used if they are not expired. The cache duration is set to 24 hours.
