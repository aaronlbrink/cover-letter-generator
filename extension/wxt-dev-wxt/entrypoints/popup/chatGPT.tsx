
export async function haveLLMParsePage(page: string, keys: string[]) {

  try {
    // Send to local LLM
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: `Extract the following information from this job posting and return it as JSON with these keys: ${JSON.stringify(keys)}. Here's the content: ${page}`
        }],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      })
    });

    const llmResponse = await response.json();
    let parsedData = llmResponse.choices[0].message.content;
    // DEBUG WITH THIS:
    //           let parsedData = `{
    //     "role": "Software Engineer",
    //     "company_name": "Adobe",
    //     "company_address": "San Francisco",
    //     "skills_required": [
    //         "Python",
    //         "Java",
    //         "C++",
    //         "Machine Learning Concepts and practices"
    //     ]
    // }`
    // Remove any markdown code block syntax and extract just the JSON
    let cleanedData = parsedData;
    if (typeof parsedData === 'string') {
      // Remove markdown code blocks if present
      cleanedData = parsedData.replace(/^.*?```(?:json)?|```[\s\S]*$/g, '').trim();
      console.log(cleanedData);
      // Parse the cleaned string to validate JSON
      try {
        console.log("2");
        cleanedData = JSON.parse(cleanedData);
        console.log("parsed well!")
        // Define expected schema keys

        // Validate and transform data to match schema
        const validatedData = Object.fromEntries(
          keys.map(key => [
            key,
            // Ensure key exists and convert value to string
            cleanedData[key] ? String(cleanedData[key]) : ''
          ])
        );
        console.log("3");
        cleanedData = validatedData;
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error('Invalid JSON format received');
      }
    }
    console.log("4");
    // Validate against required schema
    // const requiredFields = ['role', 'company_name', 'company_address', 'skills_required'];
    const missingFields = keys.filter(field => !(field in cleanedData));

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Update parsedData with the cleaned and validated data
    return cleanedData;
  } catch (e) {
    console.log("GPT Failed");
    console.log(e)
  }
}