import { extractionsStore, llmResponseCache } from "../utils/storage";
import { IExtraction } from "../utils/types";
import { haveLLMParsePage } from "./chatGPT";

export function useExtractions(pageUrl: string) {
  const [LLMExtractions, setLLMExtractions] = useState<object>({});
  const [extractions, setExtractions] = useState<IExtraction[]>();
  const [pageData, setPageData] = useState<string>("");
  useEffect(() => {
    const loadExtractions = async () => {
      // Set extractions state to local storage on initial load
      const savedExtractions = await extractionsStore.getValue();
      setExtractions(savedExtractions);
    }
    loadExtractions()
  }, [])

  useEffect(() => {
    // Once pageData (sent from content script) and extractions (loaded from local storage) are ready, parse the page data with the given keys you want extracted.
    if (pageData.length > 0 && extractions && pageUrl.length > 0) {
      console.log("this shouldn't run on blank page");
      (async () => {
        let extractionKeys = extractions.map(ext => ext.key)
        let cachedResponses = await llmResponseCache.getValue();
        console.log("CR:")

        const lookupSiteInCache = cachedResponses && cachedResponses.length >= 1 && cachedResponses.find(v => v.page_url === pageUrl);
        console.log(pageUrl)
        console.log(lookupSiteInCache)
        console.log('----')
        // console.log(cachedResponses)
        if (!lookupSiteInCache) {
          const LLMExtractions = await haveLLMParsePage(pageData, extractionKeys)
          if (!cachedResponses || !cachedResponses.length) {
            cachedResponses = []
          }
          llmResponseCache.setValue([...cachedResponses, { page_url: pageUrl, response: JSON.stringify(LLMExtractions) }])
          setLLMExtractions(LLMExtractions)
        } else {
          if (lookupSiteInCache.response) {
            setLLMExtractions(JSON.parse(lookupSiteInCache.response))
          }
        }
      })();

    }
  }, [extractions, pageData, pageUrl])



  return {
    LLMExtractions,
    setLLMExtractions,
    extractions,
    setExtractions,
    setPageData,
    pageData
  }
}