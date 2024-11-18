#!/usr/bin/env python3
import os
import shutil
import string
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Tuple

from dotenv import load_dotenv


@dataclass
class CompanyDetails:
  company_name: str
  recruiters_name: str = "Hiring Manager"
  recruiters_title: str = ""
  company_address_ln1: str = ""
  company_address_ln2: str = ""
  role: str = ""
  res_title: str = ""


def gen_pdf(doc_filepath: Path, company_dirpath: Path) -> Path:
  """Generate PDF from tex file"""
  filename = doc_filepath.stem
  file_dir = doc_filepath.parent
  subprocess.run([
      'pdflatex',
      '-file-line-error',
      '-output-directory', str(file_dir),
      str(doc_filepath)
  ], capture_output=False)
  output_base = file_dir / filename
  for ext in ['.pdf', '.tex']:
    shutil.move(str(output_base) + ext, company_dirpath)
  return company_dirpath / f"{filename}.tex"


RES_TITLE_OPTIONS = [
    "Front End Developer",
    "Full Stack Engineer",
    "Software Developer",
    "Backend Developer",
    "Mobile Engineer"
]


def get_recent_companies(limit: int = 8) -> list[Path]:
  """Get most recently created company directories"""
  dirs = []
  for dir_path in COMPANIES_DIR.glob("*/"):
    if dir_path.is_dir():
      dirs.append((dir_path.stat().st_ctime, dir_path))

  return [d[1] for d in sorted(dirs, reverse=True)[:limit]]


def create_company_dir(company_name: str) -> Path:
  """Create and return company directory path"""
  dir_name = company_name.lower().replace(' ', '-')
  company_dir = COMPANIES_DIR / dir_name
  if company_dir.exists():
    counter = 1
    while (COMPANIES_DIR / f"{dir_name}_{counter}").exists():
      counter += 1
    company_dir = COMPANIES_DIR / f"{dir_name}_{counter}"

  company_dir.mkdir(parents=True)
  (company_dir / "temp").mkdir()
  return company_dir


def setup_documents(temp_dir: Path) -> Tuple[Path, Path]:
  """Setup and return paths for cover letter and resume"""
  # Copy templates
  cover_path = temp_dir / "cover-letter.tex"
  resume_path = temp_dir / "resume.tex"

  shutil.copy(TEMPLATE_DIR / "cover.tex", cover_path)
  shutil.copy(TEMPLATE_DIR / "resume.tex", resume_path)

  return cover_path, resume_path


def comma_seperated_string(array: list[str]) -> str:
  return ", ".join(str(_) for _ in array)


def comma_seperated_string_with_and(items: list[str]) -> str:
  if not items:
    return ""
  elif len(items) == 1:
    return items[0]
  elif len(items) == 2:
    return " and ".join(items)
  else:
    return ", ".join(items[:-1]) + " and " + items[-1]


@dataclass
class Document:
  header: str
  salutation: str
  body: str

  def add_salutation(self, recruiters_name):
    self.salutation = f"Dear {recruiters_name},"

  def add_paragraph(self, text: str) -> str:
    self.body += text + "\\bigskip\n\\\\"

  def add_header(
      self,
      date,
      recruiters_name,
      recruiters_title,
      company_name,
      address_line_1,
      address_line_2,
  ):
    self.header += (
        "\\bigskip \\\\" + date + "\\bigskip \n\\\\\n"
        + (recruiters_name + " \\newline\n" if recruiters_name else "")
        + (recruiters_title + " \\newline\n" if recruiters_title else "")
        + (company_name + " \\newline\n" if company_name else "")
        + (address_line_1 + " \\newline\n" if address_line_1 else "")
        + (address_line_2 + " \\newline\n" if address_line_2 else "")
    )

  def doc_to_latax(self):
    return (
        self.header
        + "\\bigskip\n\\\\"
        + self.salutation
        + "\\bigskip\n\\\\ \\bigskip\n\\\\"
        + self.body
    )


def find_relevant_attributes(
    attributes: dict[str, list[list[str]]], job_description: str
) -> dict[str, list]:
  all_relevant_attributes = {}
  job_description_lc = job_description.lower()
  for attr_category in attributes:
    rel_attr_in_category = []
    for tool_spellings in attributes[attr_category]:
      for tool in tool_spellings:
        if tool.lower() in job_description_lc:
          rel_attr_in_category.append(tool)
          break
    # Default (if no matches)
    if len(rel_attr_in_category) == 0:
      for tool_spellings in attributes[attr_category]:
        for tool in tool_spellings:
          rel_attr_in_category.append(tool)
          break
    all_relevant_attributes[attr_category] = rel_attr_in_category
  return all_relevant_attributes


