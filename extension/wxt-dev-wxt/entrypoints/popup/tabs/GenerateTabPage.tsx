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


  }
}) => {


  return (
    <div className="container flex flex-col">

      <input type="text" value={JSON.stringify(LLMExtractions, null, 2) || ""} />
      {/* Add this section to display the scraped data */}

      <div className="flex flex-col">
        <select onChange={(e) => setSelectedTemplate(e.target.value)}>
          {templates.map((template, index) => (
            <option key={index} value={template.name}>{template.name}</option>
          ))}
          <option value="new_template">Create new template</option>
        </select>


        <textarea className="paragraphs" value={draftParagraphs} onChange={(e) => setDraftParagraphs(e.target.value)} />
        {selectedTemplate == "new_template" && <input required={true} placeholder="New Template Name" type="text" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} />}
        <div className="button-container">
          <button onClick={handleGeneratePDF}>Generate PDF</button>
          {showSaveOrAddButton && <button onClick={() => {
            if (selectedTemplate === "new_template") {
              const newTemplate = {
                name: newTemplateName,
                paragraphs: draftParagraphs,
              };
              setTemplates([...templates, newTemplate]);
            }
          }}>{selectedTemplate === "new_template" ? "Add New Template" : `Update ${selectedTemplate} Template`}</button>}

          {showSaveToExistingTemplateButton && <button onClick={() => {
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