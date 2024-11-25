import { coverParagraphs } from '../utils/storage';

// Custom hook for paragraph-related state
export function useParagraphs(pageUrl: string) {
  const [draftParagraphs, setDraftParagraphs] = useState("");

  useEffect(() => {
    const loadParagraphs = async () => {
      const savedParagraphs = await coverParagraphs.getValue();
      const foundSavedParagraphs = savedParagraphs.find(p => p.url === pageUrl);
      setDraftParagraphs(foundSavedParagraphs?.paragraphs || "");
    };

    loadParagraphs();
  }, [pageUrl]);

  // Debounced save effect
  useEffect(() => {
    if (!pageUrl) return;

    const timeoutId = setTimeout(async () => {
      if (!draftParagraphs) return;

      const savedParagraphs = await coverParagraphs.getValue();
      const existingParagraph = savedParagraphs.find(p => p.url === pageUrl);

      const updatedParagraphs = existingParagraph
        ? savedParagraphs.map(p => p.url === pageUrl ? { ...p, paragraphs: draftParagraphs } : p)
        : [...savedParagraphs, { url: pageUrl, paragraphs: draftParagraphs }];

      await coverParagraphs.setValue(updatedParagraphs);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [draftParagraphs, pageUrl]);

  return { draftParagraphs, setDraftParagraphs };
}