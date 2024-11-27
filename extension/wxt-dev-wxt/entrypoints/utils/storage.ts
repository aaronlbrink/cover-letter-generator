import { storage } from 'wxt/storage';
import { IClosure, ICoverParagraphs, IExtraction, ILlmReponseCache, ITemplate } from "./types";

export const coverParagraphs = storage.defineItem<ICoverParagraphs[]>(
  'local:coverParagraphs',
  {
    fallback: [{ "url": "", "paragraphs": "Dear Mrs. Jackson, I am for realaaassszz" }],
  },
);

export const coverTemplates = storage.defineItem<ITemplate[]>(
  'local:coverTemplates',
  {
    fallback: [{ "name": "Exmaple Template", "paragraphs": "Dear Mrs. Jackson, I am for realaaassszz", closures: [{ template: "Examplez", value: "Exampeals" }] }],
  },
);

export const globalClosures = storage.defineItem<IClosure[]>(
  'local:globalClosures',
  {
    fallback: [{ template: "global_idea", value: "Global Idea" }, { template: "second", value: "Second Closure" }]
  }
)

export const extractionsStore = storage.defineItem<IExtraction[]>(
  'local:extractionsStore',
  {
    fallback: [{ key: 'role', type: 'string' }, { key: 'frontend_skills', type: 'list' }],
  },
);

export const llmResponseCache = storage.defineItem<ILlmReponseCache[]>(
  'local:llmResponseCache',
  {
    fallback: [],
  },
);

