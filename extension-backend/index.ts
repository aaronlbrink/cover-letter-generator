import bodyParser from "body-parser";
import express, { Request, Response } from "express";

const app = express()
app.use(bodyParser.json())
const port = process.env.PORT || 3000;

// Attribution: https://stackoverflow.com/a/47655913/2930176
let runPython = function (pythonJsonArg: string) {
  return new Promise(function (success, nosuccess) {
    const { spawn } = require('child_process');
    const pyprog = spawn('python', ['./../backend_gen.py', pythonJsonArg]);

    pyprog.stdout.on('data', function (data: any) {
      success(data);
    });

    pyprog.stderr.on('data', (data: any) => {
      nosuccess(data);
    });
  });
}



app.post('/', async (req: Request, res: Response) => {
  console.log(req.body)
  await runPython(JSON.stringify(req.body))
    .then(function (fromRunpy: any) {
      console.log('here')
      console.log(fromRunpy.toString());
      res.end(fromRunpy);
    });
  // res.download('./file.pdf')

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
