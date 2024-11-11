# Cover Letter Generator
Generates a pdf cover letter unique for each company based on matching keywords from the job description and closure-styled templating.

## Setup
0. Ensure Python is installed
1. Install LaTeX:
   - For Ubuntu/Debian: `sudo apt-get install texlive-full`
   - For macOS: Install MacTeX from https://tug.org/mactex/
   - For Windows: Install MiKTeX from https://miktex.org/download
2. Setup Python virtual environment
```bash
python -m venv env
source env/bin/activate  # For Unix/macOS
# OR
.\env\Scripts\activate  # For Windows

```
2. Create a paragraphs.txt file in the template directory (optionally copy from paragraphs.example.txt)
3. Setup cover.tex and resume.tex with your information (optionally copy from cover.example.tex and resume.example.tex)

4. Run the script with `python apply.py`

