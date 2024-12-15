import { storage } from 'wxt/storage';
import { IClosure, ICoverParagraphs, IExtraction, ILlmReponseCache, ITemplate } from "./types";

// TODO: Save the state of the cover letter and modified generatedv paragraghs

export const coverParagraphs = storage.defineItem<ICoverParagraphs[]>(
  'local:coverParagraphs',
  {
    fallback: [{ "url": "", "paragraphs": "Cover Letter Here", modifiedGeneratedParagraphs: "" }],
  },
);

export const currentParagraphPosition = storage.defineItem<number>(
  'local:currentParagraphPosition',
  {
    fallback: 0,
  },
);

export const coverTemplates = storage.defineItem<ITemplate[]>(
  'local:coverTemplates',
  {
    fallback: [{ "name": "Exmaple Template", "paragraphs": "Cover Letter Here", closures: [{ template: "example_closure", value: "Example" }] }],
  },
);

export const globalClosures = storage.defineItem<IClosure[]>(
  'local:globalClosures',
  {
    fallback: [{ template: "global_idea", value: "Global Idea" }, { template: "Example_Second_Closure", value: "Example Second Closure" }]
  }
)

export const extractionsStore = storage.defineItem<IExtraction[]>(
  'local:extractionsStore',
  {
    fallback: [{ key: 'role', type: 'string' }, { key: 'frontend_skills', type: 'list' }, { key: 'company_name', type: 'string' }],
  },
);

export const llmResponseCache = storage.defineItem<ILlmReponseCache[]>(
  'local:llmResponseCache',
  {
    fallback: [],
  },
);

