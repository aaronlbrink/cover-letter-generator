import { coverParagraphs, currentParagraphPosition } from '../utils/storage';

// Custom hook for paragraph-related state
export function useParagraphs(pageUrl: string) {
  const [paragraphsStoragePosition, setParagraphsStoragePosition] = useState(-1);
  const [draftParagraphs, setDraftParagraphs] = useState("");
  const [generatedParagraphs, setGeneratedParagraphs] = useState("")
  const [lockDraftParagraphs, setLockDraftParagraphs] = useState(false);


  const loadParagraphsByIndex = async (givenIndex?: number) => {
    const savedParagraphs = await coverParagraphs.getValue();
    let index = givenIndex || await currentParagraphPosition.getValue();

    setDraftParagraphs(savedParagraphs[index]?.paragraphs || "");
    setParagraphsStoragePosition(index);
    setGeneratedParagraphs(savedParagraphs[index]?.modifiedGeneratedParagraphs || "");
    if (savedParagraphs[index]?.modifiedGeneratedParagraphs) {
      setLockDraftParagraphs(true)
    } else {
      setLockDraftParagraphs(false)
    }
  }

  useEffect(() => {
    (async () => {
      await loadParagraphsByIndex();
    })();

  }, []);

  // Debounced save effect
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!draftParagraphs) return;

      const savedParagraphs = await coverParagraphs.getValue();
      savedParagraphs[paragraphsStoragePosition] = { ...savedParagraphs[paragraphsStoragePosition], paragraphs: draftParagraphs };

      await coverParagraphs.setValue(savedParagraphs);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [draftParagraphs, pageUrl]);

  useEffect(() => {
    // When paragraph storage position is changed, update it in storage and set state to refelct the new paragraph
    (async () => {
      let paragraphs = await coverParagraphs.getValue();
      if (paragraphsStoragePosition < 0) {
        console.error("Failed to update paragraph position to index less than 0");
        return;
      } else if (paragraphsStoragePosition >= paragraphs.length && paragraphsStoragePosition <= paragraphs.length) {
        console.log("will be pushing");
        const newCoverParagraph = { "url": "", "paragraphs": "New Cover", modifiedGeneratedParagraphs: "" }
        paragraphs.push(newCoverParagraph);
        setDraftParagraphs(newCoverParagraph.paragraphs);
        setParagraphsStoragePosition(paragraphsStoragePosition);
        setGeneratedParagraphs("");
        setLockDraftParagraphs(false)

      } else if (paragraphsStoragePosition > paragraphs.length) {
        console.error("Failed to update paragraph position to index more than 1 greater than last position");
      } else {
        // TODO: Perhaps ensure the current cover is saved before loading a new one (to avoid a race condition b/w the useEffect and the user clicking)
        loadParagraphsByIndex(paragraphsStoragePosition)
      }
    })();
  }, [paragraphsStoragePosition])

  return { draftParagraphs, setDraftParagraphs, generatedParagraphs, setGeneratedParagraphs, lockDraftParagraphs, setLockDraftParagraphs, paragraphsStoragePosition, setParagraphsStoragePosition };
}