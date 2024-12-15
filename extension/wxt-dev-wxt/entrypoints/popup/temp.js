
function fillInClosures() {
  const regex = /{{(.*?)}}/g;
  const draftParagraphClosures = [];
  let match;
  while ((match = regex.exec(draftParagraphs)) !== null) {
    if (!closures[match[1]]) {
      // Closure not found! (TODO) Maybe notify
    }
    draftParagraphClosures.push({ key: match[1], value: closures[match[1]] });
  }
  console.log("matches")
  console.log(draftParagraphClosures)
  for (const closure of draftParagraphClosures) {
    let stack = [];
    // initial:
    while ((match = regex.exec(closure.value)) !== null) {
      if (closures[match[1]]) {
        stack.push(match[1])
      }

      while (stack.length > 0) {
        const item = stack.pop()
        let match;
        if (item && closures[item]) {
          let matches = []
          while ((match = regex.exec(closures[item])) !== null) {
            if (closures[match[1]]) {
              stack.push(match[1])
              matches.push(match)
            }
          }
          if (matches.length === 0) {
            // leaf!
          }
        }
      }
    }
  }
}