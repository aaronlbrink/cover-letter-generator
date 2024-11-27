import { ITemplate } from "@/entrypoints/utils/types";


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
  lockDraftParagraphs


} }: {
  state: {
    pageUrl: string,
    warnings: string[],
    LLMExtractions: object,
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
    setGeneratedParagraphs: (state: any) => void,
    generatedParagraphs: string,
    lockDraftParagraphs: boolean,
    setLockDraftParagraphs: (state: any) => void,


  }
}) => {

  const handleGeneratedParagraphChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGeneratedParagraphs(e.target.value);
    setLockDraftParagraphs(true)

  }

  return (
    <div className="container flex flex-col">

      <input type="text" value={JSON.stringify(LLMExtractions, null, 2) || ""} />
      {/* Add this section to display the scraped data */}

      <div className="flex flex-col">
        <select className="border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 my-1" onChange={(e) => setSelectedTemplate(e.target.value)}>
          {templates.map((template, index) => (
            <option key={index} value={template.name}>{template.name}</option>
          ))}
          <option value="new_template">Create new template</option>
        </select>

        <div className="flex flex-row justify-evenly">
          <textarea readOnly={lockDraftParagraphs} className={`flex-1 paragraphs border-neutral-400 dark:border-neutral-500 mr-1 border-2 dark:bg-gray-800 dark:text-white rounded p-1 my-1 ${lockDraftParagraphs && 'bg-slate-700 dark:bg-slate-400'}`} value={draftParagraphs} onChange={(e) => setDraftParagraphs(e.target.value)} />
          <textarea className="flex-1 ml-1 paragraphs border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 my-1" value={generatedParagraphs} onChange={
            (e) => handleGeneratedParagraphChange(e)
          } />
        </div>
        {selectedTemplate == "new_template" && <input className="border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 my-1" required={true} placeholder="New Template Name" type="text" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} />}
        <div className="button-container">
          <button className="border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 my-1" onClick={handleGeneratePDF}>Generate PDF</button>
          {showSaveOrAddButton && <button className="border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 m-1" onClick={() => {
            if (selectedTemplate === "new_template") {
              const newTemplate = {
                name: newTemplateName,
                paragraphs: draftParagraphs,
              };
              setTemplates([...templates, newTemplate]);
            }
          }}>{selectedTemplate === "new_template" ? "Add New Template" : `Update ${selectedTemplate} Template`}</button>}

          {showSaveToExistingTemplateButton && <button className="border-neutral-400 dark:border-neutral-500 border-2 dark:bg-gray-800 dark:text-white rounded p-1 m-1" onClick={() => {
            const template = templates.find((t) => t.name === selectedTemplate);
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