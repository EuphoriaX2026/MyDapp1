const fs = require('fs');

const abisFilePaths = [
  'D:/MyDapp1/src/abis/Lens-titan.json',
  'D:/MyDapp1/src/abis/Register-titan.json',
  'D:/MyDapp1/src/abis/Panel-titan.json',
  'D:/MyDapp1/src/abis/Ledger-titan.json',
  'D:/MyDapp1/src/abis/Store-titan.json',
  'D:/MyDapp1/src/abis/Configs-titan.json',
  'D:/MyDapp1/src/abis/Engine-titan.json',
  'D:/MyDapp1/src/abis/Bank-titan.json'
];

for (const path of abisFilePaths) {
  if (fs.existsSync(path)) {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    const abi = data.abi || data;
    console.log(`\n=== Functions in ${path.split('/').pop()} ===`);
    const funcs = abi.filter(item => item.type === 'function' && (item.stateMutability === 'view' || item.stateMutability === 'pure'));
    funcs.forEach(f => {
      const inputs = f.inputs.map(i => `${i.type} ${i.name}`).join(', ');
      const outputs = f.outputs ? f.outputs.map(o => `${o.type} ${o.name || ''}`).join(', ') : '';
      console.log(` - ${f.name}(${inputs}) -> (${outputs})`);
    });
  }
}
