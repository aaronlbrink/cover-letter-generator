import bodyParser from "body-parser";
import { ExecException, spawn } from "child_process";
import express, { Request, Response } from "express";
import fsPromise from "fs/promises";
import path from "path";

const app = express()
app.use(bodyParser.json())
const port = process.env.PORT || 3000;

// Attribution: https://stackoverflow.com/a/47655913/2930176
let runPython = function (pythonJsonArg: string) {
  return new Promise(function (success, nosuccess) {
    const { spawn } = require('child_process');
    const pyprog = spawn('python', ['./backend_gen.py', pythonJsonArg]);

    pyprog.stdout.on('data', function (data: any) {
      success(data);
    });

    pyprog.stderr.on('data', (data: any) => {
      nosuccess(data);
    });
  });
}


const copyFileAsync = async (source: string, destination: string) => {
  try {
    await fsPromise.copyFile(source, destination);
    console.log('File copied successfully!');
  } catch (err) {
    console.error('Error copying file:', err);
  }
};

const replaceStringInFile = async (filePath: string, search: string, replace: string) => {
  try {
    const data = await fsPromise.readFile(filePath, 'utf8');
    const result = data.replace(new RegExp(search, 'g'), replace);
    await fsPromise.writeFile(filePath, result, 'utf8');
  } catch (err) {
    console.error('Error:', err);
  }
};

// const runPdflatex = async (fileDir, docFilePath) => {
//   return new Promise((resolve, reject) => {
//     const pdflatex = spawn('pdflatex', [
//       '-file-line-error',
//       '-output-directory', fileDir,
//       docFilePath
//     ]);

//     // Handle standard output
//     pdflatex.stdout.on('data', (data) => {
//       console.log(`stdout: ${data}`);
//     });

//     // Handle standard error
//     pdflatex.stderr.on('data', (data) => {
//       console.error(`stderr: ${data}`);
//     });

//     // Handle process exit
//     pdflatex.on('close', (code) => {
//       if (code === 0) {
//         resolve(`pdflatex process exited successfully with code ${code}`);
//       } else {
//         reject(new Error(`pdflatex process exited with code ${code}`));
//       }
//     });
//   });
// };

const cleanUpFile = async (filePath: string) => {
  try {
    await fsPromise.access(filePath);
    await fsPromise.unlink(filePath);
    console.log(`File unlinked: ${filePath}`);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log(`File does not exist: ${filePath}`);
    } else {
      console.error('Error checking or unlinking file:', error);
    }
  }
}

const generatePDF = (filePath: string, callback: (error: ExecException | null, pdfFilePath: string | null) => void) => {
  // subprocess.run([
  //     'pdflatex',
  //     '-file-line-error',
  //     '-output-directory', str(file_dir),
  //     str(doc_filepath)
  // ], capture_output=False)
  const pdfFilePath = path.join(__dirname, "output.pdf")


  const pdflatex = spawn('pdflatex', [
    '-interaction=nonstopmode',
    '-file-line-error',
    '-output-directory', path.join(__dirname),
    '-jobname', 'output',
    filePath
  ]);

  // Handle standard output
  pdflatex.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  // Handle standard error
  pdflatex.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    // You can choose to ignore specific errors or log them
  });

  // Handle process exit
  pdflatex.on('close', (code) => {
    console.log(`pdflatex process exited with code ${code}`);
    callback(null, pdfFilePath)
  });

}


app.post('/', async (req: Request, res: Response) => {
  console.log(req.body)
  // clone cover.tex into temp/cover.tex
  await copyFileAsync(
    path.join(__dirname, 'backend-cover.tex'),
    path.join(__dirname, 'temp/cover.tex')
  );

  // Replace (COVER) in temp/cover.tex with req.body.generatedParagraphs
  const coverFilePath = path.join(__dirname, 'temp/cover.tex'); // Adjust the path as needed
  await replaceStringInFile(coverFilePath, "COVER", req.body.generatedParagraphs);
  generatePDF(coverFilePath, (error, pdfFilePath) => {
    if (error) {
      console.log(error)
      return res.status(500).send("+_+_+Error creating PDF_+_+_+");
    }
    if (pdfFilePath) {
      res.download(pdfFilePath, 'output.pdf', async (err) => {
        if (err) {
          console.error("Error sending pdf: ", err)
        }
        await cleanUpFile(pdfFilePath)
        await cleanUpFile(coverFilePath)
        await cleanUpFile(path.join(__dirname, 'output.aux'))
        await cleanUpFile(path.join(__dirname, 'output.log'))
        await cleanUpFile(path.join(__dirname, 'output.out'))
      })


    }
  })



})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
