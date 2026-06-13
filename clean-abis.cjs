const fs = require('fs');
const path = require('path');

const srcDir = 'D:/MyTitan/out';
const destDir = 'D:/MyDapp1/src/abis';

const contracts = [
  "Router", "Configs", "Ledger", "Bank", "Store", "UpdateFund", 
  "AssetMaker", "Panel", "Lens", "E1", "Register", "Engine", "Activator"
];

contracts.forEach(name => {
  const p = path.join(srcDir, `${name}.sol`, `${name}.json`);
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    // Extract only the ABI and format it with 2-space indentation
    const cleanData = { abi: data.abi };
    fs.writeFileSync(
      path.join(destDir, `${name}-titan.json`), 
      JSON.stringify(cleanData, null, 2)
    );
    console.log(`Cleaned and formatted ${name}-titan.json`);
  } else {
    console.error(`Missing ${p}`);
  }
});
