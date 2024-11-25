export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      if (message.type === 'GET_URL_DATA') {
        console.log("URL DATA REQUESTED", window.location.href);
        chrome.runtime.sendMessage({
          type: 'GET_URL_DATA',
          data: { url: window.location.href }
        });
      }
      if (message.type === 'GET_PAGE_DATA') {
        try {
          // TODO: Change selectors based on job board platform (Workday/Greenhouse/etc)
          // const site_domain = window.location.hostname.split('.').slice(-2)[0];
          // let pageData: object = {};
          let pageData = {
            all: document.body.innerText,
          }
          // Send parsed data back to popup
          chrome.runtime.sendMessage({
            type: 'GET_PAGE_DATA',
            data: pageData.all
          });
        } catch (error) {
          console.error('Error processing data:', error);
          chrome.runtime.sendMessage({
            type: 'GET_PAGE_DATA_ERROR',
            error: 'Failed to process page data'
          });
        }


        // if (site_domain === 'myworkdayjobs') {
        //   console.log('Workday');
        //   pageData = {
        //     only_the_domain: window.location.hostname.split('.').slice(-2)[0],
        //     title: document.title,
        //     // Add specific selectors for Workday/Greenhouse
        //     jobTitle: document.querySelector(`[data-automation-id="jobPostingHeader"]`)?.textContent,
        //     company: document.querySelector('.company-name')?.textContent,
        //     description: document.querySelector('.job-description')?.textContent,
        //   };
        // } else if (site_domain === 'greenhouse') {
        //   console.log('Workday');
        //   pageData = {
        //     only_the_domain: window.location.hostname.split('.').slice(-2)[0],
        //     title: document.title,
        //     jobTitle: document.querySelector(`[data-automation-id="jobPostingHeader"]`)?.textContent,
        //     company: document.querySelector('.company-name')?.textContent,
        //     description: document.querySelector('.job-description')?.textContent,
        //   };
        // } else {
        //   pageData = {
        //     title: document.title,
        //   }
        // }

        // Send data back to popup
        // chrome.runtime.sendMessage({
        //   type: 'PAGE_DATA',
        //   data: pageData
        // });
      }
    });
  },
});
