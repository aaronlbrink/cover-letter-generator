import { coverParagraphs } from "@/entrypoints/utils/storage";
import { IAppState } from "@/entrypoints/utils/types";

export const GenerateTabPage = ({ state: {
  pageUrl,
  warnings,
  LLMExtractions,
  selectedTemplate,
  setSelectedTemplate,
  templates,
  draftParagraphs,
  setDraftParagraphs,
  newTemplateName,
  setNewTemplateName,
  handleGeneratePDF,
  setTemplates,
  showSaveOrAddButton,
  setShowSaveToExistingTemplateButton,
  showSaveToExistingTemplateButton,
  generatedParagraphs,
  setGeneratedParagraphs,
  setLockDraftParagraphs,
  lockDraftParagraphs,
  paragraphsStoragePosition,
  setParagraphsStoragePosition,
  coverName,
  setCoverName,
  extractions,
  globalClosuresState


} }: {
  state: IAppState
}) => {

  const [highlightedText, setHighlightedText] = useState("");

  useEffect(() => {
    // Syntax highlight right side
    const extracts = extractions.map(ext => LLMExtractions[ext.key]).filter(x => x);
    const global = globalClosuresState.map(closure => closure.value)

    const phrases = [...extracts, ...global].join("|");
    console.log(phrases)

    const rx = new RegExp(`(${phrases})`, 'g');
    console.log(rx)
    const g = generatedParagraphs.replaceAll(rx, (match, p1) => {
      return `<span class="bg-yellow-200 dark:bg-yellow-600">${p1}</span>`
    })
    setHighlightedText(g)
    console.log(g)

  }, [LLMExtractions, generatedParagraphs]);

  // useLayoutEffect(() => {
  //   if (offset !== undefined) {
  //     const newRange = document.createRange()
  //     newRange.setStart(contentEditableRef.current.childNodes[0], offset)
  //     const selection = document.getSelection()
  //     selection.removeAllRanges()
  //     selection.addRange(newRange)
  //   }
  // })

  // const saveCursorPosition = () => {
  //   const selection = window.getSelection();
  //   if (selection) {
  //     const range = selection.getRangeAt(0);
  //     return range;
  //   }
  // };

  // const restoreCursorPosition = (range: Range) => {
  //   const selection = window.getSelection();
  //   if (selection) {
  //     selection.removeAllRanges();
  //     selection.addRange(range);
  //   }
  // };

  const handleGeneratedParagraphChange = async (value: string) => {
    // const range = window.getSelection()?.getRangeAt(0)
    // setOffset(range.startOffset);

    setGeneratedParagraphs(value);
    setLockDraftParagraphs(true);
    let currentParagraphs = await coverParagraphs.getValue();
    const modifiedParagraphs = { ...currentParagraphs[paragraphsStoragePosition], modifiedGeneratedParagraphs: value };
    currentParagraphs[paragraphsStoragePosition] = modifiedParagraphs;
    await coverParagraphs.setValue(currentParagraphs);
  }

  const handleOverwriteCustomizedContent = async () => {
    setGeneratedParagraphs("");
    setLockDraftParagraphs(false);
    let paragraphs = await coverParagraphs.getValue();
    paragraphs[paragraphsStoragePosition] = { ...paragraphs[paragraphsStoragePosition], modifiedGeneratedParagraphs: "" };
    await coverParagraphs.setValue(paragraphs);
  }

  const handleSwitchToPrevCover = async () => {
    if ((paragraphsStoragePosition - 1) >= 0) {
      setParagraphsStoragePosition(paragraphsStoragePosition - 1)
    }
  }

  const handleSwitchToNextCover = async () => {
    setParagraphsStoragePosition(paragraphsStoragePosition + 1)
  }

  return (
    <div className="container flex flex-col">
      <div className="flex">
        <button disabled={paragraphsStoragePosition === 0} className={`border-neutral-400 dark:border-neutral-500 border dark:bg-gray-800 dark:text-white rounded p-1 my-1 ${paragraphsStoragePosition === 0 && "dark:bg-gray-400 bg-gray-700"}`} onClick={handleSwitchToPrevCover}>Prev</button>
        <button className="border-neutral-400 dark:border-neutral-500 border dark:bg-gray-800 dark:text-white rounded p-1 my-1 mx-1" onClick={handleSwitchToNextCover}>Next/Create New</button>
      </div>
      <div className="flex flex-col">
        <select className="border-neutral-400 dark:border-neutral-500 border dark:bg-gray-800 dark:text-white rounded p-1 my-1" onChange={(e) => setSelectedTemplate(e.target.value)}>
          {templates.map((template, index) => (
            <option key={index} value={template.name}>{template.name}</option>
          ))}
          <option value="new_template">Create new template</option>
        </select>

        <div className="flex flex-row justify-evenly">
          <textarea
            readOnly={lockDraftParagraphs}
            className={`flex-1 paragraphs border-neutral-400 dark:border-neutral-500 mr-1 border dark:bg-gray-800 dark:text-white rounded p-1 my-1 ${lockDraftParagraphs && 'bg-slate-700 dark:bg-slate-400'}`}
            value={draftParagraphs}
            onChange={(e) => { setDraftParagraphs(e.target.value); }}
          />

          <textarea
            value={generatedParagraphs}
            onChange={
              (e) => handleGeneratedParagraphChange(e.target.value)
            }
            className="flex-1 ml-1 paragraphs border-neutral-400 dark:border-neutral-500 border dark:bg-gray-800 dark:text-white rounded p-1 my-1"
          />
        </div>
        {selectedTemplate == "new_template" && <input className="border-neutral-400 dark:border-neutral-500 border dark:bg-gray-800 dark:text-white rounded p-1 my-1" required={true} placeholder="New Template Name" type="text" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} />}
        <button className="border-neutral-400 dark:border-neutral-500 border dark:bg-gray-800 dark:text-white rounded p-1 my-1" onClick={handleOverwriteCustomizedContent}>Overwrite customized content</button>
        <input className="flex-1 ml-1 paragraphs border-neutral-400 dark:border-neutral-500 border dark:bg-gray-800 dark:text-white rounded p-1 my-1" type="text" onChange={(e) => setCoverName(e.target.value)} value={coverName} placeholder="Cover name" />
        <div className="button-container">
          <button className="border-neutral-400 dark:border-neutral-500 border dark:bg-gray-800 dark:text-white rounded p-1 my-1" onClick={handleGeneratePDF}>Generate PDF</button>
          {showSaveOrAddButton && <button className="border-neutral-400 dark:border-neutral-500 border dark:bg-gray-800 dark:text-white rounded p-1 m-1" onClick={() => {
            if (selectedTemplate === "new_template") {
              const newTemplate = {
                name: newTemplateName,
                paragraphs: draftParagraphs,
                closures: [],
              };
              setTemplates([...templates, newTemplate]);
            } else {
              setShowSaveToExistingTemplateButton(true)
            }
          }}>{selectedTemplate === "new_template" ? "Add New Template" : `Update ${selectedTemplate} Template`}</button>}

          {showSaveToExistingTemplateButton && <button className="border-neutral-400 dark:border-neutral-500 border dark:bg-gray-800 dark:text-white rounded p-1 m-1" onClick={() => {
            const template = templates.find((t) => t.name === selectedTemplate);
            console.log(template)
            if (template) {
              template.paragraphs = draftParagraphs;
              setTemplates([...templates]);
            }

          }}>Confirm: Save to existing template</button>}
        </div>

      </div>
    </div>
  )
}