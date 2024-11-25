import { IExtraction, ITemplate } from "@/entrypoints/utils/types";


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
    extractions: IExtraction[] | undefined,
    setExtractions: (state: IExtraction[]) => void,


  }
}) => {


  const updateExtraction = (param: "key" | "type", e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e?.target?.value) {
      let newExtractions = extractions;
      if (newExtractions) {
        newExtractions[index] = { ...newExtractions[index], [param]: e.target.value }
        setExtractions(newExtractions)
      }
    }
  }

  return (
    <>
      <div className="container">
        <h2 className="font-header">Settings</h2>
        {extractions && extractions.map((extraction: IExtraction, index) => {
          return (<div key={index}>
            <div>
              <input className="border-stone-400 border-2 rounded p-1 my-1" type="text" value={extraction.key} onChange={(e) => updateExtraction("key", e, index)} />
              <input className="border-stone-400 border-2 rounded p-1 my-1 mx-1" type="text" value={extraction.type} onChange={(e) => updateExtraction("type", e, index)} />
            </div>
            {LLMExtractions && LLMExtractions[extraction.key]}
          </div>)
        })}
      </div>
    </>
  )
}