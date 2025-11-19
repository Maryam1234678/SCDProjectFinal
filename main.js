const readline = require('readline');
const db = require('./db');
require('./events/logger'); // Initialize event logger

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
function searchRecords() {
  rl.question('Enter search keyword: ', keyword => {
    if (!keyword.trim()) {
      console.log(' Please enter a valid search term.');
      menu();
      return;
    }
    
    const records = db.listRecords();
    const matches = records.filter(r => 
      r.name.toLowerCase().includes(keyword.toLowerCase()) ||
      r.id.toString().includes(keyword)
    );
    
    if (matches.length === 0) {
      console.log(' No records found.');
    } else {
      console.log(`\n Found ${matches.length} matching record(s):`);
      matches.forEach((r, idx) => {
        const created = new Date(r.id).toISOString().split('T')[0];
        console.log(`${idx + 1}. ID: ${r.id} | Name: ${r.name} | Created: ${created}`);
      });
    }
    menu();
  });
}

function menu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Exit
=====================
  `);

  rl.question('Choose option: ', ans => {
    switch (ans.trim()) {
      case '1':
        rl.question('Enter name: ', name => {
          rl.question('Enter value: ', value => {
            db.addRecord({ name, value });
            console.log(' Record added successfully!');
            menu();
          });
        });
        break;

      case '2':
        const records = db.listRecords();
        if (records.length === 0) console.log('No records found.');
        else records.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`));
        menu();
        break;

      case '3':
        rl.question('Enter record ID to update: ', id => {
          rl.question('New name: ', name => {
            rl.question('New value: ', value => {
              const updated = db.updateRecord(Number(id), name, value);
              console.log(updated ? ' Record updated!' : ' Record not found.');
              menu();
            });
          });
        });
        break;

      case '4':
        rl.question('Enter record ID to delete: ', id => {
          const deleted = db.deleteRecord(Number(id));
          console.log(deleted ? ' Record deleted!' : ' Record not found.');
          menu();
        });
        break;

      case '5':
        searchRecords();
        break;
      case '6':
        console.log(' Exiting NodeVault...');
        rl.close();
        break;

      default:
        console.log('Invalid option.');
        menu();
    }
  });
}

menu();