def process_closures(details: CompanyDetails, cl_path: Path, res_path: Path):
  """Process document closures with company details"""
  # Create closure string for Python processor
  closures = [
      details.recruiters_name,
      details.recruiters_title,
      details.company_name,
      details.company_address_ln1,
      details.company_address_ln2,
      details.role,
      datetime.now().strftime("%b %-d, %Y"),
      details.res_title,
      str(cl_path)
  ]

  # Process closures directly instead of calling closure.py
  res_title_options = {
      "Front End Developer": 0,
      "Full Stack Engineer": 1,
      "Software Developer": 2,
      "Backend Developer": 3,
      "Mobile Engineer": 4,
  }
  stack_role = {
      0: "front end",
      1: "full stack",
      2: "software developer",
      3: "backend",
      4: "mobile engineer",
  }
  res_title_by_index = res_title_options[closures[7]]

  print("Enter/Paste your job description. Ctrl-D or Ctrl-Z ( windows ) to save it.")
  jobdesc = []
  while True:
    try:
      line = input()
    except EOFError:
      break
    jobdesc.append(line)
  jobdesc = " ".join(jobdesc)
  jobdesc = " ".join(jobdesc.split())
  jobdesc = "".join((x for x in jobdesc if x not in string.punctuation))
  jobdesc = jobdesc.lower()

  possibly_relevant_attributes: dict[str, list[list[str]]] = {
      "methodologies": [["scrum", "agile"]],
      "frontend": [
          ["React", "React.JS"],
          ["TypeScript"],
          ["JavaScript"],
          ["CSS", "HTML/CSS"],
      ],
      "backend": [["Node", "Node.JS", "NodeJS"], ["Express"]],
      "cloud_providers": [
          ["AWS", "Amazon Web Services"],
          ["S3"],
          ["Google Cloud Engine", "GKE"],
      ],
      "deploying": [["Docker"], ["Amplify"]],
      "mobile": [["React Native"], ["Expo"]],
  }
  attr = find_relevant_attributes(possibly_relevant_attributes, jobdesc)

  fe_tools = attr.get("frontend", ["React"])
  be_tools = attr.get("backend", ["Node.js"])
  moble_tools = attr.get("mobile", ["React Native"])
  sdlc_tools = attr.get("methodologies", ["Agile"])
  deploy_tools = attr.get("deploying", ["Docker"])
  cloud_providers = attr.get("cloud_providers", ["AWS"])

  phrases_by_role = [
      f"on the front end with {comma_seperated_string(fe_tools[:4])}",
      f"full stack applications in {comma_seperated_string_with_and( fe_tools + be_tools )}",
      f"on the back end with {comma_seperated_string_with_and(be_tools[:3])}",
      f"web applications with {comma_seperated_string_with_and(be_tools)}",
      f"for mobile using {comma_seperated_string_with_and(moble_tools[:3])}",
  ]
  stack_phrase = phrases_by_role[res_title_by_index]

  sdlc_method = "including " + comma_seperated_string(sdlc_tools)

  deploy_tooling_phrase = ""
  if len(deploy_tools) != 0:
    deploy_tooling_phrase = f" using {comma_seperated_string_with_and(deploy_tools[:3])}"

  doc = Document("", "", "")
  doc.add_header(
      closures[6],
      closures[0],
      closures[1],
      closures[2],
      closures[3],
      closures[4]
  )
  doc.add_salutation(closures[0])

  # Read paragraphs from file and format with variables
  try:
    with open(PARAGRAPHS_FILE) as f:
      paragraphs = [p for p in f.read().split("\n\n") if p.strip()]
  except FileNotFoundError:
    print(f"Error: {PARAGRAPHS_FILE} not found")
    sys.exit(1)

  template_vars = {
      "role": closures[5],
      "app_type": "web" if not res_title_by_index == 4 else "mobile",
      "stack_phrase": stack_phrase,
      "cloud_providers": cloud_providers,
      "deploy_tooling": deploy_tooling_phrase,
      "stack_role": stack_role[res_title_by_index],
      "sdlc_method": sdlc_method,
      "deploy_tooling_phrase": deploy_tooling_phrase,
      "company_name": closures[2],
  }

  # Get additional inputs
  mission_verb = input("Provide the company's mission verb: to...")
  template_vars["mission_verb"] = mission_verb or "aim"

  mission = input("Provide the company's mission: to...")
  template_vars["mission"] = mission

  product = input(
      "Provide a new product launched by the company: product name: ")
  template_vars["product"] = product

  # Add formatted paragraphs
  for paragraph in paragraphs:
    doc.add_paragraph(paragraph.format_map(template_vars))

  # Replace the keyword with the generated letter
  with open(cl_path, "r") as file:
    file_contents = file.read()
  modified_contents = file_contents.replace("(LETTER)", doc.doc_to_latax())
  with open(cl_path, "w") as file:
    file.write(modified_contents)


