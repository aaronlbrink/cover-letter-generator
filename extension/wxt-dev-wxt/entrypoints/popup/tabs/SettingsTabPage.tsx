import { IClosure, IExtraction, ITemplate } from "@/entrypoints/utils/types";


export const SettingsTabPage = ({ state: {
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
  extractions,
  setShowSaveToExistingTemplateButton,
  showSaveToExistingTemplateButton,
  setExtractions,
  globalClosuresState,
  setGlobalClosuresState


} }: {
  state: {
    pageUrl: string,
    warnings: string[],
    LLMExtractions: any,
    selectedTemplate: any,
    setSelectedTemplate: (state: string) => void,
    templates: ITemplate[],
    draftParagraphs: any,
    setDraftParagraphs: any,
    newTemplateName: string,
    setNewTemplateName: (state: string) => void,
    handleGeneratePDF: () => void,
    setTemplates: (state: ITemplate[]) => void,
    showSaveOrAddButton: boolean,
    setShowSaveToExistingTemplateButton: (state: boolean) => void,
    showSaveToExistingTemplateButton: boolean,
    extractions: IExtraction[],
    setExtractions: (state: any) => void,
    globalClosuresState: IClosure[],
    setGlobalClosuresState: (state: any) => void,


  }
}) => {
  const [newGlobalClosure, setNewGlobalClosure] = useState(["", ""]);
  const [newExtraction, setNewExtraction] = useState(["", ""])

  const updateExtraction = (param: "key" | "type", e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e?.target?.value) {
      let newExtractions = extractions;
      if (newExtractions) {
        newExtractions[index] = { ...newExtractions[index], [param]: e.target.value }
        setExtractions(newExtractions)
      }
    }
  }

  const removeExtraction = (index: number) => {
    setExtractions((prevState: IExtraction[]) => prevState.filter((_, idx) => idx !== index))
  }


  const handleUpdateGlobalClosure = (key: "template" | "value", value: string, index: number) => {
    let state = globalClosuresState;
    state[index] = { ...state[index], [key]: value }
    setGlobalClosuresState((prevState: IClosure[]) => [
      ...prevState.slice(0, index),
      { ...prevState[index], [key]: value },
      ...prevState.slice(index + 1)
    ]
    )
  }

  const handleRemoveGlobalClosure = (index: number) => {
    setGlobalClosuresState((prevState: IClosure[]) => prevState.filter((_, idx) => idx !== index))
  }

  return (
    <>
      <div className="container">
        <h2 className="font-header dark:text-gray-200">Extract</h2>
        {extractions && extractions.map((extraction: IExtraction, index) => {
          return (<div key={index}>
            <div>
              <input className="border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 my-1" type="text" value={extraction.key} onChange={(e) => updateExtraction("key", e, index)} />
              <input className="border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 my-1 mx-2" type="text" value={extraction.type} onChange={(e) => updateExtraction("type", e, index)} />
              <button className="ml-2 border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 my-1" onClick={(e) => removeExtraction(index)}>X</button>
            </div>
            <span className="dark:text-gray-50">{LLMExtractions && LLMExtractions[extraction.key]}</span>
          </div>)
        })}
        <div className="flex items-start">
          <input type="text" placeholder="Extraction Key" className="border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 my-1" value={newExtraction[0]} onChange={(e) => setNewExtraction([e.target.value, newExtraction[1]])} />
          <input type="text" placeholder="list | string" className="ml-2 border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 my-1" value={newExtraction[1]} onChange={(e) => setNewExtraction([newExtraction[0], e.target.value])} />
          <button className="border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 m-1" onClick={() => { setExtractions([...extractions, { key: newExtraction[0], type: newExtraction[1] }]); setNewExtraction(["", ""]) }}>Add Extraction</button>
        </div>
        <h2 className="font-header dark:text-gray-200">Global Closures</h2>
        <div className="flex flex-col">
          {globalClosuresState.map((closure, index) => {
            return (
              <div key={index} className="flex items-start">
                <input type="text" placeholder="Key (ex. name)" className="border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 my-1" value={closure.template} onChange={(e) => handleUpdateGlobalClosure("template", e.target.value, index)} />
                <textarea placeholder="Value (ex. {first} {last} or 'Jon Doe')" className="ml-2 border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 my-1" value={closure.value} onChange={(e) => handleUpdateGlobalClosure("value", e.target.value, index)} />
                <button className="ml-2 border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 my-1" onClick={(e) => handleRemoveGlobalClosure(index)}>X</button>
              </div>
            )
          })}
        </div>
        <div className="flex items-start">
          <input type="text" placeholder="Key (ex. name)" className="border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 my-1" value={newGlobalClosure[0]} onChange={(e) => setNewGlobalClosure([e.target.value, newGlobalClosure[1]])} />
          <textarea placeholder="Value (ex. {first} {last} or 'Jon Doe')" className="ml-2 border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 my-1" value={newGlobalClosure[1]} onChange={(e) => setNewGlobalClosure([newGlobalClosure[0], e.target.value])} />
          <button className="border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 m-1" onClick={() => { setGlobalClosuresState([...globalClosuresState, { template: newGlobalClosure[0], value: newGlobalClosure[1] }]); setNewGlobalClosure(["", ""]) }}>Add Closure</button>
        </div>
        <span className="dark:text-white">{JSON.stringify(globalClosuresState)}</span>
      </div>
    </>
  )
}