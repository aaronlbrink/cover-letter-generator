import { useEffect, useState } from 'react';
import { llmResponseCache } from '../utils/storage';
import { GenerateTabPage } from './tabs/GenerateTabPage';
import { SettingsTabPage } from './tabs/SettingsTabPage';
import { Tab } from './tabs/Tab';
import { TabBar } from './tabs/TabBar';
import { useExtractions } from './useExtractions';
import { useParagraphs } from './useParagraphs';
import { useTemplates } from './useTemplates';

const tabs = ["Generate", "Settings"]


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
  const { draftParagraphs, setDraftParagraphs } = useParagraphs(pageUrl);
  const [warnings, setWarnings] = useState<string[]>([]);
  const {
    LLMExtractions,
    setLLMExtractions,
    extractions,
    setExtractions,
    pageData,
    setPageData
  } = useExtractions(pageUrl)

  const [activeTab, setActiveTab] = useState(0)

  // const [showSaveOrAddButton, setShowSaveOrAddButton] = useState(false);
  // const [selectedTemplate, setSelectedTemplate] = useState("new_template");
  // const [newTemplateName, setNewTemplateName] = useState("");
  // const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [showSaveToExistingTemplateButton, setShowSaveToExistingTemplateButton] = useState(false);
  pageUrl

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
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    if (browser.downloads?.download != null) {
      await browser.downloads.download({ url: blobUrl, filename: 'cover-' + (pageUrl || Math.random().toString()) });
    } else {
      setWarnings([...warnings, "Downloads API not supported"])
    }
    URL.revokeObjectURL(blobUrl);
  }


  const handleGeneratePDF = async () => {
    await downloadFile('http://localhost:3000', {
      template_vars: {},
      company: {
      }
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
      <h2>Cover Gen</h2>
      {pageUrl && <p>Current URL: {pageUrl}</p>}
      {
        warnings.length !== 0 && <div className="warnings-container">
          <h2>Warnings</h2>
          <p>This extension may not function as expected. Please notify the developer.</p>
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
          setExtractions
        }} />
      </Tab>
      <button onClick={openSettings}>Open Settings</button>
      <button onClick={reEvaluatePage}>Re-evaluate Page Content</button>
    </>
  );
}

export default App;