def add_company():
  """Add new company workflow"""
  # Get company details
  details = CompanyDetails(
      company_name=input("Company Name: ").strip(),
      recruiters_name=input(
          "Recruiter's name [Hiring Manager]: ").strip() or "Hiring Manager",
      recruiters_title=input("Recruiter's title (optional): ").strip(),
      company_address_ln1=input("Company address line 1 (optional): ").strip(),
      company_address_ln2=input("Company address line 2 (optional): ").strip(),
      role=input("Role title: ").strip()
  )

  # Get resume title selection
  print("\nWhich title would you like to use on your resume?")
  for i, title in enumerate(RES_TITLE_OPTIONS, 1):
    print(f"{i}) {title}")

  while True:
    try:
      title_idx = int(input("Choose number: ")) - 1
      if 0 <= title_idx < len(RES_TITLE_OPTIONS):
        break
      print(f"Please enter a number between 1 and {len(RES_TITLE_OPTIONS)}")
    except ValueError:
      print("Please enter a valid number")
  details.res_title = RES_TITLE_OPTIONS[title_idx]
  print(f"You selected: {details.res_title}")

  # Create company directory and process documents
  company_dir = create_company_dir(details.company_name)
  temp_dir = company_dir / "temp"
  cl_path, res_path = setup_documents(temp_dir)

  # Process closures and generate PDFs
  process_closures(details, cl_path, res_path)
  gen_pdf(cl_path, company_dir)
  gen_pdf(res_path, company_dir)

  # Save company details
  with open(company_dir / "company.txt", 'w') as f:
    for field in details.__dataclass_fields__:
      f.write(f"{field}={getattr(details, field)}\n")

  log_file = os.getenv("APPLICATION_LOG_FILE")
  print(f"log file: {log_file}")
  if log_file:
    date = datetime.now().strftime("%Y-%m-%d")
    log_entry = f"{date},{details.company_name},{details.role},{details.res_title}\n"
    with open(log_file, "r+") as f:
      content = f.read()
      f.seek(0)
      f.write(log_entry + content)
# def regen():
#   """Regenerate company documents workflow"""
#   recent_companies = get_recent_companies()

#   print("Select a directory:")
#   for i, dir_path in enumerate(recent_companies):
#     print(f"{i}) {dir_path.name}")

#   selection = input("Enter selection number: ")
#   company_dir = recent_companies[int(selection)]

#   # Read company details and regenerate
#   with open(company_dir / "company.txt") as f:
#     details = {}
#     for line in f:
#       key, value = line.strip().split('=', 1)
#       details[key] = value

#   # Process documents with saved details
#   temp_dir = company_dir / "temp"
#   cl_path, res_path = setup_documents(temp_dir)
#   process_closures(CompanyDetails(**details), cl_path, res_path)

#   gen_pdf(cl_path, company_dir)
#   gen_pdf(res_path, company_dir)


def main():
  if len(sys.argv) == 2:
    if sys.argv[1] == "regen":
      print("TODO: Reimplement regen. Regen is disabled")
      # regen()
    elif sys.argv[1] == "batch":
      while True:
        add_company()
        if input("Add another? (y/n): ").lower() != 'y':
          break
  else:
    add_company()


if __name__ == "__main__":
  load_dotenv()
  COMPANIES_DIR = Path(os.getenv("APPLICATIONS_DIR"))
  TEMPLATE_DIR = Path(os.getenv("TEMPLATES_DIR"))
  PARAGRAPHS_FILE = Path(TEMPLATE_DIR / "paragraphs.txt")

  if not PARAGRAPHS_FILE.exists():
    print(f"Error: {PARAGRAPHS_FILE} not found")
    sys.exit(1)

  main()
