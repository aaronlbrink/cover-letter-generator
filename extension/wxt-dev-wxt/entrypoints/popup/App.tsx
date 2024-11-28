import { useEffect, useState } from 'react';
import { globalClosures, llmResponseCache } from '../utils/storage';
import { IClosure, IExtraction } from '../utils/types';
import { GenerateTabPage } from './tabs/GenerateTabPage';
import { SettingsTabPage } from './tabs/SettingsTabPage';
import { Tab } from './tabs/Tab';
import { TabBar } from './tabs/TabBar';
import { useExtractions } from './useExtractions';
import { useParagraphs } from './useParagraphs';
import { useTemplates } from './useTemplates';

const tabs = ["Generate", "Settings"]

const useGlobalClosures = () => {
  const [globalClosuresState, setGlobalClosuresState] = useState<IClosure[]>([]);

  useEffect(() => {
    const loadGlobalClosures = async () => {
      const savedGlobalClosures = await globalClosures.getValue();
      setGlobalClosuresState(savedGlobalClosures);
    };
    loadGlobalClosures();
  }, []);


  // Debounced save effect
  useEffect(() => {

    const timeoutId = setTimeout(async () => {
      if (!globalClosuresState) return;

      await globalClosures.setValue(globalClosuresState);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [globalClosuresState]);

  return {
    globalClosuresState,
    setGlobalClosuresState
  }

}

function App() {
  const {
    templates,
    setTemplates,
    selectedTemplate,
    setSelectedTemplate,
    newTemplateName,
    setNewTemplateName
  } = useTemplates();
  const [pageUrl, setPageUrl] = useState("");
  const { draftParagraphs, setDraftParagraphs, generatedParagraphs, setGeneratedParagraphs, setLockDraftParagraphs, lockDraftParagraphs } = useParagraphs(pageUrl);
  const [warnings, setWarnings] = useState<string[]>([]);
  const {
    LLMExtractions,
    setLLMExtractions,
    extractions,
    setExtractions,
    pageData,
    setPageData
  } = useExtractions(pageUrl);

  const {
    globalClosuresState,
    setGlobalClosuresState
  } = useGlobalClosures();

  const [activeTab, setActiveTab] = useState(0)

  // const [showSaveOrAddButton, setShowSaveOrAddButton] = useState(false);
  // const [selectedTemplate, setSelectedTemplate] = useState("new_template");
  // const [newTemplateName, setNewTemplateName] = useState("");
  // const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [showSaveToExistingTemplateButton, setShowSaveToExistingTemplateButton] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      // Update generated paragraphs (expanding variables) when draftParagraphs change
      // const globalClosures = globalClosuresState.map(c => ({ key: c.template, value: c.value }))
      // const extractionsClosures = extractions.map(c => {
      //   if (LLMExtractions && LLMExtractions[c.key]) {
      //     return { key: c.key, value: LLMExtractions[c.key] }
      //   }
      // })
      generateParagraphs()
    }, 2000);

    return () => clearTimeout(timeoutId);

  }, [draftParagraphs, globalClosuresState, extractions, LLMExtractions])

  const generateParagraphs = (): string => {
    const globalClosures = globalClosuresState.reduce((acc: any, curr: IClosure) => {
      acc[curr.template] = curr.value; // Set the key-value pair in the accumulator
      return acc; // Return the accumulator for the next iteration
    }, {})
    const extractionsClosures = extractions.reduce((acc: any, curr: IExtraction) => {
      acc[curr.key] = LLMExtractions[curr.key]; // Set the key-value pair in the accumulator
      return acc; // Return the accumulator for the next iteration
    }, {})
    const closures = {
      ...globalClosures,
      ...extractionsClosures
    }

    const transformer_fns: { [f: string]: (...args: any) => void | string | string[] } = {
      testFn: (a: string, b: string) => console.log(a, b),
      ix: (l1: string[], l2: string[]) => {
        const lowerCaseArr2 = l2.map(value => value.toLowerCase());
        return l1.filter(value => lowerCaseArr2.includes(value.toLowerCase()));
      },
      ox: (str: string) => {
        const items = str.split(',').map(item => item.trim());

        const count = items.length;

        if (count === 0) {
          return '';
        } else if (count === 1) {
          return items[0];
        } else if (count === 2) {
          return items.join(' and ');
        } else {
          // Join all but the last item with commas, and add " and " before the last item
          return items.slice(0, count - 1).join(', ') + ' and ' + items[count - 1];
        }
      }
    }

    const regexClosurePattern = /{{([^{}]+)}}/g;
    const regexFunctionPattern = /\{([^(]*)\(([^)]*)\)\}/g;
    const regexToSplitParams = /,(?=(?:(?:[^'"{}[\]]*|["'][^"']*["']|{[^{}]*}|[[^][]*])*)*$)/g;
    let draftParagraphClosures: { key: string; value: string; }[] = []
    let generated = draftParagraphs;

    while (true) {
      draftParagraphClosures = [...generated
        .matchAll(regexClosurePattern)]
        .map(match => ({ key: match[1], value: closures[match[1]] }));
      // console.log(draftParagraphClosures)
      if (draftParagraphClosures.length > 0) {
        // More {{ things }} to fill
        generated = generated.replace(regexClosurePattern, (match, p1) => {
          const replacement = draftParagraphClosures.find(c => c.key === p1)?.value
          // console.log(match)
          // console.log(replacement)
          if (!replacement) {
            // Notify user that we were unable to replace something
          }
          return replacement || ""
        })
      } else {
        // all closures have been filled in!
        break;
      }
    }

    // Apply transformer functions to draftParagraphs w/ expanded closures 
    generated = generated.replace(regexFunctionPattern, (_: string, funcName: string, params: string) => {
      console.log("1")
      // Split parameters by comma, but also handle nested {{}} correctly
      if (funcName in transformer_fns) {
        console.log("2")
        // TODO: This line is slow, I think
        let paramsArr: string[] = params.split(regexToSplitParams).map((item: string) => item.trim().replace(/^['"]|['"]$/g, ''));
        console.log("3")
        // console.log(params)
        // console.log(transformer_fns[funcName](...params))
        const tf = transformer_fns[funcName](...paramsArr) || ""
        if (tf && typeof tf === "string") {
          return tf
        }
        return ""
      } else {
        console.log("Oh no you tried to use a transformer that doesn't exist. Notify user sometime too")
        return ""
      }

    });
    console.log('4')
    setGeneratedParagraphs(generated)
    return generated
  }

  const openSettings = () => {
    chrome.runtime.openOptionsPage()
  }

  const showSaveOrAddButton = Boolean(draftParagraphs) &&
    (selectedTemplate === "new_template" ? Boolean(newTemplateName) : true);

  useEffect(() => {
    // Update the draft (the textarea content) to a newly selected template
    if (selectedTemplate === "new_template") {
      setDraftParagraphs("");
      setNewTemplateName("");
    } else {
      const template = templates.find((t) => t.name === selectedTemplate);
      if (template) {
        setDraftParagraphs(template.paragraphs);
      }
    }
    // setShowSaveOrAddButton(false);
  }, [selectedTemplate])

  useEffect(() => {
    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentTab = tabs[0];
      if (!currentTab.id) return;

      // Listen for messages from the content script
      chrome.runtime.onMessage.addListener(async (message) => {
        if (message.type === 'GET_PAGE_DATA') {
          setPageData(message.data)
        }
        if (message.type === 'GET_URL_DATA') {
          setPageUrl(message.data.url);
        }
      });

      // Request data from the content script
      chrome.tabs.sendMessage(currentTab.id, { type: 'GET_URL_DATA' });
      chrome.tabs.sendMessage(currentTab.id, { type: 'GET_PAGE_DATA' });
    });
  }, []);

  async function downloadFile(url: string, requestBody: any) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }).catch((e) => {
      console.log(e)
    });
    if (response) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      if (browser.downloads?.download != null) {
        await browser.downloads.download({ url: blobUrl, filename: 'cover-' + (Math.random().toString()) });
      } else {
        setWarnings([...warnings, "Downloads API not supported"])
      }
      URL.revokeObjectURL(blobUrl);
    }
  }


  const handleGeneratePDF = async () => {
    let generatedParagraphsOnDemandOrFromState = generatedParagraphs;
    if (!generatedParagraphsOnDemandOrFromState) {
      generatedParagraphsOnDemandOrFromState = generateParagraphs()
    }
    await downloadFile('http://localhost:3000', {
      generatedParagraphs: generatedParagraphsOnDemandOrFromState
    })

  }

  const reEvaluatePage = async () => {
    if (!pageUrl) {
      setWarnings([...warnings, "Unable to find the page url to do a refresh"])
    }
    let store = await llmResponseCache.getValue();
    if (store && store.length > 0) {
      store = store.filter(cachedPage => cachedPage.page_url !== pageUrl)
      await llmResponseCache.setValue(store)
      setPageData(pageData + " ")
    }
  }

  return (
    <>
      <h2 className='dark:text-white'>Cover Gen</h2>
      {pageUrl && <p className='dark:text-white'>Current URL: {pageUrl}</p>}
      {
        warnings.length !== 0 && <div className="bg-yellow-200 dark:bg-yellow-900">
          <h2 className='dark:text-white'>Warnings</h2>
          <p className='dark:text-yellow-50'>This extension may not function as expected. Please notify the developer.</p>
          {warnings.map((warning, index) => (
            <p key={index}>{warning}</p>
          ))}
        </div>
      }
      <TabBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <Tab tabNumber={0} activeTab={activeTab}>
        <>
          <GenerateTabPage state={{
            pageUrl,
            warnings,
            LLMExtractions,
            selectedTemplate,
            setSelectedTemplate,
            templates,
            draftParagraphs,
            setDraftParagraphs,
            setTemplates,
            showSaveOrAddButton,
            setShowSaveToExistingTemplateButton,
            showSaveToExistingTemplateButton,
            newTemplateName,
            setNewTemplateName,
            handleGeneratePDF,
            generatedParagraphs,
            setGeneratedParagraphs,
            setLockDraftParagraphs,
            lockDraftParagraphs
          }} />
        </>
      </Tab>
      <Tab tabNumber={1} activeTab={activeTab}>
        <SettingsTabPage state={{
          pageUrl,
          warnings,
          LLMExtractions,
          selectedTemplate,
          setSelectedTemplate,
          templates,
          draftParagraphs,
          setDraftParagraphs,
          setTemplates,
          showSaveOrAddButton,
          setShowSaveToExistingTemplateButton,
          showSaveToExistingTemplateButton,
          newTemplateName,
          setNewTemplateName,
          handleGeneratePDF,
          extractions,
          setExtractions,
          globalClosuresState,
          setGlobalClosuresState
        }} />
      </Tab>
      <div className="container flex-initial">
        <button className="dark:text-gray-500" onClick={openSettings}>Open Settings</button>
        <button className="dark:text-gray-500" onClick={reEvaluatePage}>Re-evaluate Page Content</button>
      </div>
    </>
  );
}

export default App;
