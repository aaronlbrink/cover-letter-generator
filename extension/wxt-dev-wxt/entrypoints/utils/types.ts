export interface IPageData {
  role: string;
  company_name: string;
  company_address: string;
  skills_required: string[];
  company_values: string;
  company_mission: string;
}

export interface IClosure {
  template: string;
  value: string;
}

export interface ITemplate {
  name: string;
  paragraphs: string;
  closures: IClosure[];
}

export interface ICoverParagraphs {
  url: string;
  paragraphs: string;
  modifiedGeneratedParagraphs: string;
}

export interface IExtraction {
  key: string;
  type: string;
}

export interface ILlmReponseCache {
  page_url: string;
  response: string; // JSON stringified
}

export interface IAppState {
  pageUrl: string;
  warnings: string[];
  LLMExtractions: object;
  selectedTemplate: any;
  setSelectedTemplate: (state: string) => void;
  templates: ITemplate[];
  draftParagraphs: any;
  setDraftParagraphs: any;
  newTemplateName: string;
  setNewTemplateName: (state: string) => void;
  handleGeneratePDF: () => void;
  setTemplates: (state: ITemplate[]) => void;
  showSaveOrAddButton: boolean;
  setShowSaveToExistingTemplateButton: (state: boolean) => void;
  showSaveToExistingTemplateButton: boolean;
  setGeneratedParagraphs: (state: any) => void;
  generatedParagraphs: string;
  lockDraftParagraphs: boolean;
  setLockDraftParagraphs: (state: any) => void;
  paragraphsStoragePosition: number;
  setParagraphsStoragePosition: (state: any) => void;
  coverName: string;
  setCoverName: (state: any) => void;
  extractions: IExtraction[];
  setExtractions: (state: any) => void;
  globalClosuresState: IClosure[];
  setGlobalClosuresState: (state: any) => void;
}