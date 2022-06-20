const browserifyScript = document.createElement("script");
browserifyScript.src = "bundle.js";

const DetectLanguage = require("detectlanguage");
const axios = require("axios");

function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

const detectLanguage = async (lyric) => {
  const detectLanguageAPI = new DetectLanguage("ea8881603e6edad3d661a8528dbe5f3f");
  const result = await detectLanguageAPI.detect(lyric);

  return result[0].language;
};

const translateLyric = async (language, lyric) => {
  if (language !== "en" && language !== "pt") {
    const options = {
      method: "GET",
      url: "https://translated-mymemory---translation-memory.p.rapidapi.com/api/get",
      params: { langpair: `${language}|en`, q: lyric, mt: "1", onlyprivate: "0", de: "a@b.c" },
      headers: {
        "X-RapidAPI-Key": "ad22301e7emshaa0fde288cb4e34p1d4159jsn7c8affee681c",
        "X-RapidAPI-Host": "translated-mymemory---translation-memory.p.rapidapi.com",
      },
    };

    const { data } = await axios.request(options);

    return data.matches[0].translation;
  }
};

waitForElm(".esRByMgBY3TiENAsbDHA").then(async (elm) => {
  const lyricsContainer = elm;
  for (const child of lyricsContainer.children) {
    let lyric = child.textContent;
    if (lyric.length > 2 && lyric !== "♪") {
      const language = await detectLanguage(lyric);
      if (language) {
        const translation = await translateLyric(language, lyric);
        child.textContent = `${child.textContent} - ${translation}`;
      }
    }
  }
});
