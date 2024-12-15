import { coverTemplates } from '../utils/storage';
import { ITemplate } from '../utils/types';

export function useTemplates() {
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("new_template");
  const [newTemplateName, setNewTemplateName] = useState("");

  useEffect(() => {
    const loadTemplateOptions = async () => {
      const savedTemplates = await coverTemplates.getValue();
      setTemplates(savedTemplates || []);
    };

    const unwatch = storage.watch<ITemplate[]>('local:coverTemplates', (newTemplates, oldTemplates) => {
      console.log('Templates changed:', { newTemplates, oldTemplates });
      setTemplates(newTemplates || []);
      // Select the newly added template by finding the one that wasn't in oldTemplates
      // const newTemplate = newTemplates?.find(t => !oldTemplates?.some(ot => ot.name === t.name));
      // setSelectedTemplate(newTemplate?.name || "new_template");
    });

    loadTemplateOptions();
    return () => unwatch();
  }, []);


  // Debounced save effect
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!templates) return;
      await coverTemplates.setValue(templates);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [templates]);


  return {
    templates,
    setTemplates,
    selectedTemplate,
    setSelectedTemplate,
    newTemplateName,
    setNewTemplateName
  };
}