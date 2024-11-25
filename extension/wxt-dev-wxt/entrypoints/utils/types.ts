export interface IPageData {
  role: string;
  company_name: string;
  company_address: string;
  skills_required: string[];
  company_values: string;
  company_mission: string;
}

export interface ITemplate {
  name: string;
  paragraphs: string;
}

export interface ICoverParagraphs {
  url: string;
  paragraphs: string;
}

export interface IExtraction {
  key: string;
  type: string;
}

export interface ILlmReponseCache {
  page_url: string;
  response: string; // JSON stringified
}